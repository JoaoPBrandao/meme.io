const axios = require("axios"); // Usamos Axios para fazer as requests à API
const Route = require("./Route.js");
const multer  = require('multer'); //Usamos o Multer para parsear formuláros do tipo multipart/form-data
const fs = require('fs'); // FileSystem padrão do Node
const apiKeys = require('../configs/apiKeys'); //Arquivo com as chaves das APIs utilizadas
const SessionController = require("../controllers/SessionController.js");
const date = require('date-and-time'); //Utilizado para criar objetos do tipo Data com formatos específicos
const rota = require('../configs/rota');
const stream = require('getstream');
const client = stream.connect('55j5n3pfjx3u', '29kr9qdxat6gx4uw5d53sg3akbymwf7qcs85252bmhakxt426zjxctaaah3j9hdr', '54136');


//Configurar aspectos específicos do Multer
const storage = multer.diskStorage({
    //Mudando o destino para salvar as fotos enviadas pro webServer
    destination: function (req, file, cb) {
        cb(null, 'static/media/memes')
    },
    //Configurando para que o nome da foto salva no servidor seja igual ao nome original
    filename: function (req, file, cb) {
        cb(null, file.originalname)
    }
})
const upload = multer({storage: storage})

//TODO: LEMBRAR DE DELETAR AS PUBLICAÇÕES ASSOCIADAS AO MEME QUANDO O MEME FOR DELETADO

class PostsRoute extends Route {
    constructor(basePath) {
        super('/posts');

        this.router.post('/createPost', SessionController.authenticationMiddleware(), upload.single('arquivoEnviado'), (req, res) => {
            let post = {};
            axios.post('https://api.imgur.com/3/upload',
                { image: fs.readFileSync(req.file.path, 'base64'),
                    album: '1BQ66Yj',
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
                        //Criando o novo post caso o upload para o Imgur tenha dado certo

                        let now = new Date();
                        now = date.format(now, 'DD/MM/YYYY');
                        post.urlImgur = apiResponse.data.data.link;
                        post.idImgur = apiResponse.data.data.id;
                        post.data = now;
                        post.urlImgurUsuario = req.user.foto;
                        post.nomeUsuario = req.user.nome;
                        post.idUsuario = req.user._id;
                        post.idMemeAssociado = req.body.memeID;
                        post.conteudo = req.body.conteudoPost;
                        let user = client.feed('user', post.idUsuario);
                        let activity = {actor: 'User:'+post.idUsuario, verb: 'post', object: 0, nome: post.nomeUsuario,
                            url: post.urlImgur, to: ['meme:'+post.idMemeAssociado], conteudo: post.conteudo, urlImgUsuario:  post.urlImgurUsuario};
                        user.addActivity(activity).
                            then(function(data) { console.log(data) })
                            .catch(function(reason) { console.log(reason.error)});
                        console.log("Resposta da API do Imgur: " + apiResponse.data.status);
                        //Enviando o novo post para a API para que seja enviado para o BD
                        axios.post(rota + "/posts/novoPost", post)
                            .then(apiResponse => {
                                console.log("Resposta da nossa API: " + apiResponse.status);
                                res.redirect('/'); // TODO: RENDER success FLASH MESSAGE
                            })
                            .catch((err) => {
                                console.log("Erro ao enviar post pra API: " + err);
                            });
                    }
                })
                .catch(err => {
                    fs.unlink(req.file.path, err => {
                        console.log("Erro ao excluir a imagem.")
                    });
                    console.log("Erro ao enviar a imagem para o Imgur:" + err);
                });
        });
        //ROTA QUE DELETA UM POST
        this.router.post('/deletePost', SessionController.authenticationMiddleware(), (req, res) => {
            //Enviar a requisição de delete do post para a API para que seja deletado do BD
            axios.delete(rota + "/posts/deletePost" + req.body.postID)
                .then((apiResponse) => {
                    console.log("Resposta da API: " + apiResponse.status);
                    //Excluir a foto armazenada no Imgur
                    axios.delete('https://api.imgur.com/3/image/' + apiResponse.data.idImgur, {headers:
                            {'Authorization':`Bearer ${apiKeys.imgurAccessToken}`}})
                        .then(respostaAPI => {
                            console.log("Resposta da API do Imgur ao deletar: " + respostaAPI.data.status);
                        })
                        .catch(err => {
                            console.log("Erro ao excluir a imagem do imgur: " + err);
                        });
                    //Redirecionar o usuário
                    res.redirect('/'); // TODO: RENDER success FLASH MESSAGE
                })
                .catch((err) => {
                    console.log("Erro ao deletar post: " + err.data);
                });
        });

