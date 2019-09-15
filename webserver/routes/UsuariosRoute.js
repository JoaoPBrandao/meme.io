const Route = require('./Route.js');
const axios = require('axios'); //Usamos Axios para fazer as requests à API
const bcrypt = require('bcrypt'); //Usamos o Bcrypt para encriptar a senha do usuário
const UsuariosController = require('../controllers/UsuariosController.js');
const SessionController = require('../controllers/SessionController.js');
const passport = require('passport'); //Usamos o passport pra fazer a autenticação
const uuid = require('uuid/v1'); //Utilizado para gerar um ID único
const customDate = require('date-and-time'); //Utilizado para criar objetos do tipo Data com formatos específicos
const apiKeys = require('../configs/apiKeys'); //Arquivo com as chaves das APIs utilizadas
const nodemailer = require('nodemailer'); //Utilizamos o nodeMailer para mandar e-mail
const { google } = require('googleapis'); //Utilizamos a API do google para mandar e-mail
const OAuth2 = google.auth.OAuth2; //Utilizamos o OAuth2 para autenticar com o google
const rota = require('../configs/rota');
const multer = require('multer'); //Usamos o Multer para parsear formuláros do tipo multipart/form-data
const fs = require('fs'); //FileSystem padrão do Node
const stream = require('getstream'); //Usamos o GetStream para implementar a funcionalidade do feed
//Conectar ao client do GetStream:
const client = stream.connect(
  '55j5n3pfjx3u',
  '29kr9qdxat6gx4uw5d53sg3akbymwf7qcs85252bmhakxt426zjxctaaah3j9hdr',
  '54136'
);

//Configurar aspectos específicos do Multer
const storage = multer.diskStorage({
  //Mudando o destino para salvar as fotos enviadas pro webServer
  destination: function(req, file, cb) {
    cb(null, 'static/media/userPhotos');
  },
  //Configurando para que o nome da foto salva no servidor seja igual ao nome original
  filename: function(req, file, cb) {
    cb(null, file.originalname);
  }
});
const upload = multer({ storage: storage });

