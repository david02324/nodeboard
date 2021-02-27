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
            res.render('list',{postData: response,values: data,maxPage: maxPage});
    });
});

module.exports = router;