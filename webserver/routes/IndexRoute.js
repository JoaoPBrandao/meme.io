const Route = require("./Route.js");

class IndexRoute extends Route {
    constructor(basePath) {
        super('/');

        this.router.get('/', (req, res) => {
            res.render('landingpage.ejs', {});
        });

        this.router.get('/login', (req, res) => {
            res.render('login.ejs', {});
        })
    }
}

module.exports = IndexRoute;



/*

const express = require('express');
const router = express.Router();
const axios = require("axios"); // Usamos Axios para fazer as requests à API
const app = require("../WebServer.js");

// GET routes:
router.get('/', (req, res) => {
    res.render(process.cwd() + '/views/index.ejs', {});
});

router.get('/usuarios/dadospessoais', (req, res) => {
    res.render(process.cwd() + '/views/dadospessoais.ejs')
});
// POST routes:
router.post('/usuarios', (req,res) => {
    let auxUsuario = {};
    let erros = [];
    auxUsuario.nome = req.body.nome;
    auxUsuario.email = req.body.email;
    auxUsuario.senha = req.body.senha;
    if (!validarEmail(email)){
        erros.push('Email inválido');
    }
    if(!verificarEmailUnico(auxUsuario.email)){
        erros.push('Email já cadastrado');
    }
    if(!validarSenha(auxUsuario.senha, auxUsuario.nome)){
        erros.push('Senha inválida');
    }
    if(!validarNome(auxUsuario.nome)){
        erros.push('Nome inválido');
    }
    if(!erros) {
        axios.post(app.apiHost + ":" + app.apiPort + "/", auxUsuario) // Exemplo de formato do primeiro argumento: "http://localhost:3000/"
            .then((apiResponse) => {
                console.log("Resposta da API: " + apiResponse.status);
                res.render(process.cwd() + '/views/login.ejs', {}); // TODO: RENDER success FLASH MESSAGE
            })
            .catch((err) => {
                console.log(err);
            });
    }
    else{
        res.render(process.cwd() + '/views/cadastro.ejs', {erros});
    }
});

// DELETE routes:
router.delete('/usuarios', (req,res) => {
    let auxUsuario = {};
    auxUsuario.email = req.body.email;
    if(!email) {
        console.log("Email não recebido.");
        res.render(process.cwd() + '/views/dadospessoais.ejs', {}); // TODO: RENDER error FLASH MESSAGE
        return;
    }
    auxUsuario.id = buscarUsuarioRetornaId(auxUsuario.email);
    axios.delete(app.apiHost + ":" + app.apiPort + "/usuarios?idUsuario=" + auxUsuario.id) // Exemplo de formato do primeiro argumento: "http://localhost:3000/"
        .then((apiResponse) => {
            console.log("Resposta da API: " + apiResponse.status);
            res.render(process.cwd() + '/views/login.ejs', {}); // TODO: RENDER success FLASH MESSAGE
        })
        .catch((err) => {
            console.log(err);
        });
});

// UPDATE routes:
router.put('/usuarios', async (req,res) => {
    let auxUsuario = {};
    auxUsuario.nome = req.body.nome;
    auxUsuario.senha = req.body.senha;
    auxUsuario.email = req.body.email;
    auxUsuario.id = await buscarUsuarioRetornaId(auxUsuario.email);
    let erros = [];
    if(!validarSenha(auxUsuario.senha, auxUsuario.nome)){
        console.log("Erro Validar senha");
        erros.push('Senha inválida');
    }
    if(!validarNome(auxUsuario.nome)){
        console.log("Erro Validar nome");
        erros.push('Nome inválido');
    }
    if(erros.length == 0) {
        axios.put("http://localhost" + ":" + "3000" + "/usuarios/" + auxUsuario.id, auxUsuario) // Exemplo de formato do primeiro argumento: "http://localhost:3000/"
            .then((apiResponse) => {
                console.log("Resposta da API: " + apiResponse.status);
                res.render(process.cwd() + '/views/dadospessoais.ejs', {}); // TODO: RENDER success FLASH MESSAGE
            })
            .catch((err) => {
                console.log(err);
            });
    }
});

//Função para garantir as regras de negocio aplicadas sobre o email dos usuarios
function verificarEmailUnico(email){
            return (!buscarUsuario(email));
}

//Função para validar email
function validarEmail(email) {
    const reg = /^\w+([-+.']\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/;
    return reg.test(email);
}

//Função para validar senha de acordo com as regras de negócio
function validarSenha(senha, nome){
    const reg = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/;
    if(senha.includes(nome)) {
        return false;
    }
    return(reg.test(senha));
}

//Função para validar nome
function  validarNome(nome){
const reg = /(-?([A-Z].\s)?([A-Z][a-z]+)\s?)+([A-Z]'([A-Z][a-z]+))?/;
return(reg.test(nome));
}

//Função para procurar um usuário na base
async function buscarUsuario(email){
    let resultado = "adeus";
    await axios.get("http://localhost" + ":" + "3000" + "/usuarios?email=" + email)
        .then((apiResponse) => {
            resultado = JSON.stringify(apiResponse.data[0]);
        })
        .catch((err) => {
            console.log("Erro buscar usuário: " + err);
            return false;
        });
        return resultado;
}

//Função para encontrar o id de um usuário
async function buscarUsuarioRetornaId(email){
    let usuario = await buscarUsuario(email);
    usuario = JSON.parse(usuario);
    return usuario._id;
}

module.exports = router;

*/