function writePost(){
    var form = document.createElement("form");
    form.setAttribute("method", 'post');
    form.setAttribute("action", '/write');

    // var hiddenField = document.createElement("input");
    // hiddenField.setAttribute("type", "hidden");
    // hiddenField.setAttribute("name", 'userCode');
    // var code = '(대충 유저 코드)';
    // hiddenField.setAttribute("value", code);
    // form.appendChild(hiddenField);

    document.body.appendChild(form);
    form.submit();
};

function writeCancel(){
    var check = confirm('정말로 글쓰기를 취소하시겠습니까?');
    if (check){
        history.back();
    }
};

function removePost(){
    var form = document.createElement("form");
    form.setAttribute("method", 'post');
    form.setAttribute("action", '/view?id='+id+'/delete');

    var hiddenField = document.createElement('input');
    hiddenField.setAttribute("type", "hidden");
    hiddenField.setAttribute("name", 'plainPassword');
    var plainPassword = document.getElementById('delete-password').value;
    hiddenField.setAttribute("value",plainPassword);
    form.appendChild(hiddenField);

    document.body.appendChild(form);
    form.submit();
};

function searchPost(type){
    location.href="/search?type="+type+"&mode="+$('#search-mode').val()+"&keyword="+$('#search-keyword').val();
};

function movePage(target,isSearch,type,mode,keyword,maxPage){
    console.log(typeof maxPage);
    if (target < 1 || target > maxPage){
        alert('페이지 범위를 벗어났습니다!');
        $('#target-page').val('');
        return;
    }

    var url = '';

    if (isSearch)
        url = '/search?mode='+mode+'&keyword='+keyword+'&';
    else
        url = '/list?';
    
    url += 'type='+type+'&page='+target;

    location.href = url;
}