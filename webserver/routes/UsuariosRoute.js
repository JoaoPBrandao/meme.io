const Route = require("./Route.js");
const axios = require("axios"); //Usamos Axios para fazer as requests à API
const bcrypt = require("bcrypt"); //Usamos o Bcrypt para encriptar a senha do usuário
const UsuariosController = require("../controllers/UsuariosController.js");
const SessionController = require("../controllers/SessionController.js");
const passport = require('passport'); //Usamos o passport pra fazer a autenticação
const uuid = require('uuid/v1');
const date = require('date-and-time');
const apiKeys = require('../configs/apiKeys'); //Arquivo com as chaves das APIs utilizadas
const nodemailer = require("nodemailer");
const { google } = require("googleapis");
const OAuth2 = google.auth.OAuth2;
const rota = require('../configs/rota');
const multer  = require('multer'); //Usamos o Multer para parsear formuláros do tipo multipart/form-data
const fs = require('fs'); //FileSystem padrão do Node
const stream = require('getstream'); //Usamos o GetStream para implementar a funcionalidade do feed
//Conectar ao client do GetStream:
const client = stream.connect('55j5n3pfjx3u', '29kr9qdxat6gx4uw5d53sg3akbymwf7qcs85252bmhakxt426zjxctaaah3j9hdr', '54136');

//Configurar aspectos específicos do Multer
const storage = multer.diskStorage({
    //Mudando o destino para salvar as fotos enviadas pro webServer
    destination: function (req, file, cb) {
        cb(null, 'static/media/userPhotos')
    },
    //Configurando para que o nome da foto salva no servidor seja igual ao nome original
    filename: function (req, file, cb) {
        cb(null, file.originalname)
    }
});
const upload = multer({storage: storage});

