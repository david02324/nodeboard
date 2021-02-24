var express = require('express');
var router = express.Router();
var db = require('../db-query');
var useCrypto = require('../crypto');

router.post('/',function(req,res,next){
    if (req.body.userID === undefined)
        res.render('write',{userID: ''});
});

router.post('/submit',function(req,res,next){
    useCrypto(req.body.password, (cPassword) =>{
        req.body.password = cPassword;
        db.writePost(req.body,(response)=>{
            if(response)
                res.redirect('/list?type='+req.body.type);
            else
                res.render('error');
        });
    });
});

module.exports = router;