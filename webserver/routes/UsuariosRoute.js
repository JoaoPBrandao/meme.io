const Route = require("./Route.js");
const axios = require("axios"); // Usamos Axios para fazer as requests à API
const bcrypt = require("bcrypt");
const UsuariosController = require("../controllers/UsuariosController.js");
const SessionController = require("../controllers/SessionController.js");
const passport = require('passport');

class UsuariosRoute extends Route {
    constructor(basePath) {
        super('/usuarios');
        this.router.get('/configuracoes',SessionController.authenticationMiddleware(), async (req, res) => {
            let usuario = req.user;
            //Enviar os memes para serem exibidos nas partes do administrador
            let memes;
            await axios.get("http://localhost" + ":" + "3000" + "/memes")
                .then(apiResponse => {
                    memes = apiResponse.data;
                })
                .catch(err => console.log("Erro ao buscar memes na API."));
            res.render('configuracoes.ejs', {usuario: usuario, memes: memes});
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
            let validacaoEmailUnico = await UsuariosController.verificarEmailUnico(auxUsuario.email);
            let validacaoSenha = UsuariosController.validarSenha(auxUsuario.senha, auxUsuario.nome);
            let validacaoNome = UsuariosController.validarNome(auxUsuario.nome);
            if (!validacaoEmail){
                erros.push('Email inválido');
            }
            if(!validacaoEmailUnico){
                erros.push('Email já cadastrado');
            }
            if(!validacaoSenha){
                erros.push('Senha inválida');
            }
            if(!validacaoNome){
                erros.push('Nome inválido');
            }
            if(erros.length == 0) {
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
            const senhaAtual = req.body.senhaAtualUsuario;
            const match = await bcrypt.compare(senhaAtual, req.user.senha);
            if (match){
                axios.put("http://localhost" + ":" + "3000" + "/usuarios/desativarUsuario" + req.user._id)
                    .then(apiResponse => {
                        console.log("Resposta da API: " + apiResponse.data);
                        res.redirect('logout');
                    })
                    .catch(err => {
                        console.log("Erro ao desativar o usuário");
                        res.redirect('configuracoes');
                    })
            }else{
                console.log("Senha inserida não coincide com a senha salva.");
                //TODO: RENDER ERROR FLASH MESSAGE
                res.redirect('configuracoes');
            }
        });

        this.router.post('/atualizarNome', SessionController.authenticationMiddleware(), async (req,res) => {
            const nome = req.body.novoNome;
            if (UsuariosController.validarNome(nome)){
                axios.put("http://localhost" + ":" + "3000" + "/usuarios" + "/atualizarNome" + req.user._id, {novoNome: nome})
                    .then((apiResponse) => {
                        console.log("Resposta da API: " + apiResponse.status);
                        res.redirect('configuracoes');
                    })
                    .catch(err => {
                        console.log("Erro ao atualizar nome: " + err.message);
                        res.status(400).send("Erro ao atualizar nome.");
                    })
            }else{
                res.redirect('configuracoes');
                //TODO: DISPLAY ERROR FLASH MESSAGE
            }
        });

        this.router.post('/atualizarEmail', SessionController.authenticationMiddleware(), async (req,res) => {
            const email = req.body.novoEmail;
            if (UsuariosController.verificarEmailUnico(email) && UsuariosController.validarEmail(email)){
                axios.put("http://localhost" + ":" + "3000" + "/usuarios" + "/atualizarEmail" + req.user._id, {novoEmail: email})
                    .then((apiResponse) => {
                        console.log("Resposta da API: " + apiResponse.status);
                        res.redirect('configuracoes');
                    })
                    .catch(err => {
                        console.log("Erro ao atualizar E-mail: " + err.message);
                        res.status(400).send("Erro ao atualizar E-mail.");
                    })
            }else{
                res.redirect('configuracoes');
                //TODO: DISPLAY ERROR FLASH MESSAGE
            }
        });

        this.router.post('/atualizarSenha', SessionController.authenticationMiddleware(), async (req,res) => {
            const senhaAtual = req.body.senhaAtualUsuario;
            let novaSenha = req.body.novaSenhaUsuario;
            const match = await bcrypt.compare(senhaAtual, req.user.senha);
            if (UsuariosController.validarSenha(novaSenha) && match){
                let salt = bcrypt.genSaltSync(10);
                let hash = bcrypt.hashSync(novaSenha, salt);
                novaSenha = hash;
                axios.put("http://localhost" + ":" + "3000" + "/usuarios" + "/atualizarSenha" + req.user._id, {novaSenha: novaSenha})
                    .then((apiResponse) => {
                        console.log("Resposta da API: " + apiResponse.status);
                        res.redirect('configuracoes');
                    })
                    .catch(err => {
                        console.log("Erro ao atualizar senha: " + err.message);
                        res.status(400).send("Erro ao atualizar E-mail.");
                    })
            }else{
                res.redirect('configuracoes');
                //TODO: DISPLAY ERROR FLASH MESSAGE
            }
        });

        this.router.post('/logarUsuario', passport.authenticate('local'), (req, res) =>{
            if (req.user.status == 1){
                console.log("entrou no if");
                axios.put("http://localhost" + ":" + "3000" + "/usuarios" + "/reativarUsuario" + req.user._id)
                    .then(apiResponse => {
                        console.log("Resposta da API: " + apiResponse.data);
                    })
                    .catch(err=>{
                        console.log("Erro: " + err.message);
                    })
            }
            res.redirect('perfilUsuario');
        })

        this.router.get('/logout', (req, res) =>{
            req.logout();
            res.redirect('/');
        });
    }

}

module.exports = UsuariosRoute;