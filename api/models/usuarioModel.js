const mongoose = require("mongoose");

const usuarioSchema = new mongoose.Schema(
    {
        "nome": {
            "type": String,
            "required": true
        },
        "email": {
            "type": String,
            "required": true
        },
        "status": { // Usuário ativo, inativo ou banido, feito com tipo = Number para ser escalável. 0 = banido, 1 = inativo e 2 = ativo.
            "type": Number,
            "default": 2,
            "required": true
        },
        "foto": {
            "type": String,
            "required": true,
            "default": 'https://imgur.com/xqCh1RC.jpg'
        },
        "senha": {
            "type": String,
            "required": true
        },
        "adm": {
            "type": Number,
            "default": 0,
            "required": true
        },
        "recuperacao": {
            "type": Array,
            "default": [],
            "required": true
        },
        "denunciasAprovadas": {
            "type": Number,
            "default": 0,
            "required": true
        },
        "usuariosSeguidos": {
            "type": Array,
            "required": true,
            "default": []
        },
        "memesSeguidos": {
            "type": Array,
            "required": true,
            "default": []
        }
    }
);

const Usuario = mongoose.model('usuario', usuarioSchema);

module.exports = Usuario;