class UsuariosRoute extends Route {
  constructor(basePath) {
    super('/usuarios');

    //Rota que exibe a página de configurações para o usuário
    //Caso o usuário não esteja autenticado, ele é redirecionado para a landing page
    this.router.get(
      '/configuracoes',
      SessionController.authenticationMiddleware(),
      async (req, res) => {
        let usuario = req.user;
        //Pegar os administradores para serem exibidos nas partes do administrador
        let administradores = [];
        await axios
          .get(rota + '/usuarios?adm=1')
          .then(apiResponse => {
            administradores = apiResponse.data;
          })
          .catch(err => {
            console.log('Erro ao buscar administradores na API.');
          });
        //Enviar as denúncias para serem exibidas nas partes do administrador
        let denuncias = [];
        await axios
          .get(rota + '/posts/denuncias')
          .then(apiResponse => {
            denuncias = apiResponse.data;
          })
          .catch(err => {
            console.log('Erro ao buscar denúncias na API.');
          });
        //Enviar os memes para serem exibidos nas partes do administrador
        let memes;
        await axios
          .get(rota + '/memes')
          .then(apiResponse => {
            memes = apiResponse.data;
          })
          .catch(err => console.log('Erro ao buscar memes na API.'));
        let sugestoes;
        await axios
          .get(rota + '/memes/sugestoes')
          .then(apiResponse => {
            sugestoes = apiResponse.data;
          })
          .catch(err => console.log('Erro ao buscar sugestoes na API.'));
        res.render('configuracoes.ejs', {
          usuario: usuario,
          memes: memes,
          administradores: administradores,
          sugestoes: sugestoes,
          denuncias: denuncias
        });
      }
    );

    //Rota que redireciona o usuário para a página de cadastro
    this.router.get('/cadastro', (req, res) => {
      res.render('cadastro.ejs');
    });

    //Rota que redireciona o usuário para a página de recuperação de senha
    this.router.get('/recuperarSenha', (req, res) => {
      res.render('recuperarSenha.ejs');
    });

    //Rota que redireciona o usuário para a página de perfil de usuário
    //Recebe o e-mail do usuário que será visitado
    this.router.get(
      '/perfilUsuario',
      SessionController.authenticationMiddleware(),
      async (req, res) => {
        let usuario;
        let feed;
        let seguidores = [];
        //Checar se o objetivo é visitar o perfil do usuário autenticado ou de outro usuário
        if (req.query.usuario == req.user.email) {
          await client
            .feed('user', req.user._id)
            .get({
              limit: 20,
              offset: 0,
              reactions: { own: true, counts: true }
            })
            .then(apiResponse => {
              feed = apiResponse;
            })
            .catch(err => {
              console.log('Erro ao buscar feed.');
            });
          usuario = req.user;
          //Renderizar a página de perfil com as informações do usuário autenticado
          res.render('perfil.ejs', {
            usuarioVisitado: usuario,
            usuarioSessao: usuario,
            feed: feed
          });
        } else {
          //Buscar o outro usuário no banco de dados
          await axios
            .get(rota + '/usuarios?email=' + req.query.usuario)
            .then(async ({ data }) => {
              usuario = data[0];
              //Pegar o feed do outro usuário
              const client2 = stream.connect(
                '55j5n3pfjx3u',
                req.user.userToken,
                '54136'
              );
              await client2
                .feed('user', usuario._id)
                .get({
                  limit: 20,
                  offset: 0,
                  reactions: { own: true, counts: true }
                })
                .then(apiResponse => {
                  feed = apiResponse;
                })
                .catch(err => {
                  console.log('Erro ao buscar feed.');
                });
              //Pegar os seguidores do usuário buscado para saber se o usuário autenticado já segue ele
              await client
                .feed('user', usuario._id)
                .followers()
                .then(results => {
                  results.results.forEach(objeto => {
                    seguidores.push(objeto.feed_id.substring(9));
                  });
                })
                .catch(err => {
                  console.log(err.message);
                });
              //Renderizar a página de perfil com as informações do outro usuário buscado
              res.render('perfil.ejs', {
                usuarioVisitado: usuario,
                usuario: req.user,
                feed: feed,
                seguidores: seguidores
              });
            })
            .catch(err => {
              console.log('Erro ao buscar usuário.');
              res.redirect('configuracoes');
            });
        }
      }
    );

    //Rota que realiza a busca dos usuários no banco de dados
    //Recebe o e-mail do usuário buscado
    this.router.get(
      '/buscarUsuarios',
      SessionController.authenticationMiddleware(),
      async (req, res) => {
        let emailUsuario = req.query.emailUsuario;
        let usuarioBuscado;
        await axios
          .get(rota + '/usuarios?email=' + emailUsuario + '&status=2')
          .then(apiResponse => {
            usuarioBuscado = apiResponse.data[0];
            res.render('buscaDeUsuarios.ejs', {
              usuarioBuscado: usuarioBuscado
            });
          })
          .catch(err => {
            //TODO: RENDER ERROR FLASH MESSAGE
            console.log('Erro ao buscar usuário.');
            res.render(process.cwd() + '/views/perfil.ejs', {
              usuario: req.user
            });
          });
      }
    );

    //Rota que cria um novo usuário no banco de dados
    //Recebe um objeto com as informações do usuário a ser instanciado
    this.router.post('/novoUsuario', async (req, res) => {
      let auxUsuario = {};
      let erros = [];
      auxUsuario.nome = req.body.nomeUsuario;
      auxUsuario.email = req.body.emailUsuario;
      auxUsuario.senha = req.body.senhaUsuario;
      //Realizar as validações de regra de negócio
      let validacaoEmail = UsuariosController.validarEmail(auxUsuario.email);
      let validacaoEmailUnico = await UsuariosController.verificarEmailUnico(
        auxUsuario.email
      );
      let validacaoSenha = UsuariosController.validarSenha(
        auxUsuario.senha,
        auxUsuario.nome
      );
      let validacaoNome = UsuariosController.validarNome(auxUsuario.nome);
      if (!validacaoEmail) {
        erros.push('Email inválido');
      }
      if (!validacaoEmailUnico) {
        erros.push('Email já cadastrado');
      }
      if (!validacaoSenha) {
        erros.push('Senha inválida');
      }
      if (!validacaoNome) {
        erros.push('Nome inválido');
      }
      //Checar se houveram erros durante a validação das regras de negócio
      //Caso verdadeiro, re-renderizar a página de cadastro
      //Caso falso, criar o novo usuário no banco de dados e renderizar a página de login
      if (erros.length == 0) {
        // Encryptando senha:
        let salt = bcrypt.genSaltSync(10);
        let hash = bcrypt.hashSync(auxUsuario.senha, salt);
        auxUsuario.senha = hash;
        axios
          .post(rota + '/usuarios', auxUsuario)
          .then(apiResponse => {
            //TODO: DISPLAY SUCCESS FLASH MESSAGE
            res.render(process.cwd() + '/views/login.ejs', {});
          })
          .catch(err => {
            //TODO: DISPLAY ERROR FLASH MESSAGE
            console.log(err);
          });
      } else {
        //TODO: RENDER ERROR FLASH MESSAGE
        res.render(process.cwd() + '/views/cadastro.ejs', {
          erros: erros,
          nome: auxUsuario.nome,
          senha: auxUsuario.senha,
          email: auxUsuario.email
        });
      }
    });

    //Rota que desativa a conta de um usuário
    //Recebe a senha do usuário
    this.router.post(
      '/desativarUsuario',
      SessionController.authenticationMiddleware(),
      async (req, res) => {
        const senhaAtual = req.body.senhaAtualUsuario;
        //Comparar se a senha inserida pelo usuário está correta, para permitir a desativação da conta
        const match = await bcrypt.compare(senhaAtual, req.user.senha);
        if (match) {
          axios
            .put(rota + '/usuarios/desativarUsuario' + req.user._id)
            .then(apiResponse => {
              //TODO: DISPLAY SUCCESS FLASH MESSAGE
              res.redirect('logout');
            })
            .catch(err => {
              //TODO: DISPLAY ERROR FLASH MESSAGE
              console.log('Erro ao desativar o usuário');
              res.redirect('configuracoes');
            });
        } else {
          console.log('Senha inserida não coincide com a senha salva.');
          //TODO: DISPLAY ERROR FLASH MESSAGE
          res.redirect('configuracoes');
        }
      }
    );

    //Rota que bane a conta de um usuário
    //Recebe o e-mail do usuário a ser banido
    this.router.post('/banirUsuario', async (req, res) => {
      const emailUsuario = req.body.emailUsuario;
      await axios
        .put(rota + '/usuarios' + '/banirUsuario' + emailUsuario)
        .then(apiResponse => {
          //TODO: DISPLAY SUCCESS FLASH MESSAGE
          res.redirect('configuracoes');
        })
        .catch(err => {
          //TODO: DISPLAY ERROR FLASH MESSAGE
          console.log('Erro ao banir usuário');
          res.redirect('configuracoes');
        });
    });

    //Rota que atualiza o nome de um usuário no banco de dados
    //Recebe o novo nome a ser armazenado
    this.router.post(
      '/atualizarNome',
      SessionController.authenticationMiddleware(),
      async (req, res) => {
        const nome = req.body.novoNome;
        if (UsuariosController.validarNome(nome)) {
          axios
            .put(rota + '/usuarios' + '/atualizarNome' + req.user._id, {
              novoNome: nome
            })
            .then(apiResponse => {
              //TODO: DISPLAY SUCCESS FLASH MESSAGE
              res.redirect('configuracoes');
            })
            .catch(err => {
              //TODO: DISPLAY ERROR FLASH MESSAGE
              console.log('Erro ao atualizar nome: ' + err.message);
              res.status(400).send('Erro ao atualizar nome.');
            });
        } else {
          res.redirect('configuracoes');
          //TODO: DISPLAY ERROR FLASH MESSAGE
        }
      }
    );

    //Rota que atualiza a foto de um usuário no banco de dados
    //Recebe a imagem da foto a ser armazenada
    this.router.post(
      '/alterarFoto',
      upload.single('novaFoto'),
      SessionController.authenticationMiddleware(),
      async (req, res) => {
        //Enviar a imagem do usuário para o imgur
        axios
          .post(
            'https://api.imgur.com/3/upload',
            {
              image: fs.readFileSync(req.file.path, 'base64'),
              album: 'pAd0rJh',
              type: 'base64',
              name: req.file.filename
            },
            { headers: { Authorization: `Bearer ${apiKeys.imgurAccessToken}` } }
          )
          .then(apiResponse => {
            //Deletar a imagem temporária armazenada no file system
            fs.unlink(req.file.path, err => {
              if (err) {
                //TODO: DISPLAY ERROR FLASH MESSAGE
                console.log('Erro ao excluir a imagem');
              }
            });
            //Checar se a foto foi armazenada no Imgur com sucesso para atualizar o link no banco de dados
            if (apiResponse.data.success == true) {
              //Atualizando a foto do usuário
              axios
                .put(rota + '/usuarios/alterarFotoUsuario=' + req.user._id, {
                  novaFoto: apiResponse.data.data.link
                })
                .then(() => {
                  //TODO: DISPLAY SUCCESS FLASH MESSAGE
                  res.redirect('/usuarios/configuracoes');
                })
                .catch(err => {
                  if (err) {
                    //TODO: DISPLAY ERROR FLASH MESSAGE
                    console.log('Erro ao atualizar a foto do usuário.');
                    res.redirect('/usuarios/configuracoes');
                  }
                });
            }
          })
          .catch(err => {
            //TODO: DISPLAY ERROR FLASH MESSAGE
            fs.unlink(req.file.path, () => {
              console.log('Erro ao excluir a imagem');
            });
            console.log('erro do catch do post pra api do imgur' + err);
          });
      }
    );

    //Rota que atualiza o e-mail de um usuário no banco de dados
    //Recebe o novo e-mail a ser armazenado
    this.router.post(
      '/atualizarEmail',
      SessionController.authenticationMiddleware(),
      async (req, res) => {
        const email = req.body.novoEmail;
        //Validar o e-mail de acordo com as regras de negócio
        if (
          UsuariosController.verificarEmailUnico(email) &&
          UsuariosController.validarEmail(email)
        ) {
          axios
            .put(rota + '/usuarios' + '/atualizarEmail' + req.user._id, {
              novoEmail: email
            })
            .then(apiResponse => {
              //TODO: DISPLAY SUCCESS FLASH MESSAGE
              res.redirect('configuracoes');
            })
            .catch(err => {
              console.log('Erro ao atualizar E-mail: ' + err.message);
              res.status(400).send('Erro ao atualizar E-mail.');
            });
        } else {
          res.redirect('configuracoes');
          //TODO: DISPLAY ERROR FLASH MESSAGE
        }
      }
    );

    //Rota que atualiza a senha do usuário no banco de dados
    //Recebe a senha atual inserida pelo usuário e a nova senha a ser armazenada
    this.router.post(
      '/atualizarSenha',
      SessionController.authenticationMiddleware(),
      async (req, res) => {
        const senhaAtual = req.body.senhaAtualUsuario;
        let novaSenha = req.body.novaSenhaUsuario;
        //Checar se a senha atual inserida coincide com a senha armazenada no banco de dados
        const match = await bcrypt.compare(senhaAtual, req.user.senha);
        if (UsuariosController.validarSenha(novaSenha) && match) {
          //Encryptar a nova senha e armazená-la no banco de dados
          let salt = bcrypt.genSaltSync(10);
          let hash = bcrypt.hashSync(novaSenha, salt);
          novaSenha = hash;
          axios
            .put(rota + '/usuarios' + '/atualizarSenha' + req.user._id, {
              novaSenha: novaSenha
            })
            .then(apiResponse => {
              //TODO: DISPLAY SUCCESS FLASH MESSAGE
              res.redirect('configuracoes');
            })
            .catch(err => {
              //TODO: DISPLAY ERROR FLASH MESSAGE
              console.log('Erro ao atualizar senha: ' + err.message);
              res.status(400).send('Erro ao atualizar E-mail.');
            });
        } else {
          res.redirect('configuracoes');
          //TODO: DISPLAY ERROR FLASH MESSAGE
        }
      }
    );

    //Rota que concede privilégios de administrador a um usuário
    //Recebe o e-mail do usuário a ser promovido
    this.router.post('/concederPrivilegios', async (req, res) => {
      await axios
        .put(
          rota + '/usuarios' + '/concederPrivilegios' + req.body.emailUsuario
        )
        .then(apiResponse => {
          //TODO: RENDER SUCCESS FLASH MESSAGE
          res.redirect('configuracoes');
        })
        .catch(err => {
          //TODO: RENDER ERROR FLASH MESSAGE
          console.log('Erro ao conceder privilégios!');
          console.log(err.message);
          res.redirect('configuracoes');
        });
    });

    //Rota que revoga privilégios de administrador de um usuário
    //Recebeo e-mail do usuário a ser rebaixado
    this.router.post('/revogarPrivilegios', async (req, res) => {
      await axios
        .put(rota + '/usuarios' + '/revogarPrivilegios' + req.body.emailAdm)
        .then(apiResponse => {
          res.redirect('configuracoes');
        })
        .catch(err => {
          console.log('Erro ao revogar privilégios.');
          console.log(err.message);
          res.redirect('configuracoes');
        });
    });

    //Rota que realiza o login de um usuário
    this.router.post(
      '/logarUsuario',
      passport.authenticate('local', { failureRedirect: '/' }),
      (req, res) => {
        if (req.user.status == 1) {
          axios
            .put(rota + '/usuarios' + '/reativarUsuario' + req.user._id)
            .catch(err => {
              console.log('Erro: ' + err.message);
            });
        }
        res.redirect('/');
      }
    );

    //Rota que realiza o logout de um usuário
    this.router.get('/logout', (req, res) => {
      req.logout();
      res.redirect('/');
    });

    //Rota que envia o e-mail de recuperação de senha para o usuário
    //Recebe o e-mail do usuário
    this.router.post('/recuperarSenha2', async (req, res) => {
      let email = req.body.emailUsuario;
      if (!UsuariosController.validarEmail(email)) {
        //TODO: DISPLAY ERROR FLASH MESSAGE
        res.redirect('/usuarios/recuperarSenha');
      } else {
        //Buscar o usuário no banco de dados
        axios
          .get(rota + '/usuarios?email=' + email)
          .then(apiResponse => {
            //Checar se o usuário não está banido
            if (
              apiResponse.data[0].status == 2 ||
              apiResponse.data[0].status == 1
            ) {
              //Gerar a chave utilizada para a recuperação de senha
              let chave = uuid();
              let validade = new Date();
              validade = customDate.addDays(validade, 1);
              //Atualizar o usuário no banco de dados com as informações para a recuperação de senha
              axios
                .put(rota + '/usuarios' + '/recuperarSenha', {
                  emailUsuario: email,
                  chave: chave,
                  validade: validade
                })
                .then(({ status }) => {
                  if (status == 200) {
                    let transporter = nodemailer.createTransport({
                      service: 'gmail',
                      auth: {
                        type: 'oauth2',
                        user: 'memeiopcs@gmail.com',
                        clientId:
                          '702862755088-mfjh7cm1gdmdclh83ntbu9rsndbpaa5g.apps.googleusercontent.com',
                        clientSecret: 'm51QcltlJiG9pS0u539Rfv2l',
                        refreshToken:
                          '1/SIyldO2Nj0eTUz0KQd1LdIk0fSfvplHtSR6a7pTcqZo'
                      }
                    });
                    //Enviar o e-mail de recuperação de senha para o usuário
                    let mailOptions = {
                      from: 'memeiopcs@gmail.com',
                      to: email,
                      subject: 'Recuperação de senha memeIO',
                      text: 'texto',
                      //TODO: CREATE A HTML WITH A NICE LAYOUT FOR THE E-MAIL
                      html:
                        'Link para recuperação de senha<br> http://localhost:8080/usuarios/redefinirSenha' +
                        chave
                    };
                    transporter.sendMail(mailOptions, (err, resp) => {
                      if (err) {
                        return console.log(err);
                        //TODO: DISPLAY ERROR FLASH MESSAGE
                      }

                      //TODO: DISPLAY SUCCESS FLASH MESSAGE
                      res.redirect('/');
                    });
                  }
                })
                .catch(err => {
                  //TODO: DISPLAY ERROR FLASH MESSAGE
                  console.log('Erro: ' + err.message);
                });
            } else {
              //TODO: DISPLAY "USUÁRIO BANIDO" FLASH MESSAGE
              res.redirect('recuperarSenha');
            }
          })
          .catch(err => {
            console.log(err);
          });
      }
    });

    //Rota que redireciona o usuário para a página de redefinir senha
    //Recebe a chave para a redefinição de senha pelo path na chamada
    this.router.get('/redefinirSenha:chave', (req, res) => {
      let chave = req.params.chave;
      axios
        .get(rota + '/usuarios?chave=' + chave)
        .then(apiResponse => {
          if (apiResponse.data) {
            let date = new Date();
            let validade = new Date(apiResponse.data[0].recuperacao[1]);
            let usuario = {
              idUsuario: apiResponse.data[0]._id,
              nome: apiResponse.data[0].nome
            };
            if (validade > date) {
              res.render('redefinirSenha.ejs', { usuario: usuario });
            } else {
              res.redirect('recuperarSenha');
              //TODO: DISPLAY ERROR FLASH MESSAGE
            }
          } else {
            res.redirect('recuperarSenha');
            //TODO: DISPLAY ERROR FLASH MESSAGE
          }
        })
        .catch(err => {
          //TODO: DISPLAY ERROR FLASH MESSAGE
          console.log(err);
        });
    });

    //Rota que redefine a senha de um usuário
    //Recebe a nova senha escolhida pelo usuário
    this.router.post('/alterarSenha', async (req, res) => {
      let novaSenha = req.body.senhaUsuario;
      let id = req.body.idUsuario;
      let nome = req.body.nomeUsuario;
      //Validar a senha de acordo com as regras de negócio
      if (UsuariosController.validarSenha(novaSenha, nome)) {
        //Encryptar a nova senha e armazená-la no banco de dados
        let salt = bcrypt.genSaltSync(10);
        let hash = bcrypt.hashSync(novaSenha, salt);
        novaSenha = hash;
        axios
          .put(rota + '/usuarios' + '/atualizarSenha' + id, {
            novaSenha: novaSenha
          })
          .then(apiResponse => {
            //TODO: DISPLAY SUCCESS FLASH MESSAGE
            res.redirect('/');
          })
          .catch(err => {
            //TODO: DISPLAY ERROR FLASH MESSAGE
            console.log('Erro ao atualizar senha: ' + err.message);
            res.status(400).send('Erro ao atualizar senha.');
          });
      } else {
        //TODO: DISPLAY ERROR FLASH MESSAGE
        res.redirect('/');
      }
    });

    //Rota que segue um meme
    //Recebe o ID do usuário e o ID do meme
    this.router.post('/seguirMeme', async (req, res) => {
      let seguidores = [];

      try {
        await axios.get(rota + '/usuarios?_id=' + req.body.usuarioID);
      } catch (err) {
        console.log('Erro ao buscar usuário: ' + err.message);
      }

      await client
        .feed('meme', req.body.memeID)
        .followers()
        .then(results => {
          results.results.forEach(objeto => {
            seguidores.push(objeto.feed_id.substring(9));
          });
        })
        .catch(err => {
          console.log(err.message);
        });
      //Checar se o usuário está seguindo o meme no momento em que a chamada foi feita
      if (!seguidores || !seguidores.includes(req.user._id)) {
        //Seguir o meme
        let feed = client.feed('timeline', req.user._id);
        feed.follow('meme', req.body.memeID);
      } else {
        //Deixar de seguir o meme
        let feed = client.feed('timeline', req.user._id);
        feed.unfollow('meme', req.body.memeID);
      }
    });

    //Rota que segue um usuário
    //Recebe o ID do usuário a ser seguido
    this.router.post('/seguirUsuario', async (req, res) => {
      let seguidores = [];

      try {
        await axios.get(rota + '/usuarios?_id=' + req.body.usuarioID);
      } catch (err) {
        console.log('Erro ao buscar usuário: ' + err.message);
      }

      await client
        .feed('user', req.body.usuarioVisitadoID)
        .followers()
        .then(results => {
          results.results.forEach(objeto => {
            seguidores.push(objeto.feed_id.substring(9));
          });
        });

      //Checar se o usuário autenticado está seguindo o outro usuário no momento em que a chamada foi feita
      if (!seguidores || !seguidores.includes(req.user._id)) {
        //Seguir o usuário
        let feed = client.feed('timeline', req.user._id);
        feed.follow('user', req.body.usuarioVisitadoID);
      } else {
        //Deixar de seguir o usuário
        let feed = client.feed('timeline', req.user._id);
        feed.unfollow('user', req.body.usuarioVisitadoID);
      }
    });
  }
}

module.exports = UsuariosRoute;
