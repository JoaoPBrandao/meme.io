const axios = require('axios');
const rota = require('../configs/rota');

// Controllers são classes estáticas com o único objetivo de agregar, semanticamente, funções a serem chamadas pelas
// rotas. Essas funções devem executar a lógica do negócio.
class UsuariosController {
  //Função para garantir as regras de negocio aplicadas sobre o email dos usuarios
  static async verificarEmailUnico(email) {
    let resultado = await this.buscarUsuario(email);
    return !resultado;
  }

  //Função para validar email
  static validarEmail(email) {
    const reg = /^\w+([-+.']\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/;
    return reg.test(email);
  }

  //Função para validar senha de acordo com as regras de negócio
  static validarSenha(senha, nome) {
    const reg = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/;
    if (senha.includes(nome)) {
      return false;
    }
    return reg.test(senha);
  }

  //Função para validar nome
  static validarNome(nome) {
    const reg = /(-?([A-Z].\s)?([A-Z][a-z]+)\s?)+([A-Z]'([A-Z][a-z]+))?/;
    return reg.test(nome);
  }

  //Função para procurar um usuário na base
  static async buscarUsuario(email) {
    let resultado = false;
    await axios
      .get(rota + '/usuarios?email=' + email)
      .then(apiResponse => {
        resultado = JSON.stringify(apiResponse.data[0]);
      })
      .catch(err => {
        console.log('Erro buscar usuário: ' + err);
        return false;
      });
    console.log('buscarUsuario retornando: ' + resultado);
    return resultado;
  }

  //Função para procurar um usuário ativo na base
  static async buscarUsuarioAtivo(email) {
    let resultado = false;
    await axios
      .get(rota + '/usuarios?email=' + email + '&status=1')
      .then(apiResponse => {
        resultado = JSON.stringify(apiResponse.data[0]);
      })
      .catch(err => {
        console.log('Erro buscar usuário: ' + err);
        return false;
      });
    return resultado;
  }

  //Função para encontrar o id de um usuário
  static async buscarUsuarioRetornaId(email) {
    let usuario = await this.buscarUsuario(email).catch(err => {
      console.log('erro no buscarUsuarioRetornaId: ' + err);
    });
    if (usuario) {
      usuario = JSON.parse(usuario);
      return usuario._id;
    } else {
      return false;
    }
  }
}

module.exports = UsuariosController;
