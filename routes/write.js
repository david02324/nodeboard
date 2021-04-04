var express = require('express');
var router = express.Router();
var db = require('../db-query');
var useCrypto = require('../crypto');

router.post('/',function(req,res,next){
    if (req.session.passport && req.session.passport.user) {
        res.render('write',{user: req.session.passport.user});
    }
    else {
        res.render('write',{user: false});
    }
});

router.post('/submit',function(req,res,next){
    if (req.session.passport && req.session.passport.user){
        req.body.isLogined = 1;
        req.body.password = req.session.passport.user.id;
        req.body.author = req.session.passport.user.nickname;
        db.writePost(req.body,(response)=>{
            if(response)
                res.redirect('/list?type='+req.body.type);
            else
                res.render('error');
        });
    } else{
        useCrypto(req.body.password, (cPassword) =>{
            req.body.password = cPassword;
            req.body.isLogined = 0;
            db.writePost(req.body,(response)=>{
                if(response)
                    res.redirect('/list?type='+req.body.type);
                else
                    res.render('error');
            });
        });
    }
});

module.exports = router;