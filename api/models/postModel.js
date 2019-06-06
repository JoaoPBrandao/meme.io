const mongoose = require("mongoose");

const postSchema = new mongoose.Schema(
    {
        "urlImgur": {
            "type": String,
            "required": true
        },
        "urlImgurUsuario": {
            "type": String,
            "required": true
        },
        "nomeUsuario": {
            "type": String,
            "required": true
        },
        "idImgur": {
            "type": String,
            "required": true
        },
        "idUsuario": {
            "type": String,
            "required": true
        },
        "data": {
            "type": String
        },
        "idMemeAssociado": {
            "type": String,
            "required": true
        },
        "conteudo": {
            "type": String,
            "required": true
        },
        "userLikes": {
            "type": Array,
            "required": true,
            "default": []
        },
        "totalLikes": {
            "type": Number,
            "required": true,
            "default": 0
        }
    }
);

const Post = mongoose.model('post', postSchema);

module.exports = Post;