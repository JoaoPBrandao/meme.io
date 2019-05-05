const Route = require("./Route.js");
const axios = require("axios"); // Usamos Axios para fazer as requests à API
const bcrypt = require("bcrypt");
const UsuariosController = require("../controllers/UsuariosController.js");
const SessionController = require("../controllers/SessionController.js");
const passport = require('passport');

class UsuariosRoute extends Route {
    constructor(basePath) {
        super('/usuarios');
        this.router.get('/dadospessoais',SessionController.authenticationMiddleware(), (req, res) => {
            let usuario = req.user;
            res.render('dadospessoais.ejs', usuario);
        });

        this.router.get('/cadastro', (req, res) => {
            res.render('cadastro.ejs');
        });

        this.router.get('/perfilUsuario',SessionController.authenticationMiddleware(), (req, res) => {
            let usuario = req.user;
            res.render('perfil.ejs', usuario);
        });

        this.router.get('/buscarUsuarios',SessionController.authenticationMiddleware(), async (req, res) => {
            let query = req.query.emailUsuario;
            let usuarios = [];
            // TODO: Fazer endpoint na API que busca só por usuários ativos e usá-lo aqui.
            await axios.get("http://localhost" + ":" + "3000" + "/usuarios?email=" + query)
                .then(apiResponse => {
                    usuarios = apiResponse.data;
                });
            res.render('buscaDeUsuarios.ejs', {usuarios});
        });

        this.router.post('/novoUsuario', async (req,res) => {
            let auxUsuario = {};
            let erros = [];
            auxUsuario.nome = req.body.nomeUsuario;
            auxUsuario.email = req.body.emailUsuario;
            auxUsuario.senha = req.body.senhaUsuario;
            let validacaoEmail = UsuariosController.validarEmail(auxUsuario.email);
            console.log("val Email -> " + validacaoEmail);
            let validacaoEmailUnico = await UsuariosController.verificarEmailUnico(auxUsuario.email);
            console.log("val EmailUnico -> " + validacaoEmailUnico);
            let validacaoSenha = UsuariosController.validarSenha(auxUsuario.senha, auxUsuario.nome);
            console.log("val Senha -> " + validacaoSenha);
            let validacaoNome = UsuariosController.validarNome(auxUsuario.nome);
            console.log("val Nome -> " + validacaoNome);
            if (!validacaoEmail){
                erros.push('Email inválido');
            }
            if(!validacaoEmailUnico){
                erros.push('Email já cadastrado');
                console.log(erros.length);
            }
            if(!validacaoSenha){
                erros.push('Senha inválida');
            }
            if(!validacaoNome){
                erros.push('Nome inválido');
            }
            console.log("erros length: " + erros.length);
            console.log(erros);
            if(erros.length == 0) {
                console.log("enviando Post para /usuarios");
                // Encryptando senha:
                let salt = bcrypt.genSaltSync(10);
                let hash = bcrypt.hashSync(auxUsuario.senha, salt);
                auxUsuario.senha = hash;
                axios.post("http://localhost" + ":" + "3000" + "/usuarios", auxUsuario)
                    .then((apiResponse) => {
                        console.log("Resposta da API: " + apiResponse.status);
                        res.render(process.cwd() + '/views/login.ejs', {}); // TODO: RENDER success FLASH MESSAGE
                    })
                    .catch((err) => {
                        console.log(err);
                    });
            }
            else{
                res.render(process.cwd() + '/views/cadastro.ejs', {erros: erros,
                    nome: auxUsuario.nome,
                    senha: auxUsuario.senha,
                    email: auxUsuario.email});
            }
        });

        this.router.post('/desativarUsuario',SessionController.authenticationMiddleware(), async (req,res) => {
            let auxUsuario = {};
            auxUsuario.emailUsuario = req.body.emailUsuario;
            console.log(req.body);
            if(!auxUsuario.emailUsuario) {
                console.log("Email não recebido.");
                res.status(300).render(process.cwd() + '/views/dadospessoais.ejs', {}); // TODO: RENDER error FLASH MESSAGE
                return;
            }
            auxUsuario = await UsuariosController.buscarUsuarioAtivo(auxUsuario.emailUsuario).catch(err => {
                res.status(500).send("Usuário não encontrado ou não ativo." + err)
                return;
            });
            if(!auxUsuario) {
                res.status(500).send("Usuário não encontrado ou não ativo.");
                return;
            }
            auxUsuario = JSON.parse(auxUsuario);
            axios.delete("http://localhost" + ":" + "3000" + "/usuarios/" + auxUsuario._id)
                .then((apiResponse) => {
                    console.log("Resposta da API: " + apiResponse.status);
                    res.render(process.cwd() + '/views/login.ejs', {}); // TODO: RENDER success FLASH MESSAGE
                })
                .catch((err) => {
                    console.log(err.data);
                });
        });

        this.router.post('/atualizarUsuario',SessionController.authenticationMiddleware(), async (req,res) => {
            let auxUsuario = {};
            // Abaixo as informações "novas" enviadas pelo client.
            auxUsuario.novoNome = req.body.novoNomeUsuario;
            auxUsuario.novaSenha = req.body.novaSenhaUsuario;
            auxUsuario.novoEmail = req.body.novoEmailUsuario;
            auxUsuario.email = req.body.emailUsuario;
            auxUsuario.original = await UsuariosController.buscarUsuario(auxUsuario.email);
            auxUsuario.original = JSON.parse(auxUsuario.original);
            if(auxUsuario.original._id) {
                let erros = [];
                if (!UsuariosController.validarSenha(auxUsuario.novaSenha, auxUsuario.novoNome)) {
                    console.log("Erro Validar senha");
                    erros.push('Senha inválida');
                }
                if (!UsuariosController.validarNome(auxUsuario.novoNome)) {
                    console.log("Erro Validar nome");
                    erros.push('Nome inválido');
                }
                if (erros.length == 0) {
                    axios.put("http://localhost" + ":" + "3000" + "/usuarios/" + auxUsuario.original._id, auxUsuario)
                        .then((apiResponse) => {
                            console.log("Resposta da API: " + apiResponse.status);
                            res.render(process.cwd() + '/views/dadospessoais.ejs', {}); // TODO: RENDER success FLASH MESSAGE
                        })
                        .catch((err) => {
                            console.log(err);
                        });
                }
            }
            else {
                res.status(500).send("Usuário não encontrado.");
            }
        });

        this.router.post('/logarUsuario',
            passport.authenticate('local', {
                successRedirect: 'http://localhost:8080/usuarios/perfilUsuario',
                failureRedirect: 'http://localhost:8080/login' })
        );

        this.router.get('/logout', (req, res) =>{
            req.logout();
            res.redirect('/');
        });
    }

}

module.exports = UsuariosRoute;