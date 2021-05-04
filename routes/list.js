var express = require('express');
var router = express.Router();
var db = require('../db-query');
var models = require('../models')

// 최상단 도메인으로 접속시 전체글보기로 redirect
router.get('/', function(req, res, next) {
  res.redirect('/list');
});

router.get('/error', function(req,res){
  res.render('error',{code: '사용자 입력'});
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

  getMaxPage().then(console.log);

  // // 리스트 가져오기
  // db.getList(20,type,page,(response,maxPage)=>{
  //   // 우측 바(공지사항, 인기글) 가져오기
  //   db.innerRight((bestPosts,announcements)=>{
  //     // 정상적으로 로드되었다면
  //     if (bestPosts && announcements){
  //       data = {postData : response,values : values,maxPage : maxPage,bestPosts: bestPosts, announcements: announcements};
  //       // 로그인 상태라면 data.user에 로그인 정보 담아서 전송
  //       if (req.session.passport && req.session.passport.user)
  //         data.user = req.session.passport.user;
  //       else
  //         data.user = false;
        
  //       res.render('list',data);
  //     }
  //     });
  // });
});

module.exports = router;