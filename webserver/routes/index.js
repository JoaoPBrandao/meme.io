const express = require('express');
const router = express.Router();
const axios = require("axios"); // Usamos Axios para fazer as requests à API
const appConfig = require(process.cwd() + '/configs/appConfig.json');

// GET routes:
router.get('/', (req, res) => {
    res.render(process.cwd() + '/views/index.ejs', {});
});

router.get('/comissao', (req, res) => {
    res.render(process.cwd() + '/views/comissao.ejs', {});
});

// POST routes:
router.post('/', (req,res) => {
    let auxDenuncia = {};
    auxDenuncia.descricao = req.body.descricao;
    auxDenuncia.email = req.body.email;
    auxDenuncia.visibilidade = req.body.visibilidade;
    if(!auxDenuncia.descricao || !auxDenuncia.email || auxDenuncia.descricao == "" || auxDenuncia.email == "" || !auxDenuncia.visibilidade || auxDenuncia.visibilidade == "") {
        console.log("Denúncia com problema." + auxDenuncia.descricao + " " + auxDenuncia.email + " " + auxDenuncia.visibilidade);
        res.render(process.cwd() + '/views/', {}); // TODO: RENDER error FLASH MESSAGE
        return;
    }
    axios.post(appConfig.apiHost + ":" + appConfig.apiPort + "/", auxDenuncia) // Exemplo de formato do primeiro argumento: "http://localhost:3000/"
        .then((apiResponse) => {
            console.log("Resposta da API: " + apiResponse.status);
            res.render(process.cwd() + '/views/', {}); // TODO: RENDER success FLASH MESSAGE
        })
        .catch((err) => {
            console.log(err);
        });
});

module.exports = router;
