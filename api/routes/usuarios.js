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

router.get('/id', async (req, res) => {
    Usuario.findById(req.query._id, (err, usuario) => {
        res.status(200).send(usuario);
    })
        .catch((err) => {
            console.log(err);
            res.status(400).send("Erro no processamento.");
        });

});

router.get('/email', async (req, res) => {
    Usuario.find({email : req.query.email}, (err, usuario) => {
        res.status(200).send(usuario[0]);
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

router.put('/desativarUsuario:idUsuario', (req, res) => {
    console.log("Requisição put recebida");
    const idUsuario = req.params.idUsuario;
    Usuario.updateOne({
        "_id": idUsuario,
        "status": 2
    }, {
        status: 1
    }, err => {
        if(err) {
            console.log("Erro ao desativar usuário: " + err.message);
        }
    })
        .then(() => {
            res.status(200).send("Usuário desativado com sucesso.")
        })
        .catch(err => {
            console.log(err.message);
            res.status(500).send(err);
        });
});

router.put('/atualizarNome:idUsuario', (req, res) => {
    console.log("Requisição put recebida");
    const idUsuario = req.params.idUsuario;
    const nome = req.body.novoNome;
    Usuario.updateOne({
        "_id": idUsuario
    },{
        nome: nome
    }, err => {
        if(err) {
            console.log("Erro: " + err.message);
        }
    })
        .then(() => {
            res.status(200).send("Nome atualizado com sucesso.")
        })
        .catch(err => {
            console.log(err.message)
        });
});

router.put('/atualizarEmail:idUsuario', (req, res) => {
    console.log("Requisição put recebida");
    const idUsuario = req.params.idUsuario;
    const email = req.body.novoEmail;
    Usuario.updateOne({
        "_id": idUsuario
    },{
        email: email
    }, err => {
        if(err) {
            console.log("Erro: " + err.message);
        }
    })
        .then(() => {
            res.status(200).send("E-mail atualizado com sucesso.")
        })
        .catch(err => {
            console.log(err.message)
        });
});

router.put('/atualizarSenha:idUsuario', (req, res) => {
    console.log("Requisição put recebida");
    const idUsuario = req.params.idUsuario;
    const senha = req.body.novaSenha;
    Usuario.updateOne({
        "_id": idUsuario
    },{
        senha: senha
    }, err => {
        if(err) {
            console.log("Erro: " + err.message);
        }
    })
        .then(() => {
            res.status(200).send("Senha atualizada com sucesso.")
        })
        .catch(err => {
            console.log(err.message)
        });
});

router.put('/reativarUsuario:idUsuario', (req, res) => {
    const idUsuario = req.params.idUsuario;
    console.log("Requisição put recebida");
    Usuario.updateOne({
        "_id": idUsuario
    }, {
        status: 2
    }, err => {
        if (err) {
            console.log("Erro: " + err.message);
        }
    })
        .then(() => {
            res.status(200).send("Usuario reativado com sucesso.")
        })
        .catch(err => {
            console.log(err.message)
        });
});

module.exports = router;