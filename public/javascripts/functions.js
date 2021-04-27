// 글쓰기 버튼 클릭
function writePost(){
    var form = document.createElement("form");
    form.setAttribute("method", 'post');
    form.setAttribute("action", '/write');
    document.body.appendChild(form);
    form.submit();
};

// 글쓰기 취소
function writeCancel(){
    var check = confirm('정말로 글쓰기를 취소하시겠습니까?');
    if (check){
        history.back();
    }
};

// 글 삭제
function removePost(id){
    // 입력한 패스워드 값 저장
    var plainPassword = $('#delete-password').val();

    if(plainPassword == ''){
        alert('패스워드를 입력하세요');
        return;
    }

    $.ajax({
        url: '/view/delete',
        datatype: 'json',
        type: 'POST',
        data: {
            id : id,
            plainPassword : plainPassword
        },
        success: function(result){
            if (result.code == 1){
                alert('삭제가 완료되었습니다.');
                location.href="/list";
            } else{
                if (result.code == -1000)
                    alert('비밀번호가 일치하지 않습니다.');
                else
                    alert('에러가 발생했습니다. ERRORCODE : '+result.code);
            }
        }
    });
};

// 글 수정
function updatePost(id){
    // 사용자가 입력한 비밀번호
    var plainPassword = $('#delete-password').val();

    var form = document.createElement("form");
    form.setAttribute("method", 'post');
    form.setAttribute("action", '/update');

    // 수정할 글의 id전송
    var hiddenField = document.createElement('input');
    hiddenField.setAttribute("type", "hidden");
    hiddenField.setAttribute("name", 'id');
    hiddenField.setAttribute("value",id);
    form.appendChild(hiddenField);
    
    // 패스워드 전송
    hiddenField = document.createElement('input');
    hiddenField.setAttribute("type", "hidden");
    hiddenField.setAttribute("name", 'password');
    hiddenField.setAttribute("value",plainPassword);
    form.appendChild(hiddenField);

    document.body.appendChild(form);
    // 전송
    form.submit();
};

// 글 검색
function searchPost(type){
    location.href="/search?type="+type+"&mode="+$('#search-mode').val()+"&keyword="+$('#search-keyword').val();
};

// 페이지 이동
function movePage(target,isSearch,type,mode,keyword,maxPage){
    if (target < 1 || target > maxPage){
        alert('페이지 범위를 벗어났습니다!');
        $('#target-page').val('');
        return;
    }
    
    // url 생성
    var url = '';
    if (isSearch)
        url = '/search?mode='+mode+'&keyword='+keyword+'&';
    else
        url = '/list?';
    url += 'type='+type+'&page='+target;

    // 이동
    location.href = url;
};


// 글 추천
function thumbup(id){
    $.ajax({
        url: '/view/thumbup',
        datatype: 'json',
        type: 'POST',

        // 글의 id만 전송
        data: {id:id},
        success: function(result){
            if (result.result)
                $('#thumbup-count').text(result.count);
            else
                alert('에러가 발생했습니다. ERRORCODE : '+result.count);
        }
    })
};

