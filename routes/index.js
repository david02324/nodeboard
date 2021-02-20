var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: '노드로 게시판을 만들자' });
});

module.exports = router;
