var express = require('express');
var router = express.Router();
var db = require('../db-query');

// 최상단 도메인으로 접속시 전체글보기로 redirect
router.get('/', function(req, res, next) {
  res.redirect('/list');
});

router.get('/list', function(req,res,next){
  let {type,page} = req.query;

  if (page===undefined)
    page = 1;
  if (type===undefined)
    type = 'all';
  
  var values = {};
  values.page = page;
  values.type = type;
  values.isSearch = false;

  db.getList(20,type,page,(response,maxPage)=>{
    res.render('list',{postData : response,values : values,maxPage : maxPage});
  });
});

module.exports = router;