const mongoose = require('mongoose');

//Esquema para o documento de Memes no MondoDB
const memeSchema = new mongoose.Schema({
  urlImgur: {
    type: String,
    required: true
  },
  categorias: {
    type: Array,
    default: [],
    required: true
  },
  data: {
    type: String
  },
  idImgur: {
    type: String,
    required: true
  },
  //STATUS DO MEME, 0 = PENDENTE, 1 = ACEITO
  status: {
    type: Number,
    required: true,
    default: 0
  }
});

const Meme = mongoose.model('meme', memeSchema);

module.exports = Meme;
