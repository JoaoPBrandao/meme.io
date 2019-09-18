const axios = require('axios'); //Usamos Axios para fazer as requests à API
const fs = require('fs'); //FileSystem padrão do Node
const apiKeys = require('../../configs/apiKeys.js'); //Arquivo com as chaves das APIs utilizadas

module.exports = async function (path, album, name){
    let resposta = await axios.post(
            'https://api.imgur.com/3/upload',
            {
                image: fs.readFileSync(path, 'base64'),
                album: album,
                type: 'base64',
                name: name
            },
            { headers: { Authorization: `Bearer ${apiKeys.imgurAccessToken}` } }
        )
        .then(apiResponse => {
            //Deletar a imagem temporária armazenada no file system
            fs.unlink(path, () => {});
            //Checar se a foto foi armazenada no Imgur com sucesso para retornar para as rotas
            if (apiResponse.data.success == true) {
                return apiResponse;
            }
            //Caso não, retornar falso
            return false;
        })
        .catch(err => {
        //TODO: DISPLAY ERROR FLASH MESSAGE
        fs.unlink(path, () => {});
        return false;
    });
    return resposta;
};
