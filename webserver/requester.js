const axios = require("axios");

axios.put('http://localhost:8080/usuarios/atualizarUsuario', {
    novoNomeUsuario: 'Leonardo de Lanna Ferraz',
    novaSenhaUsuario: 'Leonardo1528',
    novoEmailUsuario: 'ldlferraz@gmail.com',
    emailUsuario: 'joaopedro@gmail.com'
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