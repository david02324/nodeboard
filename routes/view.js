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

                    if (req.session.passport && req.session.passport.user)
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
    if (req.body.isLogined){
        password = ''
        db.deleteReply(req.body.id,password,(code)=>{
            res.send({code:code});
        });
    }else {
        db.deleteReply(req.body.id,req.body.plainPassword,(code)=>{
            res.send({code: code});
        });
    }
});

router.post('/refreshReply',function(req,res,next){
    db.getReply(req.body.id,(replyList)=>{
        data = {replyList: replyList};
        if (req.session.passport && req.session.passport.user){
            data.nickname = req.session.passport.user.nickname;
        }
        res.send(data);
    });
});

router.post('/writeReply',function(req,res,next){
    if (req.body.isLogined == 1 && req.body.writer != req.session.passport.user.nickname){
        res.send({code: -100});
    } else {
        db.writeReply(req.body,(code)=>{
            res.send({code: code})
        });
    }
});

router.post('/loginCheck',function(req,res,next){
    if(req.session.passport && req.session.passport.user){
        res.send({logined: true,nickname: req.session.passport.user.nickname});
    } else {
        res.send({logined: false});
    }
});

module.exports = router;