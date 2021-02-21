var express = require('express');
var router = express.Router();


// 최상단 도메인으로 접속시 전체글보기로 redirect
router.get('/', function(req, res, next) {
  res.redirect('/list');
});

router.get('/list', function(req,res,next){
  let {type} = req.query;
  if (type === undefined)
    res.render('list-all');
});

module.exports = router;