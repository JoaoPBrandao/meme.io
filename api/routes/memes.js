const express = require('express');
const router = express.Router();
const mongoose = require("mongoose"); //Utilizamos o Mongoose para fazer a integração com o MongoDB
const Meme = require(process.cwd() + "/models/memeModel.js"); //Importando o modelo utilizado para o documento de Memes no BD
const Sugestao = require(process.cwd() + "/models/sugestaoModel.js"); //Importando o modelo utilizado para o documento de Sugestões no BD

// Rota memes:
router.post('/', (req, res) => {
    console.log("Post recebido.");
    const novoMeme = new Meme({
        urlImgur: req.body.urlImgur,
        categorias: req.body.categorias,
        data: req.body.data,
        idImgur: req.body.idImgur
    });
    novoMeme.save()
        .then(() => {
            res.status(200).send("Meme salvo com sucesso" + novoMeme.toString());
        })
        .catch((err) => {
            res.status(400).send("Problema salvando Meme" + novoMeme.toString());
            console.log(err);
        });
});

router.get('/', (req, res) => {
        Meme.find({}, (err, memes) => {
            res.status(200).send(memes);
        })
            .catch(err => {
                console.log("Erro ao buscar os memes do BD:" + err);
                res.status(400).send("Erro ao buscar os memes do BD!");
            });
});

router.get('/id=:memeID', (req, res) => {
    Meme.findById(req.params.memeID, (err, meme) => {
        res.status(200).send(meme);
    })
        .catch(err => {
            console.log("Erro ao buscar meme com o ID requerido.");
            res.status(400).send("Erro ao buscar meme com o ID requerido.");
        })
});

router.delete('/deletarMeme:idMeme', async (req, res) => {
    console.log("Requisição de delete do meme recebida.");
    let meme= {};
    await Meme.findById(req.params.idMeme, (err, res) =>{
        meme = res;
    }).catch(err => {
        console.log("Erro ao buscar meme com o ID requerido.");
    });
    Meme.deleteOne({
        "_id": req.params.idMeme
    }, err => {
        if (err){
            console.log("Erro ao realizar o delete do meme (API): "+ err);
            res.status(400).send("Problema ao deletar meme");
        }else{
            res.status(200).send(meme);
        }
    })
});

router.post('/sugestaoAlteracao:idMeme', (req, res) => {
    console.log("Requisição para criar sugestão recebida.");
    const sugestao = new Sugestao({idMeme: req.params.idMeme, categorias: req.body});
    sugestao.save()
        .then(() => {
            res.status(200).send("Sugestão salva com sucesso.");
        })
        .catch(err => {
            res.status(400).send("Erro ao salvar sugestão.");
        });
});

router.get('/sugestoes', (req, res) => {
    Sugestao.find({}, (err, sugestoes) => {
        res.status(200).send(sugestoes);
    })
        .catch(err => {
            console.log("Erro ao buscar as sugestoes do BD:" + err);
            res.status(400).send("Erro ao buscar as sugestoes do BD!");
        });
});

router.put('/validarSugestao:idSugestao', async (req, res) => {
    const sugestaoEncontrada = await Sugestao.findById(req.params.idSugestao)
    const memeEncontrado = await Meme.findById(sugestaoEncontrada.idMeme);
    console.log(sugestaoEncontrada);
    let novasCategorias = [];
    memeEncontrado.categorias.forEach(categoria => {
        novasCategorias.push(categoria);
    });
    sugestaoEncontrada.categorias.forEach(categoria => {
        novasCategorias.push(categoria);
    });
    Meme.updateOne({"_id": memeEncontrado._id}, {"categorias": novasCategorias})
       .then()
       .catch(err => {
           res.status(400).send("Erro ao alterar meme.");
       });
    Sugestao.deleteOne({"_id": sugestaoEncontrada._id})
        .then(() => {
            res.status(200).send("Meme alterado e Sugestão deletada com sucesso.");
        })
        .catch(err => {
            res.status(400).send("Meme alterado porém erro ao deletar sugestão.");
        });
});

router.delete('/deletarSugestao:idSugestao', (req, res) => {
    Sugestao.deleteOne({"_id": req.params.idSugestao})
        .then(() => {
            res.status(200).send("Sugestão deletada com sucesso.");
        })
        .catch(err => {
            res.status(400).send("Erro ao deletar sugestão.");
        });
});

router.delete('/deletarSugestoesDoMeme:idMeme', (req, res) => {
    Sugestao.deleteMany({"idMeme": req.params.idMeme})
        .then(() => {
            res.status(200).send("Sugestões deletadas com sucesso.");
        })
        .catch(err => {
            res.status(400).send("Erro ao deletar sugestões.");
        });
});

router.get('/buscarMemes', (req, res) => {
    //Transformar a string com múltiplas categorias em um vetor com objetos do tipo {categorias: /categoria/i}
    let newQuery = req.query.queryRecebida.split(';');
    newQuery = newQuery.map(query => {
        let queryObject = {};
        queryObject.categorias = new RegExp(query, 'i');
        return queryObject;
    });
    Meme.find({ $and: newQuery}, (err, memes) => {
        if (memes){
            console.log("Memes encontrados pela API.");
            res.status(200).send(memes);
        }else{
            memes = {};
            console.log("A API não encontrou nenhum meme com essas categorias.");
            res.status(200).send(memes);
        }
    }).catch(err => {
        console.log("Erro ao buscar memes no mongo.");
        console.log(err);
    });
});

router.put('/aprovarMeme:idMeme', (req, res)=>{
    Meme.updateOne({
        "_id": req.params.idMeme
    },{
        status: 1
    })
        .then(() => {
            console.log("Meme aprovado com sucesso!");
            res.status(200).send("Meme aprovado com sucesso!");
        })
        .catch(err => {
            console.log("Erro ao aprovar meme: " + err.message);
            res.status(400).send("Erro ao aprovar meme!");
        })
})

module.exports = router;