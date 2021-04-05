var express = require('express');
var router = express.Router();
var db = require('../db-query');
var useCrypto = require('../crypto.js');

// 글 수정 요청
router.post('/',function(req,res,next){
    // 비로그인 유저가 쓴 글이라면
    if (req.body.userId == undefined){
        // 비밀번호 일치 확인
        db.checkPassword(req.body.id,req.body.password,(response)=>{
            if(response){
                // 글 정보 불러오기
                db.viewForUpdatePost(req.body.id,(post)=>{
                    if (post != null){
                        data = {id: post.ID, code: post.PASSWORD ,title: post.TITLE,type: post.TYPE, content: post.CONTENT, author: post.AUTHOR};

                        if (req.session.passport && req.session.passport.user)
                            data.user = req.session.passport.user;
                        else
                            data.user = false;
                        
                        res.render('update',data);
                    }
                    else{
                        res.render('error',{code: -102});
                    }
                });
            } else{
                res.send("<script>alert('비밀번호가 일치하지 않습니다');window.location.href='/view?id="+req.body.id+"';</script>");
            }
        });
    // 로그인 유저가 쓴 글이면서, 요청한 유저가 글쓴이라면
    } else if (req.body.userId == req.session.passport.user.id){
        // 글 정보 불러오기
        db.viewForUpdatePost(req.body.id,(post)=>{
            // 유저 id를 암호화해서 전송
            useCrypto(req.session.passport.user.id,(code)=>{
                if (post != null){
                    data = {id: post.ID, code: code ,title: post.TITLE,type: post.TYPE, content: post.CONTENT, author: post.AUTHOR};

                    if (req.session.passport && req.session.passport.user)
                        data.user = req.session.passport.user;
                    else
                        data.user = false;
                        
                    res.render('update',data);
                }
                else{
                    res.render('error',{code: -103});
                }
            });
        });
    } else{
        res.render('error',{code: -104});
    }
});

// 글 수정 제출
router.post('/submit', function(req,res,next){
    // DB 반영
    db.updatePost(req.body,(response)=>{
        if (response)
            res.render('error',{code: -105});
        else
            res.redirect('/view?id='+req.body.id);
    });
});

module.exports = router;