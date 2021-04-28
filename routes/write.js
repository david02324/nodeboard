var express = require('express');
var router = express.Router();
var db = require('../db-query');
var useCrypto = require('../crypto');
var multipart = require('connect-multiparty');
var multipartMiddleware = multipart();
var fs = require('fs');
var request = require('request');

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
            req.body.password = cPassword;
            req.body.isLogined = 1;
            req.body.author = req.session.passport.user.nickname;
            // DB반영
            db.writePost(req.body,(response)=>{
                if(response)
                    res.redirect('/list?type='+req.body.type);
                else
                    res.render('error',{code: -110});
            });
        });
    // 비로그인 유저
    } else{
        // 비밀번호 암호화
        useCrypto(req.body.password, (cPassword) =>{
            req.body.password = cPassword;
            req.body.isLogined = 0;
            // DB반영
            db.writePost(req.body,(response)=>{
                if(response)
                    res.redirect('/list?type='+req.body.type);
                else
                    res.render('error',{code: -111});
            });
        });
    }
});

router.post('/imageUpload',multipartMiddleware,function(req,res){
    f = fs.readFileSync(req.files.file.path);
    base64 = Buffer.from(f).toString('base64');
    
    var imgbbAPI = require('../imgbbAPIkey.json');
    const options = {
        uri:'https://api.imgbb.com/1/upload?expiration=600&key='+imgbbAPI.key, 
        method: 'POST',
        form: {
          image:base64,
        },
        json: true
    }
    request.post(options, function(error,httpResponse,body){
        if(error){
            res.send({error: error});
        } else{
            res.send({url: body.data.display_url});
        }
    });
});

module.exports = router;