// 댓글 새로고침
function refreshReply(postId){
    $.ajax({
        url: '/view/refreshReply',
        datatype: 'json',
        type: 'POST',
        // 글의 id 전송
        data: {id : postId},
        success: function(result){
            $('#reply-area').empty();
            // 댓글 리스트가 담긴 배열
            replyList = result.replyList;
            // 요청을 보낸 client의 nickname
            nickname = result.nickname;

            for (let reply of replyList){
                // 일반 댓글
                if (reply.ROOT_REPLY_ID == null){
                    var body = `
                    <div class="${reply.ID}">
                    <div id="reply">
                    <div id="reply-bar">
                    ${reply.AUTHOR}`
                    // 비로그인 사용자의 댓글일 경우
                    if (reply.isLogined == 0){
                        body += `<a onclick="deleteReply(${reply.ID},${reply.POST_ID})" onmouseover="this.style.cursor='pointer'">X</a>`
                    // 로그인 사용자의 댓글일 경우
                    } else if (nickname == reply.AUTHOR) {
                        body += `<a onclick="deleteMyReply(${reply.ID},${reply.POST_ID})" onmouseover="this.style.cursor='pointer'">X</a>`
                    }
                    body += `
                    <a onclick="writeChildReply(${reply.ID},${reply.POST_ID})" onmouseover="this.style.cursor='pointer'">[답글]</a>
                    </div>
                    <hr>
                    <div id="reply-body">${reply.CONTENT}</div>
                    </div>
                    </div>
                    `;
                    var rootReplyDiv = $(body);
                    $('#reply-area').append(rootReplyDiv);
                
                // 답글
                } else{
                    var body = `
                    <div id="reply">
                    <div id="reply-bar">
                    ${reply.AUTHOR}`
                    if (reply.isLogined == 0){
                        body += `<a onclick="deleteReply(${reply.ID},${reply.POST_ID})" onmouseover="this.style.cursor='pointer'">X</a>`
                    } else if (nickname == reply.AUTHOR){
                        body += `<a onclick="deleteMyReply(${reply.ID},${reply.POST_ID})" onmouseover="this.style.cursor='pointer'">X</a>`
                    }
                    body += `
                    </div>
                    <hr>
                    <div id="reply-body">${reply.CONTENT}</div>
                    </div>
                    `;
                    var replyDiv = $(body);
                    replyDiv.css('margin-left','20px');
                    // 답글의 원 댓글의 아래에 append
                    $('.'+reply.ROOT_REPLY_ID).append(replyDiv);
                }
            }
        }
    });
};

// 댓글보기 버튼
function showReply(postId){
    $('#reply-upper').empty();
    var body = `
    <span>댓글</span>
    <a onclick="refreshReply(${postId})" onmouseover="this.style.cursor='pointer'"><img src="/images/refresh.svg" alt="새로고침"></a>
    `
    $('#reply-upper').append($(body));

    refreshReply(postId);

    // 로그인 유저인지 확인
    $.ajax({
        url: '/view/loginCheck',
        datatype: 'json',
        type: 'POST',
        data :{},
        success: function(result) {
            // 로그인 유저라면
            if (result.logined) {
                // 작성자 이름을 고정하고, 패스워드란 비활성화
                form = `
                <div id="reply-write-form">
                    <div id="reply-info">
                        <input type="text" id="reply-writer" placeholder="작성자" value=${result.nickname} readonly>
                        <hr>
                        <input disabled>
                    </div>
                    <textarea id="reply-content" placeholder="내용"></textarea>
                    <button type="button" class="btn btn-dark" onclick="writeReply(${postId},null,1)">작성</button>
                </div>
                `
            // 비로그인 유저라면
            } else {
                form = `
                <div id="reply-write-form">
                    <div id="reply-info">
                        <input type="text" id="reply-writer" placeholder="작성자" value="익명">
                        <hr>
                        <input type="password" id="reply-password" placeholder="비밀번호">
                    </div>
                    <textarea id="reply-content" placeholder="내용"></textarea>
                    <button type="button" class="btn btn-dark" onclick="writeReply(${postId},null,0)">작성</button>
                </div>
                `
            }
        $('#view-left').append($(form));
        }
    })
};

