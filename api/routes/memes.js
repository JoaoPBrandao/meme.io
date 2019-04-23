const express = require('express');
const router = express.Router();
const mongoose = require("mongoose");
const Meme = require(process.cwd() + "/models/memeModel.js");

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

router.delete('/:idMeme', async (req, res) => {
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

router.put('/:idMeme', (req, res) => {
    console.log("Requisição para alterar meme recebida.");
    Meme.updateOne({
        "_id": req.params.idMeme
    }, {
        categorias: req.body
    }, err => {
        if (err) console.log("Erro no update do meme: " + err)
    }).then(() => {
        console.log("Meme atualizado com sucesso!");
        res.status(200).send("Meme atualizado com sucesso!");
    }).catch(err => {
        console.log("Erro ao atualizar meme: " + err);
        res.status(400).send("Erro ao atualizar meme: " + err);
    })
});

router.get('/buscarMemes', (req, res) => {
    console.log(req.query.queryRecebida);
    Meme.find({categorias: req.query.queryRecebida}, (err, memes) => {
        if (memes){
            console.log("Memes encontrados pela API.");
            console.log(memes);
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
})

module.exports = router;