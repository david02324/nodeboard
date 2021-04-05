var express = require('express');
var router = express.Router();
var db = require('../db-query');

// 글 조회
router.get('/', function(req, res, next) {
    // 글 id 저장
    let {id} = req.query;

    db.viewPost(id,(response)=>{
        if (response){
            // 공지사항, 추천글 불러오기
            db.innerRight((bestPosts,announcements)=>{
                if (bestPosts && announcements){
                    // 글 정보 객체에 저장
                    data = {id: id,
                        title: response.TITLE,
                        author: response.AUTHOR,
                        type: response.TYPE,
                        content: response.CONTENT,
                        views: response.VIEWS,
                        isLogined: response.isLogined,
                        thumbup: response.THUMBUP,
                        bestPosts: bestPosts,
                        announcements: announcements};
                    
                    // 로그인 여부 확인
                    if (req.session.passport && req.session.passport.user)
                        data.user = req.session.passport.user;
                    else
                        data.user = false;
                    
                    res.render('view', data);
                } else{
                    res.render('error',{code: -108});
                }
            });
        } else{
            res.render('error',{code: -109});
        }
    });
});

// 글 삭제
router.post('/delete',function(req,res,next){
    // 패스워드 확인
    db.checkPassword(req.body.id,req.body.plainPassword,(result)=>{
        if (result){
            db.deletePost(req.body.id, (response)=>{
                if (response){
                    res.send({code: -1});
                } else{
                    res.send({code: 1});
                }
            });
        } else{
            res.send({code: 0});
        }
    });
});

// 글 추천
router.post('/thumbup',function(req,res,next){
    // 추천자 ip와 글 id를 전송
    db.thumbup(req.body.id,req.ip,(response,count)=>{
        res.send({result: response, count: count})
    });
});

// 댓글 삭제
router.post('/deleteReply',function(req,res,next){
    // 로그인 유저의 자신의 댓글 삭제
    if (req.body.isLogined){
        // 로그인 유저 댓글 작성시 비밀번호 빈 문자열으로 지정했으므로 동일하게 넘겨준다.
        password = ''
        db.deleteReply(req.body.id,password,(code)=>{
            res.send({code:code});
        });
    // 비로그인 유저의 댓글 삭제
    }else {
        db.deleteReply(req.body.id,req.body.plainPassword,(code)=>{
            res.send({code: code});
        });
    }
});

// 댓글 새로고침
router.post('/refreshReply',function(req,res,next){
    db.getReply(req.body.id,(replyList)=>{
        // 댓글 리스트
        data = {replyList: replyList};

        // 로그인 여부 확인
        if (req.session.passport && req.session.passport.user){
            data.nickname = req.session.passport.user.nickname;
        }

        res.send(data);
    });
});

// 댓글 작성
router.post('/writeReply',function(req,res,next){
    // 로그인 유저가 비정상적으로 댓글 작성 시도
    if (req.body.isLogined == 1 && req.body.writer != req.session.passport.user.nickname){
        res.send({code: -100});
    } else {
        db.writeReply(req.body,(code)=>{
            res.send({code: code})
        });
    }
});

// 로그인 했는지 체크, 로그인했다면 닉네임 전송
router.post('/loginCheck',function(req,res,next){
    if(req.session.passport && req.session.passport.user){
        res.send({logined: true,nickname: req.session.passport.user.nickname});
    } else {
        res.send({logined: false});
    }
});

module.exports = router;