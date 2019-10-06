const express = require('express');
const router = express.Router();
const mongoose = require('mongoose'); //Utilizamos o Mongoose para fazer a integração com o MongoDB
const Meme = require(process.cwd() + '/models/memeModel.js'); //Importando o modelo utilizado para o documento de Memes no BD
const Sugestao = require(process.cwd() + '/models/sugestaoModel.js'); //Importando o modelo utilizado para o documento de Sugestões no BD

//Rota para criar um novo meme no banco de dados
//Recebe um objeto contendo os atributos do meme
router.post('/', (req, res) => {
  console.log('Post recebido.');
  //Instanciar o novo meme com seus devidos atributos
  const novoMeme = new Meme({
    urlImgur: req.body.urlImgur,
    categorias: req.body.categorias,
    data: req.body.data,
    idImgur: req.body.idImgur
  });
  //Salvar o meme instanciado no MongoDB
  novoMeme
    .save()
    .then(() => {
      res.status(200).send('Meme salvo com sucesso' + novoMeme.toString());
    })
    .catch(err => {
      res.status(400).send('Problema salvando Meme' + novoMeme.toString());
    });
});

//Rota para obter todos os memes no banco de dados
//Retorna um array com os memes encontrados
//Pode receber filtros através de uma query string na URL
router.get('/', (req, res) => {
  if (req.query.categorias) {
    //Recebe uma string com as categorias para a busca no formato "Categoria;Categoria;Categoria..."
    //Transformar a string com múltiplas categorias em um vetor com objetos do tipo {categorias: /categoria/i}
    //Adiciona esse objeto criado a query de busca
    let newQuery = req.query.categorias.split(';');
    newQuery = newQuery.map(query => {
      let queryObject = {};
      queryObject.categorias = new RegExp(query, 'i');
      return queryObject;
    });
    req.query.$and = newQuery;
  } else {
    delete req.query.categorias;
  }
  Meme.find(req.query, (err, memes) => {
    res.status(200).send(memes);
  }).catch(err => {
    console.log('Erro ao buscar os memes do BD:' + err);
    res.status(400).send('Erro ao buscar os memes do BD!');
  });
});

//Rota para deletar um meme específico no banco de dados
//Recebe o ID do meme específio pelo path da chamada
//Retorna o objeto que representa o meme que foi deletado
router.delete('/deletarMeme:idMeme', async (req, res) => {
  console.log('Requisição de delete do meme recebida.');
  let meme = {};

  try {
    meme = await Meme.findById(req.params.idMeme);
  } catch (err) {
    console.log('Erro ao buscar meme com o ID requerido.');
  }

  Meme.deleteOne(
    {
      _id: req.params.idMeme
    },
    err => {
      if (err) {
        console.log('Erro ao realizar o delete do meme (API): ' + err);
        res.status(400).send('Problema ao deletar meme');
      } else {
        res.status(200).send(meme);
      }
    }
  );
});

//Rota para criar uma sugestão de alteração de meme no banco de dados
//Recebe o ID do meme a ser alterado pelo path da chamada
router.post('/sugestaoAlteracao:idMeme', (req, res) => {
  console.log('Requisição para criar sugestão recebida.');
  const sugestao = new Sugestao({
    idMeme: req.params.idMeme,
    categorias: req.body
  });
  sugestao
    .save()
    .then(() => {
      res.status(200).send('Sugestão salva com sucesso.');
    })
    .catch(err => {
      res.status(400).send('Erro ao salvar sugestão.');
    });
});

//Rota para obter todas as sugestões existentes no banco de dados
//Retorna um array que contém todas as sugestões encontradas
router.get('/sugestoes', (req, res) => {
  Sugestao.find({}, (err, sugestoes) => {
    res.status(200).send(sugestoes);
  }).catch(err => {
    console.log('Erro ao buscar as sugestoes do BD:' + err);
    res.status(400).send('Erro ao buscar as sugestoes do BD!');
  });
});

//Rota para validar uma sugestão existente no banco de dados
//Recebe o ID da sugestão pelo path da chamada
router.put('/validarSugestao:idSugestao', async (req, res) => {
  const sugestao = await Sugestao.findById(req.params.idSugestao);
  const meme = await Meme.findById(sugestao.idMeme);

  sugestao.categorias.forEach(categoria => {
    meme.categorias.push(categoria);
  });

  meme
    .save()
    .then()
    .catch(err => {
      res.status(400).send('Erro ao alterar meme.');
    });
  Sugestao.deleteOne({ _id: sugestao._id })
    .then(() => {
      res.status(200).send('Meme alterado e Sugestão deletada com sucesso.');
    })
    .catch(err => {
      res.status(400).send('Meme alterado porém erro ao deletar sugestão.');
    });
});

//Rota para deletar sugestões existente no banco de dados
//Recebe os parâmetros de busca da sugestão através de uma query string na URL
router.delete('/deletarSugestao', (req, res) => {
  Sugestao.deleteMany(req.query)
    .then(() => {
      res.status(200).send('Sugestões deletadas com sucesso.');
    })
    .catch(err => {
      res.status(400).send('Erro ao deletar sugestão.');
    });
});

//Rota para aprovar um meme pendente
//Recebe o ID do meme pelo path da chamada
router.put('/aprovarMeme:idMeme', (req, res) => {
  Meme.updateOne(
    {
      _id: req.params.idMeme
    },
    {
      status: 1
    }
  )
    .then(() => {
      console.log('Meme aprovado com sucesso!');
      res.status(200).send('Meme aprovado com sucesso!');
    })
    .catch(err => {
      console.log('Erro ao aprovar meme: ' + err.message);
      res.status(400).send('Erro ao aprovar meme!');
    });
});

module.exports = router;
