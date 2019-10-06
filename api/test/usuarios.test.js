const supertest = require('supertest');
const app = require('../server');
const mocha = require('mocha');
let describe = mocha.describe;
const UsuarioModel = require(process.cwd() + '/models/usuarioModel.js');
const Usuario = require(process.cwd() + '/routes/usuarios.js');
const sinon = require('sinon');

let id;

describe('User', function() {
    describe('GET /user', function () {
        it('retornar json', function (done) {
            supertest(app)
                .get('/usuarios')
                .expect('Content-Type', /json/)
                .expect(200, done);
        });
        it('retornar json recuperação', function (done) {
            supertest(app)
                .get('/usuarios?recuperacao=asada')
                .expect('Content-Type', /json/)
                .expect(200, done);
        });
    });
    describe('POST /user', function () {
        it('Retornar 200', function (done) {
            let usuario = {
                nome: 'teste',
                email: 'teste@teste.com',
                senha: 'teste'
            };
            supertest(app)
                .post('/usuarios')
                .send(usuario)
                .expect('Usuário salvo com sucesso')
                .expect(200, done);
        });
        it('Retornar 400 sem nome', function (done) {
            let usuario = {
                nome: null,
                email: 'teste@teste.com',
                senha: 'teste'
            };
            supertest(app)
                .post('/usuarios')
                .send(usuario)
                .expect('Problema salvando usuário')
                .expect(400, done);
        });
        it('Retornar 400 sem email', function (done) {
            let usuario = {
                nome: 'teste',
                email: null,
                senha: 'teste'
            };
            supertest(app)
                .post('/usuarios')
                .send(usuario)
                .expect('Problema salvando usuário')
                .expect(400, done);
        });
        it('Retornar 400 sem senha', function (done) {
            let usuario = {
                nome: 'teste',
                email: 'teste@teste.com',
                senha: null
            };
            supertest(app)
                .post('/usuarios')
                .send(usuario)
                .expect('Problema salvando usuário')
                .expect(400, done);
        });
    });
    describe('PUT /user', function () {
        before(function(){
            UsuarioModel.findOne({email: 'teste@teste.com'}, function (err, usuario) {
                if (err) {
                    return handleError(err);
                }else{
                    id = usuario._id;
                }
            });
        });
        after(function () {
            UsuarioModel.deleteOne({_id: id}, function (err) {
                if (err) {
                    return handleError(err);
                }
            });
        });
        it('Retornar 200 ao conceder privilégio de administrador', function (done) {
            supertest(app)
                .put('/usuarios/concederPrivilegiosteste@teste.com')
                .expect('Privilégios concedidos com sucesso!')
                .expect(200, done);
        });
        it('Retornar 202 ao conceder privilégio de administrador usuário não encontrado', function (done) {
            supertest(app)
                .put('/usuarios/concederPrivilegiosasd')
                .expect('Nenhum usuário encontrado')
                .expect(202, done);
        });
        it('Retornar 202 ao conceder privilégio de administrador usuário já é administrador', function (done) {
            supertest(app)
                .put('/usuarios/concederPrivilegiosteste@teste.com')
                .expect('Nenhum usuário modificado')
                .expect(202, done);
        });
        it('Retornar 200 ao revogar privilégio de administrador usuário', function (done) {
            supertest(app)
                .put('/usuarios/revogarPrivilegiosteste@teste.com')
                .expect('Privilégios revogados com sucesso!')
                .expect(200, done);
        });
        it('Retornar 200 ao desativar o usuário', function (done) {
            supertest(app)
                .put('/usuarios/desativarUsuario'+id)
                .expect('Usuário desativado com sucesso.')
                .expect(200, done);
        });
        it('Retornar 200 ao reativar o usuário', function (done) {
            supertest(app)
                .put('/usuarios/reativarUsuario'+id)
                .expect('Usuario reativado com sucesso.')
                .expect(200, done);
        });
        it('Retornar 200 ao alterar o nome do usuário', function (done) {
            supertest(app)
                .put('/usuarios/atualizarNome'+id)
                .send({novoNome:'nome'})
                .expect('Nome atualizado com sucesso.')
                .expect(200, done);
        });
        it('Retornar 200 ao alterar o email do usuário', function (done) {
            supertest(app)
                .put('/usuarios/atualizarEmail'+id)
                .send({novoEmail:"teste2@teste.com"})
                .expect('E-mail atualizado com sucesso.')
                .expect(200, done);
        });
        it('Retornar 200 ao alterar a senha do usuário', function (done) {
            supertest(app)
                .put('/usuarios/atualizarSenha'+id)
                .send({novaSenha:"teste2@teste.com"})
                .expect('Senha atualizada com sucesso.')
                .expect(200, done);
        });
        it('Retornar 200 ao alterar a foto do usuário', function (done) {
            supertest(app)
                .put('/usuarios/alterarFotoUsuario='+id)
                .send({foto:"teste2@teste.com"})
                .expect('Foto atualizada com sucesso!')
                .expect(200, done);
        });
        it('Retornar 200 ao definir a recuperação do usuário', function (done) {
            supertest(app)
                .put('/usuarios/recuperarSenha')
                .send({emailUsuario:"teste2@teste.com", chave:"123",validade:Date.now()})
                .expect('Recuperação definida com sucesso.')
                .expect(200, done);
        });
        it('Retornar 200 ao denunciar usuário', function (done) {
            this.timeout(15000);
            supertest(app)
                .put('/usuarios/atualizarDenuncia'+id)
                .expect('Usuario atualizado.')
                .expect(200, done);
        });
        it('Retornar 200 ao denunciar usuário segunda vez', function (done) {
            this.timeout(15000);
            supertest(app)
                .put('/usuarios/atualizarDenuncia'+id)
                .expect('Usuario atualizado.')
                .expect(200, done);
        });
        it('Retornar 200 ao denunciar usuário banido', function (done) {
            this.timeout(15000);
            supertest(app)
                .put('/usuarios/atualizarDenuncia'+id)
                .expect('Usuário banido.')
                .expect(200, done);
        });
        it('Retornar 200 ao banir um usuário', function (done) {
            supertest(app)
                .put('/usuarios/banirUsuarioteste2@teste.com')
                .expect('Usuário banido com sucesso.')
                .expect(200, done);
        });
    });
});