class UsuariosRoute extends Route {
    constructor(basePath) {
        super('/usuarios');
        //ROTA QUE LEVA PARA A PÁGINA DE CONFIGURAÇÕES
        this.router.get('/configuracoes',SessionController.authenticationMiddleware(), async (req, res) => {
            let usuario = req.user;
            //Enviar os administradores para serem exibidos nas partes do administrador
            let administradores = [];
            await axios.get(rota + "/usuarios?adm=1")
                .then(apiResponse => {
                    administradores = apiResponse.data;
                })
                .catch(err => {
                    console.log("Erro ao buscar administradores na API.");
                });
            //Enviar as denúncias para serem exibidas nas partes do administrador
            let denuncias = [];
            await axios.get(rota + "/posts/denuncias")
                .then(apiResponse => {
                    denuncias = apiResponse.data;
                })
                .catch(err => {
                    console.log("Erro ao buscar denúncias na API.");
                });
            //Enviar os memes para serem exibidos nas partes do administrador
            let memes;
            await axios.get(rota + "/memes")
                .then(apiResponse => {
                    memes = apiResponse.data;
                })
                .catch(err => console.log("Erro ao buscar memes na API."));
            let sugestoes;
            await axios.get(rota + "/memes/sugestoes")
                .then(apiResponse => {
                    sugestoes = apiResponse.data;
                })
                .catch(err => console.log("Erro ao buscar sugestoes na API."));
            res.render('configuracoes.ejs', {usuario: usuario, memes: memes, administradores: administradores, sugestoes: sugestoes, denuncias: denuncias});
        });
        //ROTA QUE LEVA PARA A PÁGINA DE CADASTRO DO USUÁRIO
        this.router.get('/cadastro', (req, res) => {
            res.render('cadastro.ejs');
        });
        //ROTA QUE LEVA PARA A PÁGINA DE RECUPERAR SENHA
        this.router.get('/recuperarSenha', (req, res) => {
            res.render('recuperarSenha.ejs');
        });
        //ROTA QUE LEVA PARA A PÁGINA DE PERFIL DO USUÁRIO
        this.router.get('/perfilUsuario',SessionController.authenticationMiddleware(), async (req, res) => {
            let usuario;
            let feed;
            let seguidores = [];
            if (req.query.usuario == req.user.email){
                await client.feed('user', req.user._id).get({ limit:20, offset:0, reactions: {own: true, counts: true}  })
                    .then(apiResponse =>{
                        feed = apiResponse;
                    })
                    .catch(err => {
                        console.log("Erro ao buscar feed.");
                    });
                usuario = req.user;
                res.render('perfil.ejs', {usuarioVisitado: usuario, usuarioSessao: usuario, feed: feed});
            }else{
                await axios.get(rota + "/usuarios?email=" + req.query.usuario)
                    .then(async apiResponse => {
                        usuario = apiResponse.data[0];
                        const client2 = stream.connect('55j5n3pfjx3u', req.user.userToken,  '54136');
                        await client2.feed('user', usuario._id).get({ limit:20, offset:0, reactions: {own: true, counts: true}  })
                            .then(apiResponse =>{
                                feed = apiResponse;
                            })
                            .catch(err => {
                                console.log("Erro ao buscar feed.");
                            });
                        await client.feed('user', usuario._id).followers()
                            .then(results => {
                                results.results.forEach(objeto => {
                                    seguidores.push(objeto.feed_id.substring(9));
                                });
                            })
                            .catch(err =>{
                                console.log(err.message);
                            });
                        res.render('perfil.ejs', {usuarioVisitado: usuario, usuario: req.user, feed: feed, seguidores: seguidores});
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
            await axios.get(rota + "/usuarios?email=" + emailUsuario)
                .then(apiResponse => {
                    usuarioBuscado = apiResponse.data[0];
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
                axios.post(rota + "/usuarios", auxUsuario)
                    .then((apiResponse) => {
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
                axios.put(rota + "/usuarios/desativarUsuario" + req.user._id)
                    .then(apiResponse => {
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
            await axios.put(rota + "/usuarios" + "/banirUsuario" + emailUsuario)
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
                axios.put(rota + "/usuarios" + "/atualizarNome" + req.user._id, {novoNome: nome})
                    .then((apiResponse) => {
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
        //ROTA QUE ATUALIZA A FOTO DE UM USUÁRIO
        this.router.post('/alterarFoto', upload.single('novaFoto'),SessionController.authenticationMiddleware(), async (req, res) =>{
            //Enviar a imagem do usuário para o imgur
            axios.post('https://api.imgur.com/3/upload',
                { image: fs.readFileSync(req.file.path, 'base64'),
                    album: 'pAd0rJh',
                    type: 'base64',
                    name: req.file.filename }, {headers:
                        {'Authorization':`Bearer ${apiKeys.imgurAccessToken}`}})
                .then(apiResponse => {
                    //Deletar a imagem temporária armazenada no file system
                    fs.unlink(req.file.path, err => {
                        if (err) {
                            console.log("Erro ao excluir a imagem");
                        }
                    });
                    if (apiResponse.data.success == true) {
                        //Atualizando a foto do usuário
                        axios.put(rota + '/usuarios/alterarFotoUsuario=' + req.user._id, {novaFoto: apiResponse.data.data.link})
                            .then(apiResponse => {
                                res.redirect('/usuarios/configuracoes');
                            })
                            .catch(err => {
                                if (err) {
                                    console.log("Erro ao atualizar a foto do usuário.");
                                    res.redirect('/usuarios/configuracoes');
                                };
                            });
                    };
                })
                .catch(err => {
                    fs.unlink(req.file.path, err => {
                        console.log("Erro ao excluir a imagem")
                    });
                    console.log("erro do catch do post pra api do imgur" + err);
                });
        });
        //ROTA QUE ATUALIZA O E-MAIL DE UM USUÁRIO
        this.router.post('/atualizarEmail', SessionController.authenticationMiddleware(), async (req,res) => {
            const email = req.body.novoEmail;
            if (UsuariosController.verificarEmailUnico(email) && UsuariosController.validarEmail(email)){
                axios.put(rota + "/usuarios" + "/atualizarEmail" + req.user._id, {novoEmail: email})
                    .then((apiResponse) => {
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
                axios.put(rota + "/usuarios" + "/atualizarSenha" + req.user._id, {novaSenha: novaSenha})
                    .then((apiResponse) => {
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
                await axios.put(rota + "/usuarios" + "/concederPrivilegios" + req.body.emailUsuario)
                    .then(apiResponse => {
                        //TODO: RENDER SUCCESS FLASH MESSAGE
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
            await axios.put(rota + "/usuarios" + "/revogarPrivilegios" + req.body.emailAdm)
                .then(apiResponse => {
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
                axios.put(rota + "/usuarios" + "/reativarUsuario" + req.user._id)
                    .then(apiResponse => {
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

        //ROTA QUE ENVIA O EMAIL DE RECUPERAÇÃO DE SENHA PARA O USUÁRIO
        this.router.post('/recuperarSenha2', async (req,res) => {
            let email = req.body.emailUsuario;
            if (!UsuariosController.validarEmail(email)){
                //TODO flash email inválido
                res.redirect('/usuarios/recuperarSenha');
            }else {
                // Buscando usuário:
                axios.get(rota + "/usuarios?email=" + email)
                    .then((apiResponse) => {
                        if (apiResponse.data[0].status == 2 || apiResponse.data[0].status == 1){
                            let chave = uuid();
                            let validade = new Date;
                            validade = date.addDays(validade, 1);
                            axios.put(rota + "/usuarios" + "/recuperarSenha", {emailUsuario : email, chave : chave, validade : validade})
                                .then(apiResponse => {
                                    if (apiResponse.status==200){
                                        let transporter = nodemailer.createTransport({
                                            service: 'gmail',
                                            auth: {
                                                type: 'oauth2',
                                                user: 'memeiopcs@gmail.com',
                                                clientId: '702862755088-mfjh7cm1gdmdclh83ntbu9rsndbpaa5g.apps.googleusercontent.com',
                                                clientSecret: 'm51QcltlJiG9pS0u539Rfv2l',
                                                refreshToken: '1/SIyldO2Nj0eTUz0KQd1LdIk0fSfvplHtSR6a7pTcqZo',
                                            }
                                        });
                                        let mailOptions = {
                                            from: 'memeiopcs@gmail.com',
                                            to: email,
                                            subject: 'Recuperação de senha memeIO',
                                            text: 'texto',
                                            html: 'Link para recuperação de senha<br> http://localhost:8080/usuarios/redefinirSenha' + chave //TODO criar um html bom
                                        };
                                        transporter.sendMail(mailOptions, (err, resp) => {
                                            if (err) {
                                                return console.log(err);
                                                //TODO flash erro ao enviar email
                                                res.redirect('/');

                                            } else {
                                                res.redirect('/');
                                            }
                                        });

                                    }
                                })
                                .catch(err=>{
                                    console.log("Erro: " + err.message);
                                })
                        }else{
                            //TODO flash usuário desativado
                            res.redirect('recuperarSenha');
                        }
                    })
                    .catch((err) => {
                        console.log(err);
                    });
            }
        });

        //ROTA QUE LEVA PARA A PÁGINA DE REDEFINIR SENHA
        this.router.get('/redefinirSenha:chave', (req, res) => {
            let chave = req.params.chave;
            axios.get(rota + "/usuarios?chave=" + chave)
                .then((apiResponse) => {
                    if(apiResponse.data){
                        let date = new Date;
                        let validade = new Date(apiResponse.data[0].recuperacao[1]);
                        let usuario= {idUsuario: apiResponse.data[0]._id, nome: apiResponse.data[0].nome}
                        if (validade>date){
                            res.render('redefinirSenha.ejs', {usuario: usuario});
                        }else{
                            res.redirect("recuperarSenha");
                            //TODO chave fora da validade
                        }
                    }else{
                        res.redirect("recuperarSenha");
                        //TODO chave não encontrada
                    }
                })
                .catch((err) => {
                    console.log(err);
                });
        });

        //ROTA QUE REDEFINE A SENHA DE UM USUÁRIO
        this.router.post('/alterarSenha', async (req,res) => {
            let novaSenha = req.body.senhaUsuario;
            let id = req.body.idUsuario;
            let nome = req.body.nomeUsuario;
            if(UsuariosController.validarSenha(novaSenha, nome)){
                let salt = bcrypt.genSaltSync(10);
                let hash = bcrypt.hashSync(novaSenha, salt);
                novaSenha = hash;
                axios.put(rota + "/usuarios" + "/atualizarSenha" + id, {novaSenha: novaSenha})
                    .then((apiResponse) => {
                        res.redirect('/');
                    })
                    .catch(err => {
                        console.log("Erro ao atualizar senha: " + err.message);
                        res.status(400).send("Erro ao atualizar senha.");
                    });
            }else{
                //TODO senha inválida
                res.redirect('/');
            }
        });

        //ROTA QUE SEGUE UM MEME
        this.router.post('/seguirMeme', async (req, res) => {
            let usuario = {};
            let seguidores = [];
            await axios.get(rota + "/usuarios?_id="+ req.body.usuarioID)
                .then(apiResponse => {
                    usuario = apiResponse.data[0];
                })
                .catch(err => {
                    if (err) { console.log("Erro ao buscar usuário: " + err.message); }
                });
            await client.feed('meme', req.body.memeID).followers()
                .then(results => {
                    results.results.forEach(objeto => {
                        seguidores.push(objeto.feed_id.substring(9));
                    });
                })
                .catch(err =>{
                    console.log(err.message);
                });
            if(seguidores == undefined || !seguidores.includes(req.user._id)) {
                //Seguir o meme
                let feed = client.feed('timeline', req.user._id);
                feed.follow('meme', req.body.memeID);
            } else{
                //Deixar de seguir o usuário
                let feed = client.feed('timeline', req.user._id);
                feed.unfollow('meme', req.body.memeID);
            };
        });

        //ROTA QUE SEGUE UM USUÁRIO
        this.router.post('/seguirUsuario', async (req, res) => {
            let usuario = {};
            let seguidores = [];
            await axios.get(rota + "/usuarios?_id="+ req.body.usuarioID)
                .then(apiResponse => {
                    usuario = apiResponse.data[0];
                })
                .catch(err => {
                    if (err) { console.log("Erro ao buscar usuário: " + err.message); }
                });
            await client.feed('user', req.body.usuarioVisitadoID).followers()
                .then(results => {
                    results.results.forEach(objeto => {
                        seguidores.push(objeto.feed_id.substring(9));
                    })
                });
            if(seguidores == undefined || !seguidores.includes(req.user._id)) {
                //Seguir o usuário
                let feed = client.feed('timeline', req.user._id);
                feed.follow('user', req.body.usuarioVisitadoID);
            } else{
                //Deixar de seguir o usuário
                let feed = client.feed('timeline', req.user._id);
                feed.unfollow('user', req.body.usuarioVisitadoID);
            };
        });
    }

}

module.exports = UsuariosRoute;