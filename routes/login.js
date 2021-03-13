var express = require('express');
var router = express.Router();
var db = require('../db-query');
var passport = require('passport');
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;

router.use(passport.initialize());
router.use(passport.session());

var goolgeCred = require('../googleCred.json');
passport.use(new GoogleStrategy({
    clientID: goolgeCred.web.client_id,
    clientSecret: goolgeCred.web.client_secret,
    callbackURL: goolgeCred.web.redirect_uris[0]
},
function(accessToken, refreshToken, profile, done) {
console.log(profile)
        //     User.findOrCreate({ googleId: profile.id }, function (err, user) {
        //     return done(err, user);
        // });
    }
));

router.get('/google',
    passport.authenticate('google',
    { scope: ['https://www.googleapis.com/auth/plus.login'] }));

router.get('/google/callback', 
    passport.authenticate('google', { failureRedirect: '/login/google' }),
    function(req, res) {
        res.redirect('/');
});

module.exports = router;