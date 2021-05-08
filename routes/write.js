var express = require('express');
var router = express.Router();
var useCrypto = require('../crypto');
var multipart = require('connect-multiparty');
var multipartMiddleware = multipart();
var fs = require('fs');
var request = require('request');
var models = require('../models');

// 글 작성
router.post('/',function(req,res,next){
    // 로그인 유저
    if (req.session.passport && req.session.passport.user) {
        res.render('write',{user: req.session.passport.user});
    }
    // 비로그인 유저
    else {
        res.render('write',{user: false});
    }
});

// 글 작성 제출
router.post('/submit',function(req,res,next){
    // 로그인 유저
    if (req.session.passport && req.session.passport.user){
        // 유저의 id를 암호화해서 전송
        useCrypto(req.session.passport.user.id, (cPassword)=>{
            data = {
                TITLE : req.body.title,
                TYPE : req.body.type,
                CONTENT : req.body.content,
                PASSWORD : cPassword,
                isLogined : 1,
                AUTHOR : req.session.passport.user.nickname
            };
            // DB반영
            models.POST.create(data).then(()=>{
                res.redirect('/list?type='+req.body.type);
            }).catch((err)=>{
                console.log(err);
                res.render('error',{code: -3000});
            });
        });
    // 비로그인 유저
    } else{
        // 비밀번호 암호화
        useCrypto(req.body.password, (cPassword) =>{
            data = {
                TITLE : req.body.title,
                TYPE : req.body.type,
                CONTENT : req.body.content,
                PASSWORD : cPassword,
                isLogined : 0,
                AUTHOR : req.body.author
            };
            // DB반영
            models.POST.create(data).then(()=>{
                res.redirect('/list?type='+req.body.type);
            }).catch((err)=>{
                console.log(err);
                res.render('error',{code: -3100});
            });
        });
    }
});

router.post('/imageUpload',multipartMiddleware,function(req,res){
    f = fs.readFileSync(req.files.file.path);
    base64 = Buffer.from(f).toString('base64');

    var secret = require('../secret.json');
    const options = {
        uri:'https://api.imgur.com/3/image', 
        method: 'POST',
        headers: {
            Authorization: "Client-ID "+ secret.imgurAPI.clientID
        },
        form: {
          image:base64,
        },
        json: true
    }
    request.post(options, function(error,httpResponse,body){
        if(error){
            res.send({error: error});
        } else{
            res.send({url: body.data.link});
        }
    });
});

module.exports = router;