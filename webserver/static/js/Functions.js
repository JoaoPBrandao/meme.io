function associarMeme(meme){
    const idMeme = meme.getAttribute('data-idMeme');
    document.getElementById('memeID').value = idMeme;
};

function associarIdPost(elemento){
    const idPost = elemento.getAttribute('data-idPost');
    document.getElementById('inputIdDenuncia').value = idPost;
}