var express = require('express');
var router = express.Router();
var models = require('../models')
const Sequelize = require('sequelize');
const Op = Sequelize.Op;

// 글 검색
router.get('/',function(req,res,next){
    let {type,mode,keyword,page} = req.query;
    if (page===undefined)
        page = 1;
    if (mode != '제목' && mode != '작성자' && mode != '내용'){
        res.render('error',{code:-1100});
    }

    Promise.all([
        getAnnouncements(),
        getBestPosts(),
        searchPost(type,mode,keyword,page)
    ]).then((values)=>{
        data = {};
        data.isSearch = true;
        data.page = page;
        data.type = type;
        data.mode = mode;
        data.keyword = keyword;

        data.announcements = [];
        for (let announcement of values[0]){
          data.announcements.push(announcement.dataValues);
        }
        
        data.bestPosts = [];
        for (let bestPost of values[1]){
          data.bestPosts.push(bestPost.dataValues);
        }

        data.maxPage = Math.ceil(values[2].count / 20);
        data.postData = [];
        for (let post of values[2].rows){
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

// 검색
async function searchPost(type,mode,keyword,page){
    if (type == 'all'){
        if (mode == '제목'){
            return models.POST.findAndCountAll({
                attributes:['ID','AUTHOR','isLogined','TITLE','VIEWS','THUMBUP'],
                where:{
                    TITLE: {[Op.like]:'%'+keyword+'%'}
                },
                order:[['ID','DESC']],
                limit: 20,
                offset: (page-1)*20
            });
        } else if (mode == '작성자'){
            return models.POST.findAndCountAll({
                attributes:['ID','AUTHOR','isLogined','TITLE','VIEWS','THUMBUP'],
                where:{
                    AUTHOR: {[Op.like]:'%'+keyword+'%'}
                },
                order:[['ID','DESC']],
                limit: 20,
                offset: (page-1)*20
            });
        } else if (mode == '내용'){
            return models.POST.findAndCountAll({
                attributes:['ID','AUTHOR','isLogined','TITLE','VIEWS','THUMBUP'],
                where:{
                    CONTENT: {[Op.like]:'%'+keyword+'%'}
                },
                order:[['ID','DESC']],
                limit: 20,
                offset: (page-1)*20
            });
        }
    } else{
        if (mode == '제목'){
            return models.POST.findAndCountAll({
                attributes:['ID','AUTHOR','isLogined','TITLE','VIEWS','THUMBUP'],
                where:{
                    TITLE: {[Op.like]:'%'+keyword+'%'},
                    type: type
                },
                order:[['ID','DESC']],
                limit: 20,
                offset: (page-1)*20
            });
        } else if (mode == '작성자'){
            return models.POST.findAndCountAll({
                attributes:['ID','AUTHOR','isLogined','TITLE','VIEWS','THUMBUP'],
                where:{
                    AUTHOR: {[Op.like]:'%'+keyword+'%'},
                    type: type
                },
                order:[['ID','DESC']],
                limit: 20,
                offset: (page-1)*20
            });
        } else if (mode == '내용'){
            return models.POST.findAndCountAll({
                attributes:['ID','AUTHOR','isLogined','TITLE','VIEWS','THUMBUP'],
                where:{
                    CONTENT: {[Op.like]:'%'+keyword+'%'},
                    type: type
                },
                order:[['ID','DESC']],
                limit: 20,
                offset: (page-1)*20
            });
        }
    }
}

module.exports = router;