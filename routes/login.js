var express = require('express');
var router = express.Router();
var db = require('../db-query');
var passport = require('passport');
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;

router.use(passport.initialize());
router.use(passport.session());

passport.serializeUser(function(user, done) {
    done(null, user);
});
passport.deserializeUser(function(obj, done) {
    done(null, obj);
});

// 구글 로그인 API 정보 등록
var goolgeCred = require('../googleCred.json');
    passport.use(new GoogleStrategy({
        clientID: goolgeCred.web.client_id,
        clientSecret: goolgeCred.web.client_secret,
        callbackURL: goolgeCred.web.redirect_uris[0]
    },
    function(accessToken, refreshToken, profile, done) {
        process.nextTick(function(){
            var user = {}
            db.findUser(profile.id,(response)=>{
                user.id = profile.id;
                console.log(profile.id);
                if (response == 1){
                    return done(false);
                } else if (response == 0){
                    user.newUser = true;
                } else{
                    user.newUser = false;
                    user.nickname = response.NICKNAME;
                    user.group = response.GROUP;
                }
                return done(null,user);
            });
        })
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
        res.render('error');
    } else{
        res.render('register');
    }
});

// 가입 제출
router.post('/registerConfirm',function(req,res,next){
    db.findUser(req.session.passport.user.id,(response)=>{
        if (response != 0){
            res.render('error' ,{code: -100});
        } else{
            db.newUser(req.session.passport.user.id,req.body.nickname,(response)=>{
                res.send({result:response});
            });
        }
    });
});

// 로그아웃
router.get('/logout', function(req, res){
    req.logout();
    res.redirect('/');
});

module.exports = router;