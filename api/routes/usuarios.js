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
//Rota para obter os administradores do sistema no banco de dados
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
//Rota para conceder privilégios de administrador a um usuário (através do e-mail)
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
//Rota para revogar os privilégios de administrador de um usuário (através do e-mail)
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
//Rota para banir um usuário do sistema (através do e-mail)
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
//Rota para buscar um usuário através do ID
router.get('/id', async (req, res) => {
    Usuario.findById(req.query._id, (err, usuario) => {
        res.status(200).send(usuario);
    })
        .catch((err) => {
            console.log(err);
            res.status(400).send("Erro no processamento.");
        });

});
//Rota para buscar um usuário através do e-mail
router.get('/email', async (req, res) => {
    Usuario.find({email : req.query.email}, (err, usuario) => {
        res.status(200).send(usuario[0]);
    })
        .catch((err) => {
            console.log(err);
            res.status(400).send("Erro no processamento.");
        });

});
//Rota para criar um novo usuário
router.post('/', (req, res) => {
    console.log("Post recebido.");
    //Armazenar as informações do usuário em um objeto
    const usuarioNovo = new Usuario({
        nome: req.body.nome,
        email: req.body.email,
        senha: req.body.senha
    });
    //Salvar o usuário no BD
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
//Rota para desativar um usuário através do ID
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
//Rota para atualizar o nome do usuário através do ID
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
//Rota para atualizar o e-mail do usuário através do ID
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
//Rota para atualizar a senha do usuário através do ID
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
//Rota para atualizar a foto do usuário através do ID
router.put('/alterarFotoUsuario=:idUsuario', (req, res) => {
    Usuario.updateOne({"_id": req.params.idUsuario}, {"foto": req.body.novaFoto})
        .then(() => {
            res.status(200).send("Foto atualizada com sucesso!");
        })
        .catch(err => {
            if(err){
                console.log("Erro ao atualizar foto.");
                res.status(400).send("Erro ao atualizar foto.");
            }
        });
});
//Rota para reativar o usuário através do ID
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
//Rota para que um usuário recupere a sua senha
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
//Rota que atualiza o número de denúncias de um usuário através do ID
router.put('/atualizarDenuncia:idUsuario', async (req, res) => {
    await Usuario.findById(req.params.idUsuario, (err, usuario) => {
        //Checar se o usuário já tem 2 denúncias aprovadas
        if (usuario.denunciasAprovadas == 2){
            Usuario.updateOne({"email": usuario.email}, {status: 0,denunciasAprovadas: 3})
                .then(() => {
                    res.status(200).send("Usuário banido.");
                })
                .catch(err => {
                    if (err) {
                        console.log("Erro ao banir usuário.");
                        res.status(400).send("Erro ao banir usuário.");
                    }
                });
        }
    })
        .catch(err => {
            console.log(err.message);
            res.status(400).send("Erro ao buscar usuário.");
        });
    Usuario.updateOne({"_id": req.params.idUsuario}, { $inc: {"denunciasAprovadas": 1}})
        .then(() => {
            res.status(200).send("Usuario atualizado.");

        })
        .catch(err => {
            res.status(400).send("Erro ao atualizar usuario.");
        });
});

router.put('/unfollowMeme:usuarioID/:memeID', (req, res) => {
    Usuario.updateOne({"_id": req.params.usuarioID}, { $pull: {"memesSeguidos": req.params.memeID}})
        .then(() => {
            res.status(200).send("Meme unfollowed com sucesso.");
        })
        .catch(err => {
            if (err) {
                console.log("Erro ao unfollow meme: " + err.message);
                res.status(400).send("Erro ao unfollow meme: " + err.message);
            }
        });
});

router.put('/seguirMeme:usuarioID/:memeID', (req, res) => {
    Usuario.updateOne({"_id": req.params.usuarioID}, { $push: {"memesSeguidos": req.params.memeID}})
        .then(() => {
            res.status(200).send("Meme seguido com sucesso.");
        })
        .catch(err => {
            if (err) {
                console.log("Erro ao seguir meme: " + err.message);
                res.status(400).send("Erro ao seguir meme: " + err.message);
            }
        });
});

router.put('/unfollowUsuario:usuarioID/:usuarioVisitadoID', (req, res) => {
    Usuario.updateOne({"_id": req.params.usuarioID}, { $pull: {"usuariosSeguidos": req.params.usuarioVisitadoID}})
        .then(() => {
            res.status(200).send("Usuário unfollowed com sucesso.");
        })
        .catch(err => {
            if (err) {
                console.log("Erro ao unfollow usuário: " + err.message);
                res.status(400).send("Erro ao unfollow usuário: " + err.message);
            }
        });
});

router.put('/seguirUsuario:usuarioID/:usuarioVisitadoID', (req, res) => {
    Usuario.updateOne({"_id": req.params.usuarioID}, { $push: {"usuariosSeguidos": req.params.usuarioVisitadoID}})
        .then(() => {
            res.status(200).send("Usuário seguido com sucesso.");
        })
        .catch(err => {
            if (err) {
                console.log("Erro ao seguir Usuário: " + err.message);
                res.status(400).send("Erro ao seguir Usuário: " + err.message);
            }
        });
});

module.exports = router;