var express = require('express');
var router = express.Router();
var getList = require('../db-query');

// 최상단 도메인으로 접속시 전체글보기로 redirect
router.get('/', function(req, res, next) {
  res.redirect('/list');
});

router.get('/list', function(req,res,next){
  let {type,page} = req.query;
  if (page===undefined)
    page = 1;
  getList(20,type,page,(response,maxPage)=>{
    if (type===undefined)
      type = '전체글 보기';
    res.render('list',{postData : response,type : type,maxPage : maxPage});
  });
});

module.exports = router;