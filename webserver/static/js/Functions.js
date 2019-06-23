function associarMeme(meme){
    const idMeme = meme.getAttribute('data-idMeme');
    document.getElementById('memeID').value = idMeme;
};

function associarIdPost(post){
    document.getElementById('inputIdDenuncia').value = post.id;
    document.getElementById('inputIdUsuario').value = post.actor.substring(5);
    document.getElementById('inputPostUrlImgur').value = post.url;
    document.getElementById('inputPostConteudo').value = post.conteudo;
    document.getElementById('inputPostIdImgur').value = post.idImgur;
};

function denunciarPublicacao(){
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.open("POST","/posts/denunciarPost",true);
    xmlhttp.setRequestHeader("Content-Type","application/json");
    const denuncia = {
        conteudo: document.getElementById('conteudoDenuncia').value,
        conteudoPost: document.getElementById('inputPostConteudo').value,
        idPost: document.getElementById('inputIdDenuncia').value,
        idUsuario: document.getElementById('inputIdUsuario').value,
        urlImgur: document.getElementById('inputPostUrlImgur').value,
        idImgur: document.getElementById('inputPostIdImgur').value
    };
    denunciaString = JSON.stringify(denuncia);
    xmlhttp.send(denunciaString);
    xmlhttp.onreadystatechange = function() {
        if(xmlhttp.readyState==4){
            document.getElementById("close").click();
        }
    };
};

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

function aceitarDenuncia(idDenuncia, idUsuario, idPost, idImgur) {
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.open("POST", "/posts/aceitarDenuncia", true);
    xmlhttp.setRequestHeader("Content-Type", "application/x-www-form-urlencoded;charset=UTF-8");
    xmlhttp.send("idDenuncia=" + idDenuncia + "&idUsuario=" + idUsuario + "&idPost=" + idPost + "&idImgur=" + idImgur);
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

function deletarPost(idPost, idUsuario, idImgur){
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.open("POST","/posts/deletePost",true);
    xmlhttp.setRequestHeader("Content-Type","application/x-www-form-urlencoded;charset=UTF-8");
    xmlhttp.send("postID=" + idPost + "&userID=" + idUsuario + "&idImgur=" + idImgur);
    xmlhttp.onreadystatechange = () => {
        if(xmlhttp.readyState==4){
            let elem = document.getElementById(idPost);
            elem.parentNode.removeChild(elem);
        }
    };
}

function avaliarPost(idPost, idUsuario, botao){
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.open("POST","/posts/avaliarPost",true);
    xmlhttp.setRequestHeader("Content-Type","application/x-www-form-urlencoded;charset=UTF-8");
    xmlhttp.send("postID="+idPost+"&usuarioID="+idUsuario);
    botao.childNodes[1].classList.toggle('liked');
}

function seguirMeme(idMeme, idUsuario, botao){
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.open("POST","/usuarios/seguirMeme",true);
    xmlhttp.setRequestHeader("Content-Type","application/x-www-form-urlencoded;charset=UTF-8");
    xmlhttp.send("memeID="+idMeme+"&usuarioID="+idUsuario);
    if (botao.innerText == 'Seguir'){
        botao.innerText = 'Seguindo';
    }else{
        botao.innerText = 'Seguir';
    };
};

function seguirUsuario(idUsuarioVisitado, idUsuario, botao){
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.open("POST","/usuarios/seguirUsuario",true);
    xmlhttp.setRequestHeader("Content-Type","application/x-www-form-urlencoded;charset=UTF-8");
    xmlhttp.send("usuarioVisitadoID="+idUsuarioVisitado+"&usuarioID="+idUsuario);
    if (botao.innerText == 'Seguir'){
        botao.innerText = 'Seguindo';
    }else{
        botao.innerText = 'Seguir';
    };
};

function isEmpty(objeto){
    for(const atributo in objeto){
        if (objeto.hasOwnProperty(atributo)){
            return false;
        }
        return true;
    }
};