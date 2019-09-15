const express = require('express');
const router = express.Router();
const mongoose = require("mongoose"); //Utilizamos o Mongoose para fazer a integração com o MongoDB
const Denuncia = require(process.cwd() + "/models/denunciaModel.js"); //Importando o modelo utilizado para o documento de Denúncias no BD

//Rota para criar uma denúncia de um post no banco de dados
//Recebe um objeto com os atributos do post específico
router.post('/denunciarPost', (req, res) => {
    const novaDenuncia = new Denuncia({
        postID: req.body.idPost,
        usuarioID: req.body.idUsuario,
        conteudo: req.body.conteudo,
        postUrlImgur: req.body.urlImgur,
        postConteudo: req.body.conteudoPost,
        idImgur: req.body.idImgur
    });
    novaDenuncia.save()
        .then(() => {
            res.status(200).send("Denúncia salva com sucesso.");
        })
        .catch(err => {
            console.log(err.message);
            res.status(400).send("Problema salvando denúncia.");
        });
});

//Rota para obter todas as denúncias no banco de dados
//Retorna um array com as denúncias encontradas
router.get('/denuncias', (req, res) => {
    Denuncia.find({}, (err, denuncias) => {
        res.status(200).send(denuncias);
    })
        .catch(err => {
            console.log("Erro ao buscar as denúncias no BD:" + err.message);
            res.status(400).send("Erro ao buscar as denúncias no BD!");
        });
});

//Rota para deletar denúncias utilizando uma query recebida através da URL
router.delete('/deletarDenuncias', (req, res) => {
    Denuncia.deleteMany(req.query)
        .then(() => {
            res.status(200).send("Denuncia deletada com sucesso.");
        })
        .catch(err => {
            res.status(400).send("Erro ao deletar denuncia.");
        });
});

module.exports = router;