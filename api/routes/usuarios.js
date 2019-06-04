const express = require('express');
const router = express.Router();
const mongoose = require("mongoose");
const Usuario = require(process.cwd() + "/models/usuarioModel.js");

//ROTA QUE REALIZA A BUSCA DOS USUÁRIOS NO SISTEMA PELO EMAIL
router.get('/buscarUsuario:emailUsuario', async (req, res) => {
    Usuario.findOne({
        "email": req.params.emailUsuario
    }, (err, usuario) => {
        if (err) {
            console.log("Erro ao buscar usuário.");
            res.status(400).send("Erro ao buscar usuário.");
        }else{
            res.status(200).send(usuario);
        }
    });
});

router.get('/administradores', async (req, res) => {
    Usuario.find({
        "adm": 1
    }, (err, adms) => {
        if (err){
            console.log("Erro ao buscar administradores.");
            res.status(400).send("Erro ao buscar administradores.");
        }else{
            res.status(200).send(adms);
        }
    })
});

router.put('/concederPrivilegios:emailUsuario', (req, res) => {
    Usuario.updateOne({
        "email": req.params.emailUsuario
    }, {
        adm: 1
    }, err => {
        if (err) {
            console.log("Erro ao conceder privilégios de administrador.");
            console.log(err.message);
        }
    }).then(() => {
        console.log("Privilégios concedidos com sucesso");
        res.status(200).send("Privilégios concedidos com sucesso!");
    })
    .catch(err => {
        console.log("Erro ao conceder privilégios.");
        res.status(400).send("Erro ao conceder privilégios");
    });
});

router.put('/revogarPrivilegios:emailUsuario', (req, res) => {
    Usuario.updateOne({
        "email": req.params.emailUsuario
    }, {
        adm: 0
    }, err => {
        if (err) {
            console.log("Erro ao revogar privilégios de administrador.");
            console.log(err.message);
        }
    }).then(() => {
        console.log("Privilégios revogados com sucesso");
        res.status(200).send("Privilégios revogados com sucesso!");
    })
        .catch(err => {
            console.log("Erro ao revogar privilégios.");
            res.status(400).send("Erro ao revogar privilégios");
        });
});

router.put('/banirUsuario:emailUsuario', (req, res) => {
    Usuario.updateOne({"email": req.params.emailUsuario}, {status: 0}, err => {
        if (err){
            console.log("Erro ao banir usuário.");
            res.status(400).send("Erro ao banir usuário.");
        };
    })
        .then(() => {
            res.status(200).send("Usuário banido com sucesso.");
        })
        .catch(err => {
            console.log("Erro ao banir usuário.");
            res.status(400).send("Erro ao banir usuário.");
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
        senha: senha,
        recuperacao: []
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

router.put('/recuperarSenha', (req, res) => {
    console.log("Requisição put recebida");
    const emailUsuario = req.body.emailUsuario;
    let recuperacao = [];
    recuperacao.push(req.body.chave);
    recuperacao.push(req.body.validade);
    Usuario.updateOne({
        "email": emailUsuario
    },{
        recuperacao: recuperacao
    }, err => {
        if(err) {
            console.log("Erro: " + err.message);
        }
    })
        .then(() => {
            res.status(200).send("Recuperação definida com sucesso.")
        })
        .catch(err => {
            console.log(err.message)
        });
});

//ROTA QUE REALIZA A BUSCA DOS USUÁRIOS NO SISTEMA
router.get('/buscarChave:chave', async (req, res) => {
    Usuario.findOne({
        "recuperacao": {$all: [req.params.chave]}
    }, (err, usuario) => {
        if (err) {
            console.log("Erro ao buscar usuário.");
            res.status(400).send("Erro ao buscar usuário.");
        }else{
            res.status(200).send(usuario);
        }
    });
});

router.put('/atualizarDenuncia:idUsuario', async (req, res) => {
    await Usuario.findById(req.params.idUsuario, (err, usuario) => {
        if (usuario.denunciasAprovadas == 2){
            Usuario.updateOne({"email": usuario.email}, {status: 0,denunciasAprovadas: 3}, err => {
                if (err){
                    console.log("Erro ao banir usuário.");
                    res.status(400).send("Erro ao banir usuário.");
                };
            })
                .then(() => {})
                .catch(err => {
                    console.log("Erro ao banir usuário.");
                    res.status(400).send("Erro ao banir usuário.");
                });
        }
    })
        .catch((err) => {
            console.log(err);
            res.status(400).send("Erro no processamento.");
        });
    Usuario.updateOne({"_id": req.params.idUsuario}, { $inc: {"denunciasAprovadas": 1}})
        .then(() => {
            res.status(400).send("Usuario atualizado.");

        })
        .catch(err => {
            res.status(400).send("Erro ao atualizar usuario.");
        });
});

module.exports = router;