// 비로그인 유저가 쓴 댓글 삭제
function deleteReply(id,postId){
    var plainPassword = prompt('댓글 작성시 입력한 비밀번호를 입력하세요');

    // 공백 입력
    if (plainPassword == '' || plainPassword == undefined)
        return;
    
    $.ajax({
        url: '/view/deleteReply',
        datatype: 'json',
        type: 'POST',
        data: {
            id : id,
            plainPassword : plainPassword,
            isLogined: 0
        },
        success: function(result){
            if (result.code == -1){
                // 댓글 삭제에 성공했다면 댓글 새로고침
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

// 로그인 유저의 자신의 댓글 삭제
function deleteMyReply(id,postId){
    if(confirm('댓글을 삭제하시겠습니까?')){
        $.ajax({
            url: '/view/deleteReply',
            datatype: 'json',
            type: 'POST',
            data: {
                id: id,
                isLogined: 1
            },
            success: function(result){
                // 댓글 삭제에 성공했다면 댓글 새로고침
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
    }
};

// 댓글 작성
function writeReply(postId,rootReplyId,isLogined){
    if (rootReplyId === null)
        $('#child-write-form').remove();

    var writer = $('#reply-writer').val();
    var password = $('#reply-password').val();
    var content = $('#reply-content').val();

    // 유효성 검사
    if (writer.length < 2){
        alert('작성자를 2자 이상 입력해주세요');
        return;
    } else if(writer.length > 10){
        alert('작성자는 최대 10자를 넘을 수 없습니다');
        return;
    } else if (isLogined == 0 && password.length < 4){
        alert('비밀번호를 4자 이상 입력해주세요');
        return;
    } else if (isLogined == 0 && password.length > 20){
        alert('비밀번호는 최대 20자를 넘을 수 없습니다');
        return;
    } else if (content.length < 2){
        alert('내용을 2자 이상 입력해주세요');
        return;
    } else if (content.length > 1000){
        alert('내용은 최대 1000자를 넘을 수 없습니다');
        return;
    }

    // // 로그인 유저라면 패스워드 일단 공백으로 설정
    // if (isLogined == 1){
    //     password = '';
    // }
    var data = {writer,password,rootReplyId,isLogined,content,postId};
    
    $.ajax({
        url: '/view/writeReply',
        datatype: 'json',
        type: 'POST',
        data: data,
        success: function(result){
            if (result.code == -1){
                // 댓글 작성 성공시 댓글 새로고침
                refreshReply(postId);
            } else{
                alert('에러가 발생했습니다. ERRORCODE : '+result.code);
            }
            $('#reply-content').val('');
        }
    });
};

// 답글 작성
function writeChildReply(rootId,postId){
    // 기존에 있던 답글 작성 form 제거
    $('#child-write-form').remove();
    $.ajax({
        url: '/view/loginCheck',
        datatype: 'json',
        type: 'POST',
        data :{},
        success: function(result) {
            // 로그인 유저라면
            if (result.logined) {
                // 작성자 고정, 비밀번호란 비활성화
                form = `
                <div id="child-write-form">
                    <div id="reply-info">
                        <input type="text" id="reply-writer" placeholder="작성자" value=${result.nickname} readonly>
                        <hr>
                        <input disabled>
                    </div>
                    <textarea id="reply-content" placeholder="내용"></textarea>
                    <button type="button" class="btn btn-dark" onclick="writeReply(${postId},${rootId},1)">작성</button>
                </div>
                `
            // 비로그인 유저라면
            } else {
                form = `
                <div id="child-write-form">
                    <div id="reply-info">
                        <input type="text" id="reply-writer" placeholder="작성자" value="익명">
                        <hr>
                        <input type="password" id="reply-password" placeholder="비밀번호">
                    </div>
                    <textarea id="reply-content" placeholder="내용"></textarea>
                    <button type="button" class="btn btn-dark" onclick="writeReply(${postId},${rootId},0)">작성</button>
                </div>
                `
            }
            $('.'+rootId).after($(form));
        }
    })
};

// 가입(닉네임 생성)
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
                location.href='/login/logout';
            } else if (result == 1){
                alert('이미 존재하는 닉네임입니다.');
                $('#nickname').val('');
            } else if (result == 0){
                alert('알 수 없는 오류가 발생했습니다. 나중에 다시 시도하세요.');
            }
        }
    })
}


// summernote 에디터 로드
$(document).ready(function() {
	//여기 아래 부분
	$('#summernote').summernote({
		  height: 788,                 // 에디터 높이
		  focus: true,                  // 에디터 로딩후 포커스를 맞출지 여부
		  lang: "ko-KR",					// 한글 설정
		  placeholder: '최대 2048자까지 쓸 수 있습니다',	//placeholder 설정
          disableResizeEditor: true,
          toolbar: [
            // [groupName, [list of button]]
            ['fontname', ['fontname']],
            ['fontsize', ['fontsize']],
            ['style', ['bold', 'italic', 'underline','strikethrough', 'clear']],
            ['color', ['forecolor','color']],
            ['table', ['table']],
            ['para', ['ul', 'ol', 'paragraph']],
            ['height', ['height']],
            ['insert',['picture','link','video']],
            ['view', ['fullscreen', 'help']]
          ],
        fontNames: ['Arial', 'Arial Black', 'Comic Sans MS', 'Courier New','맑은 고딕','궁서','굴림체','굴림','돋움체','바탕체'],
        fontSizes: ['8','9','10','11','12','14','16','18','20','22','24','28','30','36','50','72']
	});
});