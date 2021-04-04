var express = require('express');
var router = express.Router();
var db = require('../db-query');

router.get('/',function(req,res,next){
    let {type,mode,keyword,page} = req.query;
    if (page===undefined)
        page = 1;

    var data = {};
    data.type = type;
    data.mode = mode;
    data.keyword = keyword;
    data.page = page;
    data.isSearch = true;

    db.searchPost(data,20,(response,maxPage)=>{
        if (response===false)
            res.render('error');
        else
            db.innerRight((bestPosts,announcements)=>{
                if (bestPosts && announcements){
                    data = {postData: response,values: data,maxPage: maxPage,bestPosts: bestPosts, announcements: announcements};
                    if (req.session.passport && req.session.passport.user)
                        data.user = req.session.passport.user;
                    else
                        data.user = false;
                    res.render('list',data);
                }
                else
                    res.render('error');
            });
    });
});

module.exports = router;