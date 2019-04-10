const express = require('express');
const router = express.Router();
const mongoose = require("mongoose");
const Usuario = require(process.cwd() + "/models/usuarioModel.js");

// Rota Denúncias:
router.get('/', (req, res) => {
    console.log(req.query);
    let auxJSON = [];
    Usuario.find(req.query, (err, usuarios) => {
        if(usuarios) { // previnindo "cannot read undefined"
            usuarios.forEach((usuario) => {
                auxJSON.push(usuario);
            });
        }
        else {
            auxJSON.push("Nenhum usuário encontrado.");
        }
    })
    .then(() => {
        res.send(auxJSON);
        res.end();
    })
    .catch((err) => {
        console.log(err);
    });

});
router.post('/', (req, res) => {
    console.log("Post recebido. Objeto: " + req.body.descricao);
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
    Usuario.deleteOne({
        "_id": idUsuario
    }, err => {
        if(err) {
            console.log(err);
        }
    })
        .then(() => {
            res.status(200).send("Usuário deletado com sucesso.")
        })
        .catch(err => {
            console.log(err)
        });
});

module.exports = router;