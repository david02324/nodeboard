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
                if (reply.ROOT_REPLY_ID == null){
                    var body = `
                    <div class="${reply.ID}">
                    <div id="reply">
                    <div id="reply-bar">
                    ${reply.AUTHOR}
                    <a onclick="deleteReply(${reply.ID},${reply.POST_ID})" onmouseover="this.style.cursor='pointer'">X</a>
                    <a onclick="writeChildReply(${reply.ID},${reply.POST_ID})" onmouseover="this.style.cursor='pointer'">[답글]</a>
                    </div>
                    <hr>
                    <div id="reply-body">${reply.CONTENT}</div>
                    </div>
                    </div>
                    `;
                    var rootReplyDiv = $(body);
                    $('#reply-area').append(rootReplyDiv);
                } else{
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
                    replyDiv.css('margin-left','20px');
                    $('.'+reply.ROOT_REPLY_ID).append(replyDiv);
                }
            }
        }
    });
};

function showReply(postId){
    $('#reply-upper').empty();
    var body = `
    <span>댓글</span>
    <a onclick="refreshReply(${postId})" onmouseover="this.style.cursor='pointer'"><img src="/images/refresh.svg" alt="새로고침"></a>
    `
    $('#reply-upper').append($(body));

    refreshReply(postId);

    body = `
    <div id="reply-write-form">
        <div id="reply-info">
            <input type="text" id="reply-writer" placeholder="작성자" value="익명">
            <hr>
            <input type="password" id="reply-password" placeholder="비밀번호" placeholder="제목">
        </div>
        <textarea id="reply-content" placeholder="내용"></textarea>
        <button type="button" class="btn btn-dark" onclick="writeReply(${postId},null)">작성</button>
        </div>
    `

    $('#view-left').append($(body));
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
    });
};

function writeReply(postId,rootReplyId){
    if (rootReplyId === null)
        $('#child-write-form').remove();

    var writer = $('#reply-writer').val();
    var password = $('#reply-password').val();
    var content = $('#reply-content').val();
    var isLogined = 0;

    if (writer.length < 2){
        alert('작성자를 2자 이상 입력해주세요');
        return;
    } else if(writer.length > 10){
        alert('작성자는 최대 10자를 넘을 수 없습니다');
        return;
    } else if (password.length < 4){
        alert('비밀번호를 4자 이상 입력해주세요');
        return;
    } else if (password.length > 20){
        alert('비밀번호는 최대 20자를 넘을 수 없습니다');
        return;
    } else if (content.length < 2){
        alert('내용을 2자 이상 입력해주세요');
        return;
    } else if (content.length > 1000){
        alert('내용은 최대 1000자를 넘을 수 없습니다');
        return;
    }

    var data = {writer,password,rootReplyId,isLogined,content,postId};
    
    $.ajax({
        url: '/view/writeReply',
        datatype: 'json',
        type: 'POST',
        data: data,
        success: function(result){
            if (result.code == -1){
                refreshReply(postId);
            } else{
                alert('에러가 발생했습니다. ERRORCODE : '+result.code);
            }
            $('#reply-content').val('');
        }
    });
};

function writeChildReply(rootId,postId){
    $('#child-write-form').remove();
    var form = `
    <div id="child-write-form">
    <div id="reply-info">
        <input type="text" id="reply-writer" placeholder="작성자" value="익명">
        <hr>
        <input type="password" id="reply-password" placeholder="비밀번호" placeholder="제목">
    </div>
    <textarea id="reply-content" placeholder="내용"></textarea>
    <button type="button" class="btn btn-dark" onclick="writeReply(${postId},${rootId})">작성</button>
    </div>
    `
    var formDiv = $(form);
    $('.'+rootId).after(formDiv);
};

function register(){
    var nickname = $('#nickname').val();
    var pattern_kor = /[ㄱ-ㅎ|ㅏ-ㅣ]/; // 자모음체크
    var pattern_spc = /[~!@#$%^&*()_+|<>?:{}]/; // 특수기호
    var pattern_w = /\s/; // 공백
    if( (pattern_w.test(nickname)) || (pattern_kor.test(nickname)) || (pattern_spc.test(nickname))){
        alert('특수기호, 공백, 한글 자모음은 입력할 수 없습니다!');
        return;
    }
    if (nickname.length < 2 || nickname.length > 10){
        alert('2자 이상 10자 이하로 입력해주세요!');
        return;
    }
    $.ajax({
        url: '/login/registerConfirm',
        datatype: 'json',
        type: 'POST',
        data:{
            nickname: nickname
        },
        success: function(result){
            result = result.result;
            if(result == -1){
                alert('완료되었습니다! 다시 로그인해주세요.');
                location.href='/';
            } else if (result == 1){
                alert('이미 존재하는 닉네임입니다.');
                $('#nickname').val('');
            } else if (result == 0){
                alert('알 수 없는 오류가 발생했습니다. 나중에 다시 시도하세요.');
            }
        }
    })
}