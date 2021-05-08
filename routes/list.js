var express = require('express');
var router = express.Router();
var models = require('../models');

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


  Promise.all([
    getAnnouncements(),
    getBestPosts(),
    models.POST.count(),
    getList(type,page)
  ]).then((values)=>{
    data = {};
    data.isSearch = false;
    data.maxPage = Math.ceil(values[2] / 20);
    data.page = page;
    data.type = type;
    data.mode = null;
    data.keyword = '';

    data.announcements = [];
    for (let announcement of values[0]){
      data.announcements.push(announcement.dataValues);
    }

    data.bestPosts = [];
    for (let bestPost of values[1]){
      data.bestPosts.push(bestPost.dataValues);
    }

    data.postData = [];
    for (let post of values[3]){
      data.postData.push(post.dataValues);
    }
    
    if (req.session.passport && req.session.passport.user){
      data.user = req.session.passport.user;
    }
    else {
      data.user = false; 
    }

    res.render('list',data);
  }).catch(function(err) {
    console.log(err);
    res.render('error',{code:-1000});
  });
});

// 글 가져오기
async function getList(type,page){
  if (type==='all'){
    return models.POST.findAll({
      attributes:['ID','AUTHOR','isLogined','TITLE','VIEWS','THUMBUP'],
      order:[['ID','DESC']],
      limit: 20,
      offset: (page-1)*20
    });
  } else {
    return models.POST.findAll({
      attributes:['ID','AUTHOR','isLogined','TITLE','VIEWS','THUMBUP'],
      where:{
        type: type
      },
      order:[['ID','DESC']],
      limit: 20,
      offset: (page-1)*20
    });
  }
}

// 추천글 가져오기
async function getBestPosts(){
  return models.POST.findAll({
    attributes:['ID','TITLE'],
    order:[['THUMBUP','DESC']],
    limit: 3
  });
}

// 공지사항 가져오기
async function getAnnouncements(){
  return models.POST.findAll({
    attributes:['ID','TITLE'],
    where:{
      type: '공지사항'
    },
    order:[['ID','DESC']],
    limit: 3
  });
}

module.exports = router;