var express = require('express');
var router = express.Router();
var passport = require('passport');
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
var models = require('../models');

router.use(passport.initialize());
router.use(passport.session());

passport.serializeUser(function(user, done) {
    done(null, user);
});
passport.deserializeUser(function(obj, done) {
    done(null, obj);
});

// 구글 로그인 API 정보 등록
var secret = require('../secret.json');
const { reset } = require('nodemon');
    passport.use(new GoogleStrategy({
        clientID: secret.googleCred.web.client_id,
        clientSecret: secret.googleCred.web.client_secret,
        callbackURL: secret.googleCred.web.redirect_uris[0]
    },
    function(accessToken, refreshToken, profile, done) {
        process.nextTick(function(){
            var user = {}
            user.id = profile.id;
            findUser(user.id).then((response)=>{
                if (response == 0){
                    user.newUser = true;
                } else{
                    user.newUser = false;
                    user.nickname = response.NICKNAME;
                    user.group = response.GROUP;
                }
                console.log(user);
                return done(null,user);
            });
        });
    }
));

router.get('/google',
    passport.authenticate('google',
    { scope: ['https://www.googleapis.com/auth/plus.login'] }));

router.get('/google/callback', 
    passport.authenticate('google', { failureRedirect: '/login/google' }),
    function(req, res) {
        if(!req.session.passport.user.newUser){
            res.redirect('/');
        } else{
            res.redirect('/login/register');
        }
    }
);

// 가입
router.get('/register',function(req,res,next){
    if(!req.session.passport.user.newUser){
        res.render('error',{code:-5000});
    } else{
        res.render('register');
    }
});

// 가입 제출
router.post('/registerConfirm',function(req,res,next){
    if (req.session.passport && req.session.passport.user && req.session.passport.user.newUser){
        findUser(req.session.passport.user.id).then((response)=>{
            if(response != 0){
                res.render('error' ,{code: -5100});
            } else{
                newUser(req.session.passport.user.id,req.body.nickname).then((response)=>{
                    res.send({result:response});
                });
            }
        })
    }
});

// 로그아웃
router.get('/logout', function(req, res){
    req.logout();
    res.redirect('/');
});

async function findUser(id){
    const data = await models.USER.findOne({
        where: {
            USER_CODE: id
        }
    });
    if (data){
        return data.dataValues;
    } else{
        return 0;
    }
}

async function newUser(id,nickname){
    const data = await models.USER.findOne({
        where: {
            NICKNAME: nickname
        }
    }).catch((err)=>{
        console.log(err);
        return 0;
    });
    if (data){
        return -1;
    } else{
        await models.USER.create({
            USER_CODE:id,
            NICKNAME: nickname
        }).catch((err)=>{
            console.log(err);
            return 0;
        });
        return 1;
    }
}

module.exports = router;