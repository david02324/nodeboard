var express = require('express');
var router = express.Router();
var db = require('../db-query');

router.get('/', function(req, res, next) {
    let {id} = req.query;
    db.viewPost(id,(response)=>{
        res.render('view', {id: id,
            title: response.TITLE,
            author: response.AUTHOR,
            type: response.TYPE,
            content: response.CONTENT,
            views: response.VIEWS,
            isLogined: response.isLogined,
            thumbup: response.THUMBUP});
    });
});

module.exports = router;