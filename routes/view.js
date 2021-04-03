var express = require('express');
var router = express.Router();
var db = require('../db-query');

router.get('/', function(req, res, next) {
    let {id} = req.query;
    db.viewPost(id,(response)=>{
        if (response===false)
            res.render('error');
        else
            db.innerRight((bestPosts,announcements)=>{
                if (bestPosts && announcements){
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

                    if (req.session.passport)
                        data.user = req.session.passport.user;
                    else
                        data.user = false;
                    res.render('view', data);
                } else{
                    res.render('error');
                }
            });
    });
});

router.post('/delete',function(req,res,next){
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

router.post('/thumbup',function(req,res,next){
    db.thumbup(req.body.id,req.ip,(response,count)=>{
        res.send({result: response, count: count})
    });
});

router.post('/deleteReply',function(req,res,next){
    db.deleteReply(req.body.id,req.body.plainPassword,(code)=>{
        res.send({code: code});
    });
});

router.post('/refreshReply',function(req,res,next){
    db.getReply(req.body.id,(replyList)=>{
        res.send({replyList: replyList});
    });
});

router.post('/writeReply',function(req,res,next){
    db.writeReply(req.body,(code)=>{
        res.send({code: code})
    });
});

module.exports = router;