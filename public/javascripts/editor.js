// summernote 에디터 로드
$(document).ready(function() {
	//여기 아래 부분
	$('#summernote').summernote({
		  height: 788,                 // 에디터 높이
		  focus: true,                  // 에디터 로딩후 포커스를 맞출지 여부
		  lang: "ko-KR",					// 한글 설정
		  placeholder: '내용',	//placeholder 설정
          disableResizeEditor: true,
          toolbar: [
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
        fontSizes: ['8','9','10','11','12','14','16','18','20','22','24','28','30','36','50','72'],
        callbacks: {	//여기 부분이 이미지를 첨부하는 부분
            onImageUpload: function(files, editor, welEditable) {
                sendFile(files[0],editor,welEditable);
            }
        }
	});
});
function sendFile(file,editor,welEditable) {
    data = new FormData();
    data.append("file", file);
    $.ajax({
        data: data,
        type: "POST",
        url: "/write/imageUpload",
        enctype: 'multipart/form-data',
        cache: false,
        contentType: false,
        processData: false,
        success: function(response) {
            if (response.error){
                alert('에러가 발생했습니다. ' + response.error);
            } else {
                $('#summernote').summernote('insertImage', response.url);
            }
        }
    });
}