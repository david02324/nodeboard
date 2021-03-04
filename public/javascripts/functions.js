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
};

function thumbup(id){
    $.ajax({
        url: '/view/thumbup',
        datatype: 'json',
        type: 'POST',
        data: {id:id},
        success: function(result){
            if (result.result)
                $('#thumbup-count').text(result.count);
            else
                alert('에러가 발생했습니다. ERRORCODE : '+result.count);
        }
    })
};

function refreshReply(postId){
    $.ajax({
        url: '/view/refreshReply',
        datatype: 'json',
        type: 'POST',
        data: {id : postId},
        success: function(result){
            $('#reply-area').empty();
            replyList = result.replyList;
            for (let reply of replyList){
                var body = `
                <div id="reply">
                <div id="reply-bar">
                ${reply.AUTHOR}
                <a onclick="deleteReply(${reply.ID},${reply.POST_ID})" onmouseover="this.style.cursor='pointer'">X</a>
                </div>
                <hr>
                <div id="reply-body">${reply.CONTENT}</div>
                </div>
                `;
                var replyDiv = $(body);
                $('#reply-area').append(replyDiv);
            }
        }
    });
};

function deleteReply(id,postId){
    var plainPassword = prompt('댓글 작성시 입력한 비밀번호를 입력하세요');
    if (plainPassword == '' || plainPassword == undefined)
        return;
    $.ajax({
        url: '/view/deleteReply',
        datatype: 'json',
        type: 'POST',
        data: {
            id : id,
            plainPassword : plainPassword,
        },
        success: function(result){
            if (result.code == -1){
                refreshReply(postId);
            } else{
                if (result.code == 0)
                    alert('비밀번호가 일치하지 않습니다.');
                else
                    alert('에러가 발생했습니다. ERRORCODE : '+result.code);
            }
        }
    })
}