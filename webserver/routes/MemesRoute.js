const axios = require("axios"); // Usamos Axios para fazer as requests à API
const Route = require("./Route.js");

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

        this.router.post('/novoMeme', (req, res) => {
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
                meme.foto = req.body.arquivoEnviado;
                axios.post("http://localhost" + ":" + "3000" + "/memes", meme)
                    .then((apiResponse) => {
                        console.log("Resposta da API: " + apiResponse.status);
                        res.redirect('/memes/');
                    })
                    .catch((err) => {
                        console.log(err);
                    });
            }
        });

        this.router.post('/deletarMeme', (req, res) => {
            axios.delete("http://localhost" + ":" + "3000" + "/memes/" + req.body.memeID)
                .then((apiResponse) => {
                    console.log("Resposta da API: " + apiResponse.status);
                    res.redirect('/memes/'); // TODO: RENDER success FLASH MESSAGE
                })
                .catch((err) => {
                    console.log("Erro ao deletar meme: " + err.data);
                });
        });

        this.router.post('/acessarPerfilMeme', async (req, res) => {
            let meme = {};
            await axios.get("http://localhost" + ":" + "3000" + "/memes/" + req.body.memeID)
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

    }
}
module.exports = MemesRoute;