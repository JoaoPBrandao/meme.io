const axios = require("axios"); // Usamos Axios para fazer as requests à API
const Route = require("./Route.js");
const multer  = require('multer'); //Usamos o Multer para parsear formuláros do tipo multipart/form-data
const fs = require('fs'); // FileSystem padrão do Node
const apiKeys = require('../configs/apiKeys'); //Arquivo com as chaves das APIs utilizadas
const SessionController = require("../controllers/SessionController.js");
const date = require('date-and-time'); //Utilizado para criar objetos do tipo Data com formatos específicos
const rota = require('../configs/rota');


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

class MemesRoute extends Route {
    constructor(basePath) {
        super('/memes');

        this.router.get('/', async (req, res) => {
            let usuario = req.user;
            let memes = [];
            await axios.get(rota + "/memes")
                .then(apiResponse => {
                    memes = apiResponse.data;
                });
            //Enviar para o repositório apenas os memes ativos
            let memesAtivos = [];
            memes.forEach(meme => {
                if (meme.status == 1){
                    memesAtivos.push(meme);
                };
            });
            res.render('repositorio.ejs', {memes: memesAtivos, usuario: usuario});
        });

        this.router.post('/novoMeme', SessionController.authenticationMiddleware(), upload.single('arquivoEnviado'), (req, res) => {
            let meme = {};
            let categorias = req.body.categorias;
            //Tratamento mínimo das categorias
            categorias = categorias.replace(/ /g, '');
            categorias = categorias.replace(/#/g, '');
            //Checando se existe no mínimo 1 categoria
            if (categorias.length == 0) {
                //TODO TRATAR ERRO
            } else {
                //Converter a string com as categorias em um array
                categorias = categorias.split(";");
                meme.categorias = categorias;
                //Enviar a imagem do meme para o imgur
                axios.post('https://api.imgur.com/3/upload',
                        { image: fs.readFileSync(req.file.path, 'base64'),
                            album: 'XUKKNbX',
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
                            //Criando o novo meme caso o upload para o Imgur tenha dado certo
                            let now = new Date();
                            now = date.format(now, 'DD/MM/YYYY');
                            meme.urlImgur = apiResponse.data.data.link;
                            meme.idImgur = apiResponse.data.data.id;
                            meme.data = now;
                            console.log("Resposta da API do Imgur: " + apiResponse.data.status);
                            //Enviando o novo meme para a API para que seja enviado para o BD
                            axios.post(rota + "/memes", meme)
                                .then(apiResponse => {
                                    console.log("Resposta da nossa API: " + apiResponse.status);
                                    res.redirect('/memes/'); // TODO: RENDER success FLASH MESSAGE
                                })
                                .catch((err) => {
                                    console.log("erro do catch do post pra nossa api: " + err);
                                });

                        }

                    })
                    .catch(err => {
                        fs.unlink(req.file.path, err => {
                            console.log("Erro ao excluir a imagem")
                        });
                        console.log("erro do catch do post pra api do imgur" + err);
                    });
            }
        });

        this.router.post('/deletarMeme', SessionController.authenticationMiddleware(),(req, res) => {
            //Enviar a requisição de delete do meme para a API para que seja deletado do BD
            axios.delete(rota + "/memes/deletarMeme" + req.body.memeID)
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
                    //Deletar as sugestões associadas a esse meme
                    axios.delete(rota + "/memes/deletarSugestoesDoMeme" + req.body.memeID)
                        .then(apiResponse => {
                            if (apiResponse.status == 400){
                                console.log("Erro ao deletar as sugestões desse meme na API.");
                            }else{
                                console.log("Sugestões deletada com sucesso.");
                            };
                        })
                        .catch(err => {
                            console.log("Erro ao tentar deletar a sugestão.");
                        });
                    //Redirecionar o usuário para a página que ele estava
                    res.redirect(req.body.paginaEnviada); // TODO: RENDER success FLASH MESSAGE
                })
                .catch((err) => {
                    console.log(err);
                    console.log("Erro ao deletar meme: " + err.data);
                });
        });

        this.router.post('/acessarPerfilMeme', async (req, res) => {
            let meme = {};
            //Enviar a requisição com o ID para a API fazer a busca no BD
            await axios.get(rota + "/memes/id=" + req.body.memeID)
                .then(apiResponse => {
                    meme = apiResponse.data;
                }).catch(err => {
                    console.log("Erro ao buscar meme: " + err);
                });
            //Renderizar a página do perfil com as informações do meme específico.
            res.render('perfilMeme.ejs', {meme});
        })

        this.router.post('/criarSugestao', (req, res) => {
            let novoCategorias = req.body.novasCategorias;
            //Tratamento mínimo das categorias
            novoCategorias = novoCategorias.replace(/ /g, '');
            novoCategorias = novoCategorias.replace(/#/g, '');
            //Checando se existe no mínimo 1 categoria
            if (novoCategorias.length == 0) {
                //TODO TRATAR ERRO
            } else {
                novoCategorias = novoCategorias.split(";");
                //Enviar para a API para que o meme seja atualizado no BD
                axios.post(rota + "/memes/sugestaoAlteracao" + req.body.memeID, novoCategorias)
                    .then(apiResponse => {
                        res.redirect('/memes/'); // TODO: RENDER success FLASH MESSAGE
                    }).catch(err => {
                        console.log(err);
                        res.redirect('/memes/'); // TODO: RENDER failure FLASH MESSAGE
                });
            }
        });

        this.router.post('/validarSugestao', (req, res) => {
            axios.put(rota + req.body.idSugestao)
                .then(apiResponse => {
                    if (apiResponse.status == 400){
                        console.log("Erro ao validar a sugestão na API.");
                    }else{
                        console.log("Sugestão validada com sucesso.");
                    };
                    res.redirect('../usuarios/configuracoes');
                })
                .catch(err => {
                    console.log("Erro ao tentar validar a sugestão.");
                    res.redirect('../usuarios/configuracoes');
                })
        });

        this.router.post('/deletarSugestao', (req, res) => {
           axios.delete(rota + "/memes/deletarSugestao" + req.body.idSugestao)
               .then(apiResponse => {
                   if (apiResponse.status == 400){
                       console.log("Erro ao deletar a sugestão na API.");
                   }else{
                       console.log("Sugestão deletada com sucesso.");
                   };
                   res.redirect('../usuarios/configuracoes');
               })
               .catch(err => {
                   console.log("Erro ao tentar deletar a sugestão.");
                   res.redirect('../usuarios/configuracoes');
               });
        });

        this.router.post('/buscarMeme', (req, res) => {
            let searchQuery = req.body.searchQuery;
            //Tratamento mínimo das categorias
            searchQuery = searchQuery.replace(/ /g, '');
            searchQuery = searchQuery.replace(/#/g, '');
            if (searchQuery.length == 0) {
                //TODO TRATAR ERRO
            } else {
                //Enviar a requisição com os parâmetros da busca para a API para que seja feita a busca no BD
                axios.get(rota + "/memes/buscarMemes", {params: {queryRecebida: searchQuery}})
                    .then(apiResponse => {
                        console.log("Resposta da API: " + apiResponse.status);
                        const memes = apiResponse.data;
                        //Renderizar a página do repositório apenas com os memes retornados pela busca
                        res.render('repositorio.ejs', {memes: memes, usuario: req.user});
                    })
                    .catch(err => {
                        console.log("Erro ao buscar memes na api.");
                        console.log(err);
                    })
            }
        });

        this.router.post('/aprovarMeme', (req, res) => {
            axios.put(rota + "/memes/aprovarMeme" + req.body.memeID)
                .then(apiResponse => {
                    console.log("Meme aprovado com sucesso!");
                    res.redirect('../usuarios/configuracoes');
                })
                .catch(err => {
                    console.log("Erro ao aprovar meme");
                    res.redirect('../usuarios/configuracoes');
                })
        });

        this.router.post('/buscarMemeAssociacao', (req, res) => {
            let searchQuery = req.body.searchQuery;
            //Tratamento mínimo das categorias
            searchQuery = searchQuery.replace(/ /g, '');
            searchQuery = searchQuery.replace(/#/g, '');
                //Enviar a requisição com os parâmetros da busca para a API para que seja feita a busca no BD
                axios.get(rota + "/memes/buscarMemes", {params: {queryRecebida: searchQuery}})
                    .then(apiResponse => {
                        console.log("Resposta da API: " + apiResponse.status);
                        const memes = apiResponse.data;
                        let html = "";
                        memes.forEach( meme=>{
                            html = html+"<img data-idMeme='"+meme._id+"'onclick='associarMeme(this)' data-dismiss='modal' style='cursor:pointer;' class='memeImage' src='"+meme.urlImgur+"'>";
                        });
                        //Renderizar a página do repositório apenas com os memes retornados pela busca
                        res.send(html);
                    })
                    .catch(err => {
                        console.log("Erro ao buscar memes na api.");
                        console.log(err);
                    })
        });

    }
}
module.exports = MemesRoute;