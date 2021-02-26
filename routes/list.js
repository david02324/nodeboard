var express = require('express');
var router = express.Router();
var db = require('../db-query');

// 최상단 도메인으로 접속시 전체글보기로 redirect
router.get('/', function(req, res, next) {
  res.redirect('/list');
});

router.get('/list', function(req,res,next){
  let {type,page} = req.query;
  //console.log(rip.getClientIp(req));
  //console.log(req.ip);
  //console.log(req.headers['x-forwarded-for'] ||  req.connection.remoteAddress);
  if (page===undefined)
    page = 1;
  if (type===undefined)
    type = 'all';
  db.getList(20,type,page,(response,maxPage)=>{
    res.render('list',{postData : response,type : type,page : page,maxPage : maxPage});
  });
});

module.exports = router;