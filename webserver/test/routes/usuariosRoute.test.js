const supertest = require('supertest');
const WebServer = require('../../WebServer');
const webServer = new WebServer(8080, 'localhost', 3000, 'localhost');
const app = webServer.startServer();
const mocha = require('mocha');
let describe = mocha.describe;
const axios = require('axios');
const sinon = require("sinon").createSandbox();
const faker = require("faker");
const assert = require("assert").strict;
const rota = require('../../configs/rota');
const moxios = require('moxios');

describe('Rota usuários', function() {
    this.afterEach(() => {
        sinon.restore();
    });
    describe('GET /usuarios/configuracoes', function(){
            it('renderizar a página com todas as informações', function (done) {

            let user = {
                nome: faker.name.findName(),
                email: faker.internet.email(),
                status: 2,
                foto: 'https://imgur.com/xqCh1RC.jpg',
                senha: faker.internet.email()
            };

            let adm = {data: []};
            let sugestoes = {data: []};
            let denuncias = {data: []};
            let memes = {data: []};

                moxios.stubRequest(rota + '/usuarios?adm=1', {
                    status: 200,
                    response: adm
                });
                moxios.stubRequest(rota + '/posts/denuncias', {
                    status: 200,
                    response: denuncias
                });
                moxios.stubRequest(rota + '/memes', {
                    status: 200,
                    response: memes
                });
                moxios.stubRequest(rota + '/memes/sugestoes', {
                    status: 200,
                    response: sugestoes
                });

            supertest(app)
                .get(rota + '/usuarios/configuracoes')
                .send(user)
                .expect()
                .expect(200, done);

                done();
        });
        it('renderizar a página sem nenhuma das informações', function (done) {

            let user = {
                nome: faker.name.findName(),
                email: faker.internet.email(),
                status: 2,
                foto: 'https://imgur.com/xqCh1RC.jpg',
                senha: faker.internet.email()
            };


            moxios.stubRequest(rota + '/usuarios?adm=1', {
                status: 400,
            });
            moxios.stubRequest(rota + '/posts/denuncias', {
                status: 400,
            });
            moxios.stubRequest(rota + '/memes', {
                status: 400,
            });
            moxios.stubRequest(rota + '/memes/sugestoes', {
                status: 400,
            });

            supertest(app)
                .get(rota + '/usuarios/configuracoes')
                .send(user)
                .expect()
                .expect(400, done);

            done();
        });

    });

});