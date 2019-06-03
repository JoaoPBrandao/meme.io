const Route = require("./Route.js");
const axios = require("axios"); // Usamos Axios para fazer as requests à API
const bcrypt = require("bcrypt");
const UsuariosController = require("../controllers/UsuariosController.js");
const SessionController = require("../controllers/SessionController.js");
const passport = require('passport');

class UsuariosRoute extends Route {
    constructor(basePath) {
        super('/usuarios');
        //ROTA QUE LEVA PARA A PÁGINA DE CONFIGURAÇÕES
        this.router.get('/configuracoes',SessionController.authenticationMiddleware(), async (req, res) => {
            let usuario = req.user;
            //Enviar os administradores para serem exibidos nas partes do administrador
            let administradores = [];
            await axios.get("http://localhost" + ":" + "3000" + "/usuarios/administradores")
                .then(apiResponse => {
                    administradores = apiResponse.data;
                })
                .catch(err => {
                    console.log("Erro ao buscar administradores na API.");
                });
            //Enviar os memes para serem exibidos nas partes do administrador
            let memes;
            await axios.get("http://localhost" + ":" + "3000" + "/memes")
                .then(apiResponse => {
                    memes = apiResponse.data;
                })
                .catch(err => console.log("Erro ao buscar memes na API."));
            let sugestoes;
            await axios.get("http://localhost" + ":" + "3000" + "/memes/sugestoes")
                .then(apiResponse => {
                    sugestoes = apiResponse.data;
                })
                .catch(err => console.log("Erro ao buscar sugestoes na API."));
            res.render('configuracoes.ejs', {usuario: usuario, memes: memes, administradores: administradores, sugestoes: sugestoes});
        });
        //ROTA QUE LEVA PARA A PÁGINA DE CADASTRO DO USUÁRIO
        this.router.get('/cadastro', (req, res) => {
            res.render('cadastro.ejs');
        });
        //ROTA QUE LEVA PARA A PÁGINA DE PERFIL DO USUÁRIO
        this.router.get('/perfilUsuario',SessionController.authenticationMiddleware(), async (req, res) => {
            let usuario;
            if (req.query.usuario == req.user.email){
                usuario = req.user;
                res.render('perfil.ejs', {usuarioVisitado: usuario, usuarioSessao: usuario});
            }else{
                await axios.get("http://localhost" + ":" + "3000" + "/usuarios/buscarUsuario" + req.query.usuario)
                    .then(apiResponse => {
                        console.log("Usuário encontrado com sucesso.");
                        usuario = apiResponse.data;
                        res.render('perfil.ejs', {usuarioVisitado: usuario, usuario: req.user});
                    })
                    .catch(err => {
                        console.log("Erro ao buscar usuário.");
                        res.redirect('configuracoes');
                    });
            }
        });
        //ROTA QUE REALIZA A BUSCA DOS USUÁRIOS DO SISTEMA
        this.router.get('/buscarUsuarios',SessionController.authenticationMiddleware(), async (req, res) => {
            let emailUsuario = req.query.emailUsuario;
            let usuarioBuscado;
            // TODO: Fazer endpoint na API que busca só por usuários ativos e usá-lo aqui.
            await axios.get("http://localhost" + ":" + "3000" + "/usuarios/buscarUsuario" + emailUsuario)
                .then(apiResponse => {
                    usuarioBuscado = apiResponse.data;
                    res.render('buscaDeUsuarios.ejs', {usuarioBuscado: usuarioBuscado});
                })
                .catch(err => {
                    //TODO: RENDER ERROR FLASH MESSAGE
                    console.log("Erro ao buscar usuário.");
                    res.render(process.cwd() + '/views/perfil.ejs', {usuario: req.user});
                });
        });
        //ROTA QUE CRIA UM NOVO USUÁRIO
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
        //ROTA QUE DESATIVA USUÁRIOS
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
        //ROTA QUE BANE UM USUÁRIO
        this.router.post('/banirUsuario', async (req, res) => {
            const emailUsuario = req.body.emailUsuario;
            await axios.put("http://localhost" + ":" + "3000" + "/usuarios" + "/banirUsuario" + emailUsuario)
                .then(apiResponse => {
                    res.redirect('configuracoes');
                })
                .catch(err => {
                    console.log("Erro ao banir usuário");
                    res.redirect('configuracoes');
                });
        });
        //ROTA QUE ATUALIZA O NOME DE UM USUÁRIO
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
        //ROTA QUE ATUALIZA O E-MAIL DE UM USUÁRIO
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
        //ROTA QUE ATUALIZA A SENHA DE UM USUÁRIO
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
        //ROTA QUE CONCEDE PRIVILÉGIOS DE ADMINISTRADOR A UM USUÁRIO
        this.router.post('/concederPrivilegios', async (req, res) => {
                await axios.put("http://localhost" + ":" + "3000" + "/usuarios" + "/concederPrivilegios" + req.body.emailUsuario)
                    .then(apiResponse => {
                        //TODO: RENDER SUCCESS FLASH MESSAGE
                        console.log("Privilégios concedidos com sucesso!");
                        res.redirect('configuracoes');
                    })
                    .catch(err => {
                        //TODO: RENDER ERROR FLASH MESSAGE
                        console.log("Erro ao conceder privilégios!");
                        console.log(err.message);
                        res.redirect('configuracoes');
                    })
        });

        //ROTA QUE REVOGA PRIVILÉGIOS DE ADMINISTRADOR DE UM USUÁRIO
        this.router.post('/revogarPrivilegios', async (req, res) => {
            await axios.put("http://localhost" + ":" + "3000" + "/usuarios" + "/revogarPrivilegios" + req.body.emailAdm)
                .then(apiResponse => {
                    console.log("Privilégios revogados com sucesso.");
                    res.redirect('configuracoes');
                })
                .catch(err => {
                    console.log("Erro ao revogar privilégios.");
                    console.log(err.message);
                    res.redirect('configuracoes');
                });
        })
        //ROTA QUE REALIZA O LOGIN DE UM USUÁRIO
        this.router.post('/logarUsuario', passport.authenticate('local',{ failureRedirect: '/'}), (req, res) =>{
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
            res.redirect('/');
        });
        //ROTA QUE REALIZA O LOGOUT DE UM USUÁRIO
        this.router.get('/logout', (req, res) =>{
            req.logout();
            res.redirect('/');
        });
    }

}

module.exports = UsuariosRoute;