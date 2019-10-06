const supertest = require('supertest');
const app = require('../../server');
const mocha = require('mocha');
let describe = mocha.describe;
const Usuario = require('../../models/usuarioModel.js');
const sinon = require("sinon").createSandbox();
const faker = require("faker");
const assert = require("assert").strict;

let id;

describe('Rota usuarios', function() {
    this.afterEach(() => {
        sinon.restore();
    });
    describe('GET /user', function () {
        it('retornar json', function (done) {
            const user = {
                nome: faker.name.findName(),
                email: faker.internet.email(),
                status: 2,
                foto: 'https://imgur.com/xqCh1RC.jpg',
                senha: faker.internet.email()
            };

            sinon
                .mock(Usuario)
                .expects("find")
                .resolves(user);

            supertest(app)
                .get('/usuarios')
                .expect('Content-Type', /json/)
                .expect(200, done);
        });
        it('retornar json recuperação', function (done) {
            const user = {
                nome: faker.name.findName(),
                email: faker.internet.email(),
                status: 2,
                foto: 'https://imgur.com/xqCh1RC.jpg',
                senha: faker.internet.email()
            };

            sinon
                .mock(Usuario)
                .expects("find")
                .resolves(user);
            supertest(app)
                .get('/usuarios?recuperacao=asada')
                .expect('Content-Type', /json/)
                .expect(200, done);
        });
        it('Problema ao buscar usuário', function (done) {
            sinon
                .mock(Usuario)
                .expects("find")
                .rejects();

            supertest(app)
                .get('/usuarios?recuperacao=asada')
                .expect("Erro ao buscar usuário.")
                .expect(400, done);
        });
    });
    describe('POST /user', function () {
        it('Retornar 200 ao criar usuario', function (done) {
            let user = {
                nome: faker.name.findName(),
                email: faker.internet.email(),
                status: 2,
                foto: 'https://imgur.com/xqCh1RC.jpg',
                senha: faker.internet.email()
            };

            sinon
                .mock(Usuario.prototype)
                .expects("save")
                .resolves(user);

            supertest(app)
                .post('/usuarios')
                .send(user)
                .expect('Usuário salvo com sucesso')
                .expect(200, done);
        });
        it('Retornar 400 erro ao criar usuário', function (done) {
            let user = {
                nome: faker.name.findName(),
                email: faker.internet.email(),
                status: 2,
                foto: 'https://imgur.com/xqCh1RC.jpg',
                senha: faker.internet.email()
            };

            sinon
                .mock(Usuario.prototype)
                .expects("save")
                .rejects();

            supertest(app)
                .post('/usuarios')
                .send(user)
                .expect('Problema salvando usuário')
                .expect(400, done);
        });
    });
    describe('PUT /user', function () {
        it('Retornar 200 ao conceder privilégio de administrador', function (done) {
            sinon
                .mock(Usuario)
                .expects("updateOne")
                .resolves();

            supertest(app)
                .put('/usuarios/concederPrivilegios'+"email")
                .expect('Privilégios concedidos com sucesso!')
                .expect(200, done);
        });

        it('Retornar 400 ao conceder privilégio de administrador', function (done) {
            sinon
                .mock(Usuario)
                .expects("updateOne")
                .rejects();

            supertest(app)
                .put('/usuarios/concederPrivilegios'+'email')
                .expect('Erro ao conceder privilégios')
                .expect(400, done);
        });

        it('Retornar 200 ao revogar privilégio de administrador usuário', function (done) {
            sinon
                .mock(Usuario)
                .expects("updateOne")
                .resolves();

            supertest(app)
                .put('/usuarios/revogarPrivilegiosteste@teste.com')
                .expect('Privilégios revogados com sucesso!')
                .expect(200, done);
        });
        it('Retornar 400 ao revogar privilégio de administrador usuário', function (done) {
            sinon
                .mock(Usuario)
                .expects("updateOne")
                .rejects();

            supertest(app)
                .put('/usuarios/revogarPrivilegiosteste@teste.com')
                .expect('Erro ao revogar privilégios')
                .expect(400, done);
        });
        it('Retornar 200 ao desativar o usuário', function (done) {
            sinon
                .mock(Usuario)
                .expects("updateOne")
                .resolves();

            supertest(app)
                .put('/usuarios/desativarUsuario'+"id")
                .expect('Usuário desativado com sucesso.')
                .expect(200, done);
        });
        it('Retornar 400 ao desativar o usuário', function (done) {
            sinon
                .mock(Usuario)
                .expects("updateOne")
                .rejects();

            supertest(app)
                .put('/usuarios/desativarUsuario'+"id")
                .expect('Erro ao desativar usuário.')
                .expect(400, done);
        });
        it('Retornar 200 ao reativar o usuário', function (done) {
            sinon
                .mock(Usuario)
                .expects("updateOne")
                .resolves();

            supertest(app)
                .put('/usuarios/reativarUsuario'+'id')
                .expect('Usuario reativado com sucesso.')
                .expect(200, done);
        });
        it('Retornar 400 ao reativar o usuário', function (done) {
            sinon
                .mock(Usuario)
                .expects("updateOne")
                .rejects();

            supertest(app)
                .put('/usuarios/reativarUsuario'+'id')
                .expect('Erro ao reativar usuario.')
                .expect(400, done);
        });
        it('Retornar 200 ao alterar o nome do usuário', function (done) {
            sinon
                .mock(Usuario)
                .expects("updateOne")
                .resolves();

            supertest(app)
                .put('/usuarios/atualizarNome'+"id")
                .send({novoNome:'nome'})
                .expect('Nome atualizado com sucesso.')
                .expect(200, done);
        });
        it('Retornar 400 ao alterar o nome do usuário', function (done) {
            sinon
                .mock(Usuario)
                .expects("updateOne")
                .rejects();

            supertest(app)
                .put('/usuarios/atualizarNome'+"id")
                .send({novoNome:'nome'})
                .expect('Erro ao atualizar o nome.')
                .expect(400, done);
        });
        it('Retornar 200 ao alterar o email do usuário', function (done) {
            sinon
                .mock(Usuario)
                .expects("updateOne")
                .resolves();

            supertest(app)
                .put('/usuarios/atualizarEmail'+"id")
                .send({novoEmail:"teste2@teste.com"})
                .expect('E-mail atualizado com sucesso.')
                .expect(200, done);
        });
        it('Retornar 400 ao alterar o email do usuário', function (done) {
            sinon
                .mock(Usuario)
                .expects("updateOne")
                .rejects();

            supertest(app)
                .put('/usuarios/atualizarEmail'+"id")
                .send({novoEmail:"teste2@teste.com"})
                .expect('Erro ao atualizar o e-mail.')
                .expect(400, done);
        });
        it('Retornar 200 ao alterar a senha do usuário', function (done) {
            sinon
                .mock(Usuario)
                .expects("updateOne")
                .resolves();

            supertest(app)
                .put('/usuarios/atualizarSenha'+'id')
                .send({novaSenha:"teste2@teste.com"})
                .expect('Senha atualizada com sucesso.')
                .expect(200, done);
        });
        it('Retornar 400 ao alterar a senha do usuário', function (done) {
            sinon
                .mock(Usuario)
                .expects("updateOne")
                .rejects();

            supertest(app)
                .put('/usuarios/atualizarSenha'+'id')
                .send({novaSenha:"teste2@teste.com"})
                .expect('Erro ao atualizar o senha.')
                .expect(400, done);
        });
        it('Retornar 200 ao alterar a foto do usuário', function (done) {
            sinon
                .mock(Usuario)
                .expects("updateOne")
                .resolves();

            supertest(app)
                .put('/usuarios/alterarFotoUsuario='+'id')
                .send({foto:"teste2@teste.com"})
                .expect('Foto atualizada com sucesso!')
                .expect(200, done);
        });
        it('Retornar 400 ao alterar a foto do usuário', function (done) {
            sinon
                .mock(Usuario)
                .expects("updateOne")
                .rejects();

            supertest(app)
                .put('/usuarios/alterarFotoUsuario='+'id')
                .send({foto:"teste2@teste.com"})
                .expect('Erro ao atualizar foto.')
                .expect(400, done);
        });
        it('Retornar 200 ao definir a recuperação do usuário', function (done) {
            sinon
                .mock(Usuario)
                .expects("updateOne")
                .resolves();

            supertest(app)
                .put('/usuarios/recuperarSenha')
                .send({emailUsuario:"teste2@teste.com", chave:"123",validade:Date.now()})
                .expect('Recuperação definida com sucesso.')
                .expect(200, done);
        });
        it('Retornar 400 ao definir a recuperação do usuário', function (done) {
            sinon
                .mock(Usuario)
                .expects("updateOne")
                .rejects();

            supertest(app)
                .put('/usuarios/recuperarSenha')
                .send({emailUsuario:"teste2@teste.com", chave:"123",validade:Date.now()})
                .expect('Erro ao definir recuperação.')
                .expect(400, done);
        });
        it('Retornar 200 ao denunciar usuário(+1 denuncia)', function (done) {
            const user = {
                nome: faker.name.findName(),
                email: faker.internet.email(),
                status: 2,
                foto: 'https://imgur.com/xqCh1RC.jpg',
                senha: faker.internet.email(),
                denunciasAprovadas: 0
            };

            sinon
                .mock(Usuario)
                .expects("findOne")
                .resolves(user);

            sinon
                .mock(Usuario)
                .expects("updateOne")
                .resolves();

            supertest(app)
                .put('/usuarios/atualizarDenuncia'+'id')
                .expect('Usuario atualizado.')
                .expect(200, done);
        });
        it('Retornar 400 ao denunciar usuário(usuario encontrado, erro ao contabilizar denuncia)', function (done) {
            const user = {
                nome: faker.name.findName(),
                email: faker.internet.email(),
                status: 2,
                foto: 'https://imgur.com/xqCh1RC.jpg',
                senha: faker.internet.email(),
                denunciasAprovadas: 0
            };

            sinon
                .mock(Usuario)
                .expects("findOne")
                .resolves(user);

            sinon
                .mock(Usuario)
                .expects("updateOne")
                .rejects();

            supertest(app)
                .put('/usuarios/atualizarDenuncia'+'id')
                .expect('Erro ao atualizar usuario.')
                .expect(400, done);
        });
        it('Retornar 200 ao denunciar usuário(usuario banido)', function (done) {
            const user = {
                nome: faker.name.findName(),
                email: faker.internet.email(),
                status: 2,
                foto: 'https://imgur.com/xqCh1RC.jpg',
                senha: faker.internet.email(),
                denunciasAprovadas: 2
            };

            sinon
                .mock(Usuario)
                .expects("findOne")
                .resolves(user);

            sinon
                .mock(Usuario)
                .expects("updateOne")
                .resolves();

            supertest(app)
                .put('/usuarios/atualizarDenuncia'+'id')
                .expect('Usuário banido.')
                .expect(200, done);
        });
        it('Retornar 400 ao denunciar usuário(2 denuncias erro ao banir)', function (done) {
            const user = {
                nome: faker.name.findName(),
                email: faker.internet.email(),
                status: 2,
                foto: 'https://imgur.com/xqCh1RC.jpg',
                senha: faker.internet.email(),
                denunciasAprovadas: 2
            };

            sinon
                .mock(Usuario)
                .expects("findOne")
                .resolves(user);

            sinon
                .mock(Usuario)
                .expects("updateOne")
                .rejects();

            supertest(app)
                .put('/usuarios/atualizarDenuncia'+'id')
                .expect('Erro ao banir usuário.')
                .expect(400, done);
        });
        it('Retornar 400 ao denunciar usuário(erro ao buscar usuário)', function (done) {
            sinon
                .mock(Usuario)
                .expects("findOne")
                .rejects();

            supertest(app)
                .put('/usuarios/atualizarDenuncia'+'id')
                .expect('Erro ao buscar usuário.')
                .expect(400, done);
        });
        it('Retornar 200 ao banir um usuário', function (done) {
            sinon
                .mock(Usuario)
                .expects("updateOne")
                .resolves();

            supertest(app)
                .put('/usuarios/banirUsuario'+"email")
                .expect('Usuário banido com sucesso.')
                .expect(200, done);
        });
        it('Retornar 400 ao banir um usuário', function (done) {
            sinon
                .mock(Usuario)
                .expects("updateOne")
                .rejects();

            supertest(app)
                .put('/usuarios/banirUsuario'+"email")
                .expect('Erro ao banir usuário')
                .expect(400, done);
        });
    });
});