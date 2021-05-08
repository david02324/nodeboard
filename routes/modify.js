var express = require('express');
var router = express.Router();
var useCrypto = require('../crypto.js');
var models = require('../models');

// 글 수정 요청
router.post('/',function(req,res,next){
    // 로그인 유저가 쓴 글인지 확인
    checkIsLogined(req.body.id).then((value)=>{
        // 로그인 유저의 글
        if (value == 1){
            // 로그인 상태인지 확인
            if (req.session.passport && req.session.passport.user){
                // userid 암호화
                useCrypto(req.session.passport.user.id,(cPassword)=>{
                    // 저장된 값과 대조
                    checkPassword(req.body.id,cPassword).then((checked)=>{
                        if (checked){
                            viewOne(req.body.id).then((post)=>{
                                post = post.dataValues;
                                post.code = cPassword;
                                post.user = req.session.passport.user;

                                res.render('update',post);
                            });   
                        } else{
                            res.render('error',{code:-4500});
                        }
                    }).catch((err)=>{
                        console.log(err);
                        res.render('error',{code:-4200});
                    });
                });
            } else{
                res.render('error',{code:-4100});
            }
        // 비로그인 유저의 글
        } else if (value == 0){
            // 비밀번호 암호화
            useCrypto(req.body.password,(cPassword)=>{
                // 비밀번호 대조
                checkPassword(req.body.id,cPassword).then((checked)=>{
                    if (checked){
                        viewOne(req.body.id).then((post)=>{
                            post = post.dataValues;
                            post.code = cPassword;
                            post.user = false;
                            
                            res.render('update',post);
                        });   
                    } else{
                        res.send("<script>alert('비밀번호가 일치하지 않습니다');window.location.href='/view?id="+req.body.id+"';</script>");
                    }
                }).catch((err)=>{
                    console.log(err);
                    res.render('error',{code:-4300});
                });
            });
        } else{
            res.render('error',{code:-4400});
        }
    }).catch((err)=>{
        console.log(err);
        res.render('error',{code:-4000});
    });
});

// 글 수정 제출
router.post('/submit', function(req,res,next){
    updatePost(req.body).then((result)=>{
        if (result[0] == 1){
            res.redirect('/view?id='+req.body.id);
        } else{
            res.render('error',{code: -4600});
        }
    }).catch((err)=>{
        console.log(err);
        res.render('error',{code:-4700});
    });
});

async function checkIsLogined(id){
    const data = await models.POST.findOne({
        attributes:['isLogined'],
        where:{
            ID:id
        }
    });
    return data.dataValues.isLogined;
}

async function checkPassword(id,password){
    const data = await models.POST.findOne({
        attributes:['PASSWORD'],
        where:{
            ID:id
        }
    });

    return data.dataValues.PASSWORD == password;
}

async function viewOne(id){
    return models.POST.findOne({
        attributes: ['id','title','author','content','type'],
        where:{
            ID:id
        }
    });
}

async function updatePost(data){
    return models.POST.update({
        TITLE: data.title,
        CONTENT: data.content
    },{
        where:{
            ID:data.id,
            PASSWORD:data.code
        }
    });
}

module.exports = router;