const express = require('express');
const router = express.Router();
const mongoose = require("mongoose");
const Usuario = require(process.cwd() + "/models/usuarioModel.js");

// Rota usuários:
router.get('/', (req, res) => {
    console.log(req.query);
    let auxJSON = [];
    Usuario.find(req.query, (err, usuarios) => {
        if(usuarios) { // previnindo "cannot read undefined"
            usuarios.forEach((usuario) => {
                auxJSON.push(usuario);
            });
        }
    })
    .then(() => {
        if(auxJSON) {
            res.status(200).send(JSON.stringify(auxJSON));
        }
        else {
            res.status(200).send();
        }
        res.end();
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
        "_id": idUsuario
    }, {
        status: 0
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

router.put('/:idUsuario', (req, res) => {
    console.log("Requisição put recebida");
    const idUsuario = req.params.idUsuario;
    Usuario.updateOne({
        "_id": idUsuario
    },{
        nome: req.body.nome,
        senha: req.body.senha
    }, err => {
        if(err) {
            console.log("Erro: " + err);
        }
    })
        .then(() => {
            res.status(200).send("Usuário atualizado com sucesso.")
        })
        .catch(err => {
            console.log(err)
        });
});

module.exports = router;