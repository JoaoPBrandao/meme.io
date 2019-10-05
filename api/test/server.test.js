const supertest = require('supertest');
const app = require('../server');
const mocha = require('mocha');
let describe = mocha.describe;
const Usuario = require(process.cwd() + '/models/usuarioModel.js');

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
        after(function () {
            Usuario.deleteOne({email: 'teste@teste.com'}, function (err) {
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


    });
});