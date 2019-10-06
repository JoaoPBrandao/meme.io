const supertest = require("supertest"),
  assert = require("assert").strict,
  describe = require("mocha").describe,
  sinon = require("sinon").createSandbox(),
  faker = require("faker"),
  Meme = require("../../models/memeModel"),
  Sugestao = require("../../models/sugestaoModel"),
  httpTest = supertest(require("../../server"));

describe("Memes Controller", function() {
  this.afterEach(() => {
    sinon.restore();
  });

  describe("POST /", () => {
    it("Meme incluído com sucesso", done => {
      const meme = {
        urlImgur: faker.internet.url(),
        categorias: faker.random.arrayElement(),
        data: faker.random.objectElement(),
        idImgur: faker.random.uuid()
      };

      sinon
        .mock(Meme.prototype)
        .expects("save")
        .resolves(meme);

      httpTest
        .post("/memes")
        .send(meme)
        .expect(200)
        .expect(res => {
          assert(res.text, "Meme salvo com sucesso" + meme.toString());
        })
        .end(done);
    });

    it("Problema ao incluir um meme", done => {
      const meme = {
        urlImgur: faker.internet.url(),
        categorias: faker.random.arrayElement(),
        data: faker.random.objectElement(),
        idImgur: faker.random.uuid()
      };

      sinon
        .mock(Meme.prototype)
        .expects("save")
        .rejects();

      httpTest
        .post("/memes")
        .send(meme)
        .expect(400)
        .expect(res => {
          assert(res.text, "Problema salvando Meme" + meme.toString());
        })
        .end(done);
    });
  });

  describe("GET /", () => {
    it("Listar memes", done => {
      httpTest.get("/memes").expect(200, done);
    });

    it("Error ao listar memes", done => {
      sinon
        .mock(Meme)
        .expects("find")
        .rejects();

      httpTest
        .get("/memes")
        .expect(400)
        .expect(res => {
          assert(res.text, "Erro ao buscar os memes do BD!");
        })
        .end(done);
    });
  });

  describe("DELETE /deletarMeme", () => {
    it("Meme deletado com sucesso", done => {
      const meme = faker.random.objectElement();
      const idMeme = "41224d776a326fb40f000001";

      sinon
        .mock(Meme)
        .expects("findById")
        .resolves({ meme });

      httpTest
        .delete(`/memes/deletarMeme${idMeme}`)
        .expect(200)
        .expect(res => {
          assert(res.body, { meme });
        })
        .end(done);
    });

    it("Meme não encontrado", done => {
      const idMeme = "1";

      sinon
        .mock(Meme)
        .expects("findById")
        .resolves(null);

      httpTest
        .delete(`/memes/deletarMeme${idMeme}`)
        .expect(400)
        .expect(res => {
          assert(res.text, "Problema ao deletar meme");
        })
        .end(done);
    });
  });

  describe("POST /sugestaoAlteracao", () => {
    it("Sugestão enviada com sucesso", done => {
      const idMeme = "41224d776a326fb40f000001";
      const sugestao = {
        idMeme: faker.random.uuid(),
        categorias: faker.random.arrayElement()
      };

      sinon
        .mock(Sugestao.prototype)
        .expects("save")
        .resolves(sugestao);

      httpTest
        .post(`/memes/sugestaoAlteracao${idMeme}`)
        .send(sugestao)
        .expect(200)
        .expect(res => {
          assert(res.text, "Sugestão salva com sucesso.");
        })
        .end(done);
    });

    it("Erro ao enviar sugestão", done => {
      const idMeme = "41224d776a326fb40f000001";
      const sugestao = {
        idMeme: faker.random.uuid(),
        categorias: faker.random.arrayElement()
      };

      sinon
        .mock(Sugestao.prototype)
        .expects("save")
        .rejects();

      httpTest
        .post(`/memes/sugestaoAlteracao${idMeme}`)
        .send(sugestao)
        .expect(400)
        .expect(res => {
          assert(res.text, "Erro ao salvar sugestão.");
        })
        .end(done);
    });
  });

  describe("GET /sugestoes", () => {
    it("Listar sugestões", done => {
      httpTest.get("/memes/sugestoes").expect(200, done);
    });
  });

  describe("PUT /validarSugestao", () => {
    it("Erro ao alterar meme", done => {
      const idMeme = "41224d776a326fb40f000001";

      sinon
        .mock(Sugestao)
        .expects("findById")
        .resolves({ idMeme, categorias: [] });

      sinon
        .mock(Meme)
        .expects("findById")
        .resolves(new Meme());

      sinon
        .mock(Meme.prototype)
        .expects("save")
        .rejects();

      httpTest
        .put(`/memes/validarSugestao${idMeme}`)
        .expect(400)
        .expect(res => {
          assert(res.text, "Erro ao alterar meme.");
        })
        .end(done);
    });

    it("Meme alterado e Sugestão deletada com sucesso", done => {
      const idMeme = "41224d776a326fb40f000001";

      sinon
        .mock(Sugestao)
        .expects("findById")
        .resolves({ idMeme, categorias: [] });

      sinon
        .mock(Meme)
        .expects("findById")
        .resolves(new Meme());

      sinon
        .mock(Meme.prototype)
        .expects("save")
        .resolves();

      sinon
        .mock(Sugestao)
        .expects("deleteOne")
        .resolves();

      httpTest
        .put(`/memes/validarSugestao${idMeme}`)
        .expect(200)
        .expect(res => {
          assert(res.text, "Meme alterado e Sugestão deletada com sucesso.");
        })
        .end(done);
    });

    it("Meme alterado e Sugestão deletada com sucesso", done => {
      const idMeme = "41224d776a326fb40f000001";

      sinon
        .mock(Sugestao)
        .expects("findById")
        .resolves({ idMeme, categorias: [] });

      sinon
        .mock(Meme)
        .expects("findById")
        .resolves(new Meme());

      sinon
        .mock(Meme.prototype)
        .expects("save")
        .resolves();

      sinon
        .mock(Sugestao)
        .expects("deleteOne")
        .rejects();

      httpTest
        .put(`/memes/validarSugestao${idMeme}`)
        .expect(400)
        .expect(res => {
          assert(res.text, "Meme alterado porém erro ao deletar sugestão.");
        })
        .end(done);
    });
  });

  describe("DELETE /deletarSugestao", () => {
    it("Sugestão deletada com sucesso", done => {
      const req = {
        query: `41224d776a326fb40f000001`
      };

      sinon
        .mock(Meme)
        .expects("deleteMany")
        .resolves();

      httpTest
        .delete(`/memes/deletarSugestao`)
        .send(req)
        .expect(200)
        .expect(res => {
          assert(res.text, "Sugestões deletadas com sucesso.");
        })
        .end(done);
    });
  });

  describe("PUT /aprovarMeme", () => {
    it("Meme aprovado com sucesso", done => {
      const idMeme = "41224d776a326fb40f000001";

      sinon
        .mock(Meme)
        .expects("updateOne")
        .resolves();

      httpTest
        .put(`/memes/aprovarMeme${idMeme}`)
        .expect(200)
        .expect(res => {
          assert(res.text, "Meme aprovado com sucesso!");
        })
        .end(done);
    });

    it("Error ao aprovar meme", done => {
      const idMeme = "41224d776a326fb40f000001";

      sinon
        .mock(Meme)
        .expects("updateOne")
        .rejects();

      httpTest
        .put(`/memes/aprovarMeme${idMeme}`)
        .expect(400)
        .expect(res => {
          assert(res.text, "Erro ao aprovar meme!");
        })
        .end(done);
    });
  });
});
