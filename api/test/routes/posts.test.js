const supertest = require('supertest');
const app = require('../../server');
const mocha = require('mocha');
let describe = mocha.describe;
const Denuncia = require('../../models/denunciaModel');
const sinon = require("sinon").createSandbox();
const faker = require("faker");
const assert = require("assert").strict;

describe('Rota posts', function() {
    this.afterEach(() => {
        sinon.restore();
    });
    describe('GET /posts/denuncias', function () {
        it('retornar json', function (done) {
            const denuncia = {
                postID: '0',
                postUrlImgur: '1',
                postConteudo: '2',
                usuarioID: '3',
                conteudo: '4',
                idImgur: '5'
            };

            sinon
                .mock(Denuncia)
                .expects("find")
                .resolves(denuncia);

            supertest(app)
                .get('/posts/denuncias')
                .expect('Content-Type', /json/)
                .expect(200, done);
        });
        it('Problema ao buscar denúncias', function (done) {
            sinon
                .mock(Denuncia)
                .expects("find")
                .rejects();

            supertest(app)
                .get('/posts/denuncias')
                .expect("Erro ao buscar as denúncias no BD!")
                .expect(400, done);
        });
    });
    describe('DELETE /posts', function () {
        it('retornar json', function (done) {
            const denuncia = {
                postID: '0',
                postUrlImgur: '1',
                postConteudo: '2',
                usuarioID: '3',
                conteudo: '4',
                idImgur: '5'
            };

            sinon
                .mock(Denuncia)
                .expects("deleteMany")
                .resolves();

            supertest(app)
                .delete('/posts/deletarDenuncias')
                .expect('Denuncia deletada com sucesso.')
                .expect(200, done);
        });
        it('Problema ao deletar denúncias', function (done) {
            sinon
                .mock(Denuncia)
                .expects("deleteMany")
                .rejects();

            supertest(app)
                .delete('/posts/deletarDenuncias')
                .expect("Erro ao deletar denuncia.")
                .expect(400, done);
        });
    });
    describe('POST /posts', function () {
        it('retornar json', function (done) {
            const denuncia = {
                postID: '0',
                postUrlImgur: '1',
                postConteudo: '2',
                usuarioID: '3',
                conteudo: '4',
                idImgur: '5'
            };

            sinon
                .mock(Denuncia.prototype)
                .expects("save")
                .resolves();

            supertest(app)
                .post('/posts/denunciarPost')
                .expect('Denúncia salva com sucesso.')
                .expect(200, done);
        });
        it('Problema ao criar denúncia', function (done) {
            sinon
                .mock(Denuncia.prototype)
                .expects("save")
                .rejects();

            supertest(app)
                .post('/posts/denunciarPost')
                .expect("Problema salvando denúncia.")
                .expect(400, done);
        });
    });
})