        //ROTA QUE DENUNCIA UM POST
        this.router.post('/denunciarPost', SessionController.authenticationMiddleware(), async (req, res) => {
            //Pegar as informações do post
            let post = {};
            await axios.get(rota + '/posts/postID&=' + req.body.postID)
                .then(apiResponse => {
                    post = apiResponse.data;
                })
                .catch(err => {
                    console.log("Erro ao buscar post por ID: " + err.messsage);
                });
            const denuncia = {
                idUsuario: post.idUsuario,
                postUrlImgur: post.urlImgur,
                postConteudo: post.conteudo,
                postID: req.body.postID,
                conteudo: req.body.conteudoDenuncia
            };
            axios.post(rota + '/posts/denunciarPost', denuncia)
                .then(res.redirect('back'))
                .catch(err => {
                    console.log("Erro ao criar denúncia.");
                    //TODO: RENDER ERROR FLASH MESSAGE
                    res.redirect('/');
                });
        });

        this.router.post('/aceitarDenuncia', async (req, res) => {
            await axios.put(rota + "/usuarios/atualizarDenuncia" + req.body.idUsuario)
                .then(apiResponse => {
                    if (apiResponse.status == 400){
                        console.log("Erro ao aceitar a denuncia na API.");
                    }else{
                        console.log("Denuncia aceita com sucesso.");
                    };
                })
                .catch(err => {
                    console.log("Erro ao tentar aceitar a denuncia.");
                });
            await axios.delete(rota + "/posts/deletarDenuncia" + req.body.idDenuncia)
                .then(apiResponse => {
                    if (apiResponse.status == 400){
                        console.log("Erro ao deletar a sugestão na API.");
                    }else{
                        console.log("Sugestão deletada com sucesso.");
                    };
                })
                .catch(err => {
                    console.log("Erro ao tentar deletar a sugestão.");
                    res.redirect('../usuarios/configuracoes');
                });
            await axios.delete(rota + "/posts/deletePost" + req.body.idPost)
                .then((apiResponse) => {
                    console.log("Resposta da API: " + apiResponse.status);
                    //Excluir a foto armazenada no Imgur
                    axios.delete('https://api.imgur.com/3/image/' + apiResponse.data.idImgur, {headers:
                            {'Authorization':`Bearer ${apiKeys.imgurAccessToken}`}})
                        .then(respostaAPI => {
                            console.log("Resposta da API do Imgur ao deletar: " + respostaAPI.data.status);
                        })
                        .catch(err => {
                            console.log("Erro ao excluir a imagem do imgur: " + err);
                        });
                    //Redirecionar o usuário
                })
                .catch((err) => {
                    console.log("Erro ao deletar post: " + err.data);
                });
            res.end();
        });

        this.router.post('/recusarDenuncia', (req, res) => {
            axios.delete(rota + "/posts/deletarDenuncia" + req.body.idDenuncia)
                .then(apiResponse => {
                    if (apiResponse.status == 400){
                        console.log("Erro ao deletar a sugestão na API.");
                    }else{
                        console.log("Denuncia deletada com sucesso.");
                    };
                    res.end();
                })
                .catch(err => {
                    console.log("Erro ao tentar deletar a denuncia.");
                    res.end();
                });
        });

        this.router.post('/avaliarPost', async (req, res) => {
            let userLikes = [];
            await axios.get(rota + "/posts/pegarLikes" + req.body.postID)
                .then(apiResponse => {
                    userLikes = apiResponse.data;
                })
                .catch(err => {
                    console.log("Erro ao pegar likes: " + err.message);
                });
            //Variável que diz se a publicação está curtida ou descurtida no momento. (True = curtida, false = descurtida)
            let isAlreadyLiked = false;
            if (userLikes.includes(req.body.usuarioID)){
                isAlreadyLiked = true;
            }
            if (isAlreadyLiked) {
                //Descurtir o post
                axios.put(rota + "/posts/descurtirPost" + req.body.postID + "/" + req.body.usuarioID)
                    .then()
                    .catch(err => {
                        console.log("Erro ao descurtir post: " + err.message);
                    })
            } else{
                //Curtir o post
                axios.put(rota + "/posts/curtirPost" + req.body.postID + "/" + req.body.usuarioID)
                    .then()
                    .catch(err => {
                        console.log("Erro ao curtir post: " + err.message);
                    })
            }
        });
    }
}
module.exports = PostsRoute;