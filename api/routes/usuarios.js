const express = require('express');
const router = express.Router();
const mongoose = require("mongoose");
const Usuario = require(process.cwd() + "/models/usuarioModel.js");

// Rota usuários:
router.get('/', async (req, res) => {
    Usuario.find(req.query, (err, usuarios) => {
        let auxJSON = JSON.stringify(usuarios);
        res.status(200).send(auxJSON);
    })
    .catch((err) => {
        console.log(err);
        res.status(400).send("Erro no processamento.");
    });

});
router.post('/', (req, res) => {
    console.log("Post recebido.");
    const usuarioNovo = new Usuario({
        nome: req.body.nome,
        email: req.body.email,
        senha: req.body.senha
    });
    usuarioNovo.save()
        .then(() => {
            usuarioNovo._id = "[redatado]";
            res.status(200).send("Usuário salvo com sucesso" + usuarioNovo.toString());
        })
        .catch((err) => {
            usuarioNovo._id = "[redatado]";
            res.status(400).send("Problema salvando usuário" + usuarioNovo.toString());
            console.log(err);
        });
});

router.delete('/:idUsuario', (req, res) => {
    console.log("Requisição delete recebida");
    const idUsuario = req.params.idUsuario;
    Usuario.updateOne({
        "_id": idUsuario,
        "status": 1
    }, {
        status: 0
    }, err => {
        if(err) {
            //console.log(err);
        }
    })
        .then(() => {
            res.status(200).send("Usuário deletado com sucesso.")
        })
        .catch(err => {
            //console.log(err)
            res.status(500).send(err);
        });
});

router.put('/:idUsuario', (req, res) => {
    console.log("Requisição put recebida");
    const idUsuario = req.params.idUsuario;
    console.log("Prestes a chamar updateOne: " + idUsuario + req.body.email);
    Usuario.updateOne({
        "_id": idUsuario
    },{
        nome: req.body.novoNome,
        senha: req.body.novaSenha,
        email: req.body.novoEmail
    }, err => {
        if(err) {
            console.log("Erro: " + err.message);
        }
    })
        .then(() => {
            res.status(200).send("Usuário atualizado com sucesso.")
        })
        .catch(err => {
            console.log(err.message)
        });
});

module.exports = router;