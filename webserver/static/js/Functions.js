function associarMeme(meme){
    const idMeme = meme.getAttribute('data-idMeme');
    document.getElementById('memeID').value = idMeme;
};

function associarIdPost(elemento){
    const idPost = elemento.getAttribute('data-idPost');
    document.getElementById('inputIdDenuncia').value = idPost;
}

function filtrarMeme(query){
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.open("POST","/memes/buscarMemeAssociacao",true);
    xmlhttp.setRequestHeader("Content-Type","application/x-www-form-urlencoded;charset=UTF-8");
    xmlhttp.send("searchQuery="+query);
    xmlhttp.onreadystatechange = function() {
        if(xmlhttp.readyState==4){
            html = xmlhttp.response;
            document.getElementById("associarMemeSearch").innerHTML = html;
        }
    }

}