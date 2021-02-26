var express = require('express');
var router = express.Router();
var db = require('../db-query');

router.post('/',function(req,res,next){
    db.checkPassword(req.body.id,req.body.password,(response)=>{
        if(response){
            db.viewForUpdatePost(req.body.id,(post)=>{
                if (post != null)
                    res.render('update',{id: post.ID, code: post.PASSWORD ,title: post.TITLE,type: post.TYPE, content: post.CONTENT, author: post.AUTHOR});
                else
                    res.render('error');
            });
            
        } else{
            res.send("<script>alert('비밀번호가 일치하지 않습니다');window.location.href='/view?id="+req.body.id+"';</script>");
        }
    });
});

router.post('/submit', function(req,res,next){
    db.updatePost(req.body,(response)=>{
        if (response)
            res.render('error');
        else
            res.redirect('/view?id='+req.body.id);
    });
});

module.exports = router;