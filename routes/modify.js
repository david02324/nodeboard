var express = require('express');
var router = express.Router();
var db = require('../db-query');
var useCrypto = require('../crypto.js');

// 글 수정 요청
router.post('/',function(req,res,next){
    // 로그인 유저가 쓴 글인지 확인
    db.checkIsLogined(req.body.id,(result)=>{
        if(result == 1){ // 로그인 유저의 글
            if (req.session.passport && req.session.passport.user){
                db.checkPassword(req.body.id,req.session.passport.user.id,(result)=>{
                    if (result){
                        db.viewForUpdatePost(req.body.id, (post)=>{
                            useCrypto(req.session.passport.user.id,(code)=>{
                                if (post != null){
                                    data = {id: post.ID, code: code ,title: post.TITLE,type: post.TYPE, content: post.CONTENT, author: post.AUTHOR};
                                    data.user = req.session.passport.user;
                                        
                                    res.render('update',data);
                                }
                                else{
                                    res.render('error',{code: -102});
                                }
                            });
                        });
                    } else{
                        res.render('error',{code: -101});
                    }
                });
            }
        } else if (result == 0){ // 비로그인 유저의 글
            db.checkPassword(req.body.id,req.body.password, (response)=>{ // 비밀번호 확인
                if(response){
                    db.viewForUpdatePost(req.body.id,(post)=>{
                        if (post != null){
                            data = {id: post.ID, code: post.PASSWORD ,title: post.TITLE,type: post.TYPE, content: post.CONTENT, author: post.AUTHOR};
                            data.user = false;
                            
                            res.render('update',data);
                        }
                        else{
                            res.render('error',{code: -103});
                        }
                    });
                } else{
                    res.send("<script>alert('비밀번호가 일치하지 않습니다');window.location.href='/view?id="+req.body.id+"';</script>");
                }
            })
        }
    });
});

// 글 수정 제출
router.post('/submit', function(req,res,next){
    // DB 반영
    db.updatePost(req.body,(response)=>{
        if (response)
            res.render('error',{code: -104});
        else
            res.redirect('/view?id='+req.body.id);
    });
});

module.exports = router;