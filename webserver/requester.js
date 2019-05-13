const axios = require("axios");
const fs = require("fs");
let auxPost
axios.post('https://api.imgur.com/3/upload', {
            image: fs.readFileSync('static/media/memes/beyonce.jpg', 'base64'),
            album: 'XUKKNbX',
            type: 'base64',
            name: 'beyonce.jpg' }, {headers:
        {'Authorization':`Bearer 1aa1d4cc8db34a63ac9280116a8b6c740fbf63a9`}})
    .then(apiResponse => {
        if (apiResponse.success == true) {
            console.log("Resposta da API do Imgur: " + apiResponse.status);
        }
    }).catch((err) =>{
        console.log(err);
});

// axios.put('http://localhost:8080/usuarios/atualizarUsuario', {
//     novoNomeUsuario: 'Leonardo de Lanna Ferraz',
//     novaSenhaUsuario: 'Leonardo1528',
//     novoEmailUsuario: 'ldlferraz@gmail.com',
//     emailUsuario: 'joaopedro@gmail.com'
// })
// .then((res) => {
//     console.log("Post enviado com sucesso. Resposta: " + res.status);
// })
// .catch((err) => {
//     console.log(err);
// });

// TESTING .get(/denuncias):
/* axios.get('http://localhost:3000/denuncias', {})
.then((res) => {
    console.log("Resposta ao GET: " + res.data[0].descricao);
})
.catch((err) => {
    console.log(err);
}); */

/*axios.delete("http://localhost:3000/usuarios/5cacf7a89bf0994cdc3f1c95")
    .then(console.log("Usuário deletado."))
    .catch(err => {
        console.log(err);
    });*/