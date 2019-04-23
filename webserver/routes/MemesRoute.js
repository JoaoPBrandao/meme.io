const axios = require("axios"); // Usamos Axios para fazer as requests à API
const Route = require("./Route.js");
const multer  = require('multer');
const fs = require('fs');
const imgurClientID = "dfa60a0c4c22fd3";
const accessToken = "1aa1d4cc8db34a63ac9280116a8b6c740fbf63a9";
const imgurClientSecret = "c0f89136de0a5ba20b5f655ee7445f6be2b35dcc";
const date = require('date-and-time');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'static/media/memes')
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname)
    }
})
const upload = multer({storage: storage})

class MemesRoute extends Route {
    constructor(basePath) {
        super('/memes');

        this.router.get('/', async (req, res) => {
            let memes = [];
            await axios.get("http://localhost" + ":" + "3000" + "/memes")
                .then(apiResponse => {
                    memes = apiResponse.data;
                })
            res.render('repositorio.ejs', {memes});
        });

        this.router.post('/novoMeme', upload.single('arquivoEnviado'), (req, res) => {
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
                axios.post('https://api.imgur.com/3/upload',
                        { image: fs.readFileSync(req.file.path, 'base64'),
                            album: 'XUKKNbX',
                            type: 'base64',
                            name: req.file.filename }, {headers:
                        {'Authorization':`Bearer ${accessToken}`}})
                    .then(apiResponse => {
                        fs.unlink(req.file.path, err => {
                            if (err) {
                                console.log("Erro ao excluir a imagem");
                            }
                        });
                        if (apiResponse.data.success == true) {
                            let now = new Date();
                            now = date.format(now, 'DD/MM/YYYY');
                            meme.urlImgur = apiResponse.data.data.link;
                            meme.idImgur = apiResponse.data.data.id;
                            meme.data = now;
                            console.log("Resposta da API do Imgur: " + apiResponse.data.status);
                            axios.post("http://localhost" + ":" + "3000" + "/memes", meme)
                                .then(apiResponse => {
                                    console.log("Resposta da nossa API: " + apiResponse.status);
                                    res.redirect('/memes/');
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

        this.router.post('/deletarMeme', (req, res) => {
            axios.delete("http://localhost" + ":" + "3000" + "/memes/" + req.body.memeID)
                .then((apiResponse) => {
                    console.log("Resposta da API: " + apiResponse.status);
                    axios.delete('https://api.imgur.com/3/image/' + apiResponse.data.idImgur, {headers:
                            {'Authorization':`Bearer ${accessToken}`}})
                        .then(respostaAPI => {
                            console.log("Resposta da API do Imgur ao deletar: " + respostaAPI.data.status);
                        })
                        .catch(err => {
                            console.log("Erro ao excluir a imagem do imgur: " + err);
                        });
                    res.redirect('/memes/'); // TODO: RENDER success FLASH MESSAGE
                })
                .catch((err) => {
                    console.log(err);
                    console.log("Erro ao deletar meme: " + err.data);
                });
        });

        this.router.post('/acessarPerfilMeme', async (req, res) => {
            let meme = {};
            await axios.get("http://localhost" + ":" + "3000" + "/memes/id=" + req.body.memeID)
                .then(apiResponse => {
                    meme = apiResponse.data;
                }).catch(err => {
                    console.log("Erro ao buscar meme: " + err);
                });
            res.render('perfilMeme.ejs', {meme});
        })

        this.router.post('/atualizarMeme', (req, res) => {
            let novoCategorias = req.body.novasCategorias;
            //Tratamento mínimo das categorias
            novoCategorias = novoCategorias.replace(/ /g, '');
            novoCategorias = novoCategorias.replace(/#/g, '');
            //Checando se existe no mínimo 1 categoria
            if (novoCategorias.length == 0) {
                //TODO TRATAR ERRO
            } else {
                novoCategorias = novoCategorias.split(";");
                axios.put("http://localhost" + ":" + "3000" + "/memes/" + req.body.memeID, novoCategorias)
                    .then(apiResponse => {
                        res.redirect('/memes/'); // TODO: RENDER success FLASH MESSAGE
                    }).catch(err => {
                        console.log(err);
                        res.redirect('/memes/'); // TODO: RENDER failure FLASH MESSAGE
                });
            }
        });

        this.router.post('/buscarMeme', (req, res) => {
            let searchQuery = req.body.searchQuery;
            //Tratamento mínimo das categorias
            searchQuery = searchQuery.replace(/ /g, '');
            searchQuery = searchQuery.replace(/#/g, '');
            if (searchQuery.length == 0) {
                //TODO TRATAR ERRO
            } else {
                //searchQuery = searchQuery.split(';');
                //const newQuery = searchQuery.map(query => {
                //    JSON.parse(`{"categorias": "/${query}/"}`);
                //});
                console.log(searchQuery);
                axios.get("http://localhost" + ":" + "3000" + "/memes/buscarMemes", {params: {queryRecebida: searchQuery}})
                    .then(apiResponse => {
                        console.log("Resposta da API: " + apiResponse.status);
                        console.log(apiResponse.data);
                        const memes = apiResponse.data;
                        res.render('repositorio.ejs', {memes});
                    })
                    .catch(err => {
                        console.log("Erro ao buscar memes na api.");
                        console.log(err);
                    })
            }
        })

    }
}
module.exports = MemesRoute;