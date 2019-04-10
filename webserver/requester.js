const axios = require("axios");

// TESTING .post(/denuncias):
axios.post('http://localhost:3000/usuarios', {
    nome: "Rodrigo",
    email: "fodido@gmail.com",
    senha: "leo"
})
.then((res) => {
    console.log("Post enviado com sucesso. Resposta: " + res.status);
})
.catch((err) => {
    console.log(err);
});

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