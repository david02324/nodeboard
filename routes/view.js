var express = require('express');
var router = express.Router();
var db = require('../db-query');
var useCrypto = require('../crypto');

router.get('/', function(req, res, next) {
    let {id} = req.query;
    db.viewPost(id,(response)=>{
        if (response===false){
            res.render('error');
        } else{
        res.render('view', {id: id,
            title: response.TITLE,
            author: response.AUTHOR,
            type: response.TYPE,
            content: response.CONTENT,
            views: response.VIEWS,
            isLogined: response.isLogined,
            thumbup: response.THUMBUP});
        }
    });
});

router.post('/delete',function(req,res,next){
    db.checkPassword(req.body.id,req.body.password,(response)=>{
        if(response){
            db.deletePost(req.body.id,(callback)=>{
                if (callback)
                    res.send("<script>alert('삭제가 완료되었습니다.');window.location.href='/list';</script>");
                else
                    res.render('error');
            });
        } else{
            res.send("<script>alert('비밀번호가 일치하지 않습니다');window.location.href='/view?id="+req.body.id+"';</script>");
        }
    });
});

module.exports = router;