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
            //Enviando a imagem pra API do Imgur
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

                        //Criando uma data
                        let now = new Date();
                        now = date.format(now, 'DD/MM/YYYY');

                        //Criando o post na API do Get Stream
                        let user = client.feed('user', req.user._id);
                        let activity = {
                            actor: 'User:'+req.user._id,
                            verb: 'post',
                            object: 0,
                            nome: req.user.nome,
                            url: apiResponse.data.data.link,
                            to: ['meme:'+req.body.memeID, 'timeline:'+req.user._id, 'trending:trending'],
                            conteudo: req.body.conteudoPost,
                            urlImgUsuario:  req.user.foto,
                            idImgur: apiResponse.data.data.id,
                            data: now
                        };
                        user.addActivity(activity).
                            then(() => {
                            res.status(200).redirect('/');
                        })
                            .catch(reason => {
                                //TODO: ERROR FLASH MESSAGE
                                console.log(reason.error);
                            });
                    };
                })
                .catch(err => {
                    fs.unlink(req.file.path, err => {
                        console.log("Erro ao excluir a imagem.")
                    });
                    console.log("Erro ao enviar a imagem para o Imgur:" + err);
                    res.status(400).redirect('/');
                });
        });

        //ROTA QUE DELETA UM POST
        this.router.post('/deletePost', SessionController.authenticationMiddleware(), (req, res) => {

            //Deletar o post da API do Get Stream
            client.feed('user', req.body.userID).removeActivity(req.body.postID)
                .then()
                .catch(err => {
                    if (err) {
                        console.log("Erro ao deletar o post:" + err.message)
                    }
                });;

            //Excluir a foto armazenada no Imgur
            axios.delete('https://api.imgur.com/3/image/' + req.body.idImgur, {headers:
                    {'Authorization':`Bearer ${apiKeys.imgurAccessToken}`}})
                .then(() => {
                    res.sendStatus(200);
                })
                .catch(err => {
                    console.log("Erro ao excluir a imagem do imgur: " + err);
                    res.sendStatus(400);
                });
        });

        //ROTA QUE DENUNCIA UM POST
        this.router.post('/denunciarPost', SessionController.authenticationMiddleware(), async (req, res) => {

            //INSTANCIAR A DENÚNCIA RECEBIDA
            const denuncia = req.body;

            //ENVIAR A DENÚNCIA PARA O BD
            axios.post(rota + '/posts/denunciarPost', denuncia)
                .then(res.redirect('back'))
                .catch(err => {
                    console.log("Erro ao criar denúncia.");
                    //TODO: RENDER ERROR FLASH MESSAGE
                    res.redirect('/');
                });
        });

        //ROTA QUE ACEITA A DENÚNCIA
        this.router.post('/aceitarDenuncia', async (req, res) => {
            //ATUALIZAR O NÚMERO DE DENÚNCIAS ACEITAS DO USUÁRIO
            await axios.put(rota + "/usuarios/atualizarDenuncia" + req.body.idUsuario)
                .then(apiResponse => {
                    if (apiResponse.status == 400){
                        console.log("Erro ao aceitar a denuncia na API.");
                    };
                })
                .catch(err => {
                    if (err) {
                        console.log("Erro ao tentar aceitar a denuncia: " + err.message);
                    }
                });

            //DELETAR AS DENÚNCIAS DESSE POST DO BD
            await axios.delete(rota + "/posts/deletarTodasDenuncias" + req.body.idPost)
                .then(apiResponse => {
                    if (apiResponse.status == 400){
                        console.log("Erro ao deletar a sugestão na API.");
                    };
                })
                .catch(err => {
                    console.log("Erro ao tentar deletar a sugestão.");
                    res.redirect('../usuarios/configuracoes');
                });

            //DELETAR A IMAGEM DO POST DO IMGUR
            await axios.delete('https://api.imgur.com/3/image/' + req.body.idImgur, {headers:
                    {'Authorization':`Bearer ${apiKeys.imgurAccessToken}`}})
                .then()
                .catch(err => {
                    console.log("Erro ao excluir a imagem do imgur: " + err);
                });

            //DELETAR O POST DA API DO GET STREAM
            await client.feed('user', req.body.idUsuario).removeActivity(req.body.idPost)
                .then()
                .catch(err => {
                    if (err) {
                        console.log("Erro ao deletar o post da denúncia:" + err.message)
                    }
                });
            res.end();
        });

        this.router.post('/recusarDenuncia', (req, res) => {
            axios.delete(rota + "/posts/deletarDenuncia" + req.body.idDenuncia)
                .then(apiResponse => {
                    if (apiResponse.status == 400){
                        console.log("Erro ao deletar a sugestão na API.");
                    };
                    res.end();
                })
                .catch(err => {
                    console.log("Erro ao tentar deletar a denuncia.");
                    res.end();
                });
        });

        this.router.post('/avaliarPost', async (req, res) => {
            const client2 = stream.connect('55j5n3pfjx3u', req.user.userToken,  '54136');
            let likeID = undefined;
            let reactions = await client.reactions.filter({'activity_id': req.body.postID});
            reactions.results.forEach(like => {
                if (like.user_id == req.user._id){
                    likeID = like.id;
                }
            });
            if (likeID){
                //DESCURTIR
                client.reactions.delete(likeID)
                    .catch(err => {
                        console.log(err.message);
                    })
            }else {
                //CURTIR
                await client2.reactions.add('like', req.body.postID)
                    .catch(err => {
                        console.log(err.message);
                    });
            }
        });
    }
}
module.exports = PostsRoute;