function associarMeme(meme){
    const idMeme = meme.getAttribute('data-idMeme');
    document.getElementById('memeID').value = idMeme;
};

function associarIdPost(elemento){
    const idPost = elemento.getAttribute('data-idPost');
    document.getElementById('inputIdDenuncia').value = idPost;
}

function denunciarPublicacao(){
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.open("POST","/posts/denunciarPost",true);
    xmlhttp.setRequestHeader("Content-Type","application/x-www-form-urlencoded;charset=UTF-8");
    let conteudo = document.getElementById("conteudoDenuncia").value;
    let id = document.getElementById("inputIdDenuncia").value;
    xmlhttp.send("postID="+id+"&conteudoDenuncia="+conteudo);
    xmlhttp.onreadystatechange = function() {
        if(xmlhttp.readyState==4){
            document.getElementById("close").click();
        }
    }
}