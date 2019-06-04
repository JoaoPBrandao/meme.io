function associarMeme(meme){
    const idMeme = meme.getAttribute('data-idMeme');
    document.getElementById('memeID').value = idMeme;
}

function associarIdPost(elemento){
    const idPost = elemento.getAttribute('data-idPost');
    document.getElementById('inputIdDenuncia').value = idPost;
}

function filtrarMeme(query) {
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.open("POST", "/memes/buscarMemeAssociacao", true);
    xmlhttp.setRequestHeader("Content-Type", "application/x-www-form-urlencoded;charset=UTF-8");
    xmlhttp.send("searchQuery=" + query);
    xmlhttp.onreadystatechange = function () {
        if (xmlhttp.readyState == 4) {
            html = xmlhttp.response;
            document.getElementById("associarMemeSearch").innerHTML = html;
        }
    };
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
    };
}

function aceitarDenuncia(idDenuncia, idUsuario, idPost) {
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.open("POST", "/posts/aceitarDenuncia", true);
    xmlhttp.setRequestHeader("Content-Type", "application/x-www-form-urlencoded;charset=UTF-8");
    xmlhttp.send("idDenuncia=" + idDenuncia + "&idUsuario=" + idUsuario + "&idPost=" + idPost);
    xmlhttp.onreadystatechange = function() {
        if(xmlhttp.readyState==4){
            let elem = document.getElementById(idDenuncia);
            elem.parentNode.removeChild(elem);
        }
    };
}

function recusarDenuncia(idDenuncia){
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.open("POST","/posts/recusarDenuncia",true);
    xmlhttp.setRequestHeader("Content-Type","application/x-www-form-urlencoded;charset=UTF-8");
    xmlhttp.send("idDenuncia="+idDenuncia);
    xmlhttp.onreadystatechange = function() {
        if(xmlhttp.readyState==4){
            let elem = document.getElementById(idDenuncia);
            elem.parentNode.removeChild(elem);
        }
    };
}

