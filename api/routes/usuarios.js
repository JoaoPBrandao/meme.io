const express = require('express');
const router = express.Router();
const mongoose = require("mongoose");
const Usuario = require(process.cwd() + "/models/usuarioModel.js");

//Rota que realiza a busca de usuários no banco de dados
//Recebe o e-mail do usuário pelo path da chamada
//Retorna um objeto que representa o usuário encontrado
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
//Retorna um array com os usuários que são administradores
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

//Rota para conceder privilégios de administrador a um usuário
//Recebe o e-mail do usuário em questão através do path da chamada
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

//Rota para revogar os privilégios de administrador de um usuário
//Recebe o e-mail do usuário em questão através do path da chamada
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

//Rota para banir um usuário do sistema
//Recebe o e-mail do usuário em questão pelo path da chamada
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

//Rota para buscar um usuário no banco de dados através do seu ID
//Recebe o ID do usuário em questão pelo path da chamada
router.get('/id', async (req, res) => {
    Usuario.findById(req.query._id, (err, usuario) => {
        res.status(200).send(usuario);
    })
        .catch((err) => {
            console.log(err);
            res.status(400).send("Erro no processamento.");
        });

});

//Rota para buscar um usuário no banco de dados através do seu e-mail
//Recebe o e-mail do usuário em questão pelo path da chamada
router.get('/email', async (req, res) => {
    Usuario.find({email : req.query.email}, (err, usuario) => {
        res.status(200).send(usuario[0]);
    })
        .catch((err) => {
            console.log(err);
            res.status(400).send("Erro no processamento.");
        });

});

//Rota para criar um novo usuário no banco de dados
//Recebe um objeto com os atributos do novo usuário que será instanciado
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

//Rota para desativar um usuário
//Recebe o ID do usuário através path da chamada
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

//Rota para atualizar o nome do usuário
//Recebe o ID do usuário através do path da chamada
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

//Rota para atualizar o e-mail do usuário
//Recebe o ID do usuário através do path da chamada
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

//Rota para atualizar a senha do usuário
//Recebe o ID do usuário através do path da chamada
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

//Rota para atualizar a foto do usuário
//Recebe o ID do usuário através do path da chamada
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

//Rota para reativar a conta de um usuário
//Recebe o ID do usuário através do path da chamada
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

//Rota para recuperar a senha de um usuário
//Recebe o e-mail do usuário em questão, a chave para recuperar a senha e sua validade
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

//Rota que realiza a busca de um usuário no banco de dados (Específica para a recuperação de senha)
//Recebe a chave para a recuperação da senha através do path da chamada
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

//Rota que atualiza o número de denúncias de um usuário
//Recebe o ID do usuário através do path da chamada
router.put('/atualizarDenuncia:idUsuario', async (req, res) => {
    let usuarioEncontrado;
    await Usuario.findById(req.params.idUsuario, (err, usuario) => {
        usuarioEncontrado = usuario;
    })
        .catch(err => {
            console.log(err.message);
            res.status(400).send("Erro ao buscar usuário.");
        });
    //Checar se o usuário já tem 2 denúncias aprovadas
        //Caso seja verdadeiro, banir o usuário
        //Caso seja falso, incrementar em 1 o número de denúncias aprovadas do usuário
        if (usuarioEncontrado.denunciasAprovadas == 2){
            Usuario.updateOne({"email": usuarioEncontrado.email}, {status: 0,denunciasAprovadas: 3})
                .then(() => {
                res.status(200).send("Usuário banido.");
            })
            .catch(err => {
                if (err) {
                    console.log("Erro ao banir usuário.");
                    res.status(400).send("Erro ao banir usuário.");
                }
            });
    }else{
        Usuario.updateOne({"_id": req.params.idUsuario}, { $inc: {"denunciasAprovadas": 1}})
            .then(() => {
                res.status(200).send("Usuario atualizado.");

            })
            .catch(err => {
                res.status(400).send("Erro ao atualizar usuario.");
            });
    }
});

//Rota que realiza o unfollow de um meme por um usuário
//Recebe o ID do usuário e o ID do meme através do path da chamada
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

//Rota que realiza o follow de um meme por um usuário
//Recebe o ID do usuário e o ID do meme através do path da chamada
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

//Rota que realiza o unfollow de um usuário por outro usuário
//Recebe os IDs dos dois usuários através do path da chamada
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

//Rota que realiza o follow de um usuário por outro usuário
//Recebe os IDs dos dois usuários através do path da chamada
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