const express = require('express');
const router = express.Router();
const mongoose = require("mongoose"); //Utilizamos o Mongoose para fazer a integração com o MongoDB
const Post = require(process.cwd() + "/models/postModel.js"); //Importando o modelo utilizado para o documento de Posts no BD
const Denuncia = require(process.cwd() + "/models/denunciaModel.js"); //Importando o modelo utilizado para o documento de Denúncias no BD

//Rota posts:
router.get('/pegarTodosPosts', (req, res) => {
   Post.find({}, (err, posts) => {
       res.status(200).send(posts);
   })
       .catch(err => {
           res.status(400).send("Erro ao pegar posts.");
       });
});

router.post('/novoPost', (req, res) => {
    const novoPost = new Post({
        urlImgur: req.body.urlImgur,
        idImgur: req.body.idImgur,
        data: req.body.data,
        idUsuario: req.body.idUsuario,
        idMemeAssociado: req.body.idMemeAssociado,
        urlImgurUsuario: req.body.urlImgurUsuario,
        nomeUsuario: req.body.nomeUsuario,
        conteudo: req.body.conteudo
    });
    novoPost.save()
        .then(() => {
            res.status(200).send("Post salvo com sucesso");
        })
        .catch((err) => {
            res.status(400).send("Problema salvando Post");
            console.log(err);
        });
});

router.get('/postID&=:postID', (req, res) => {
   Post.findById(req.params.postID, (err, post) => {
       res.status(200).send(post);
   })
       .catch(err => {
           console.log("Erro ao buscar post por ID: " + err.message);
           res.status(400).send("Erro ao buscar post por ID.");
       });
});

router.post('/denunciarPost', (req, res) => {
    const novaDenuncia = new Denuncia({
        postID: req.body.postID,
        usuarioID: req.body.idUsuario,
        conteudo: req.body.conteudo,
        postUrlImgur: req.body.postUrlImgur,
        postConteudo: req.body.postConteudo
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

router.get('/denuncias', (req, res) => {
    Denuncia.find({}, (err, denuncias) => {
        res.status(200).send(denuncias);
    })
        .catch(err => {
            console.log("Erro ao buscar as denúncias no BD:" + err.message);
            res.status(400).send("Erro ao buscar as denúncias no BD!");
        });
});

router.delete('/deletePost:idPost', async (req, res) => {
    let post = {};
    await Post.findById(req.params.idPost, (err, resposta) =>{
        post = resposta;
    }).catch(err => {
        console.log("Erro ao buscar post com o ID requerido.");
    });
    Post.deleteOne({
        "_id": req.params.idPost
    }, err => {
        if (err){
            console.log("Erro ao realizar o delete do post (API): "+ err);
            res.status(400).send("Problema ao deletar post");
        }else{
            res.status(200).send(post);
        }
    });
});

router.delete('/deletarDenuncia:idDenuncia', (req, res) => {
    Denuncia.deleteOne({"_id": req.params.idDenuncia})
        .then(() => {
            res.status(200).send("Denuncia deletada com sucesso.");
        })
        .catch(err => {
            res.status(400).send("Erro ao deletar denuncia.");
        });
});

router.get('/pegarLikes:idPost', (req, res) => {
    Post.findById(req.params.idPost, (err, resposta) => {
        res.status(200).send(resposta.userLikes);
    })
        .catch(err => {
            console.log("Erro ao pegar likes: " + err.message);
            res.status(400).send("Erro ao pegar likes.");
        });
});

router.put('/curtirPost:idPost/:idUsuario/:idPost', (req, res) => {
    Post.updateOne({"_id": req.params.idPost}, {$push: {"userLikes": req.params.idUsuario}, $inc:{"likes": 1}}, err => {
        console.log("Erro ao curtir post: " + err.message);
    })
        .then(() => {
            res.status(200).send("Post curtido com sucesso.");
        })
        .catch(err => {
            console.log("Erro ao curtir post: " + err.message);
            res.status(400).send("Erro ao curtir post.");
        });
});

router.put('/descurtirPost:idPost/:idUsuario/:idPost', (req, res) => {
    Post.updateOne({"_id": req.params.idPost}, {$pull: {"userLikes": req.params.idUsuario}, $inc:{"likes": -1}}, err => {
        console.log("Erro ao descurtir post: " + err.message);
    })
        .then(() => {
            res.status(200).send("Post descurtido com sucesso.");
        })
        .catch(err => {
            console.log("Erro ao descurtir post: " + err.message);
            res.status(400).send("Erro ao descurtir post.");
        });
});

module.exports = router;