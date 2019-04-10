const express = require('express');
const router = express.Router();
const axios = require("axios"); // Usamos Axios para fazer as requests à API
const app = require("../server.js");

// GET routes:
router.get('/', (req, res) => {
    res.render(process.cwd() + '/views/index.ejs', {});
});

// POST routes:
router.post('/usuarios', (req,res) => {
    let auxUsuario = {};
    auxUsuario.nome = req.body.nome;
    auxUsuario.email = req.body.email;
    auxUsuario.senha = req.body.senha;
    // TODO validar se email é único
    // TODO validar se a senha obedece as regras de negócio
    if(!auxUsuario.nome  || !auxUsuario.email || !auxUsuario.senha ||auxUsuario.nome == "" || auxUsuario.email == "" || auxUsuario.senha == "") {
        console.log("Cadastro com problema." + auxUsuario.nome + " " + auxUsuario.email + " " + auxUsuario.senha);
        res.render(process.cwd() + '/views/cadastro.ejs', {
            nome: auxUsuario.nome,
            email: auxUsuario.email,
            senha: auxUsuario.senha}); // TODO: RENDER error FLASH MESSAGE
        return;
    }
    axios.post(app.apiHost + ":" + app.apiPort + "/", auxUsuario) // Exemplo de formato do primeiro argumento: "http://localhost:3000/"
        .then((apiResponse) => {
            console.log("Resposta da API: " + apiResponse.status);
            res.render(process.cwd() + '/views/login.ejs', {}); // TODO: RENDER success FLASH MESSAGE
        })
        .catch((err) => {
            console.log(err);
        });
});

// DELETE routes:
router.delete('/usuarios', (req,res) => {
    let email = req.body.email;
    if(!email) {
        console.log("Email não recebido.");
        res.render(process.cwd() + '/views/dadospessoais.ejs', {}); // TODO: RENDER error FLASH MESSAGE
        return;
    }
    axios.delete(app.apiHost + ":" + app.apiPort + "/", auxUsuario) // Exemplo de formato do primeiro argumento: "http://localhost:3000/"
        .then((apiResponse) => {
            console.log("Resposta da API: " + apiResponse.status);
            res.render(process.cwd() + '/views/login.ejs', {}); // TODO: RENDER success FLASH MESSAGE
        })
        .catch((err) => {
            console.log(err);
        });
});

// UPDATE routes:
router.put('/usuarios', (req,res) => {
    let auxUsuario = {};
    auxUsuario.nome = req.body.nome;
    auxUsuario.email = req.body.email;
    auxUsuario.senha = req.body.senha;
    if(!auxUsuario.nome  || !auxUsuario.email || !auxUsuario.senha ||auxUsuario.nome == "" || auxUsuario.email == "" || auxUsuario.senha == "") {
        console.log("Cadastro com problema." + auxUsuario.nome + " " + auxUsuario.email + " " + auxUsuario.senha);
        res.render(process.cwd() + '/views/dadospessoais.ejs', {}); // TODO: RENDER error FLASH MESSAGE
        return;
    }
    axios.put(app.apiHost + ":" + app.apiPort + "/", auxUsuario) // Exemplo de formato do primeiro argumento: "http://localhost:3000/"
        .then((apiResponse) => {
            console.log("Resposta da API: " + apiResponse.status);
            res.render(process.cwd() + '/views/dadospessoais.ejs', {}); // TODO: RENDER success FLASH MESSAGE
        })
        .catch((err) => {
            console.log(err);
        });
});

module.exports = router;