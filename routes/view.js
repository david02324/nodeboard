var express = require('express');
const useCrypto = require('../crypto');
var router = express.Router();
var db = require('../db-query');
const { Sequelize } = require('../models');
var models = require('../models')

// 글 조회
router.get('/', function(req, res, next) {
    const {id} = req.query;

    Promise.all([
        getAnnouncements(),
        getBestPosts(),
        viewPost(id)
    ]).then((values)=>{
        data = values[2].dataValues;

        data.announcements = [];
        for (let announcement of values[0]){
          data.announcements.push(announcement.dataValues);
        }
        
        data.bestPosts = [];
        for (let bestPost of values[1]){
          data.bestPosts.push(bestPost.dataValues);
        }

        if (req.session.passport && req.session.passport.user){
            data.user = req.session.passport.user;
        } else{
            data.user = false;
        }

        res.render('view',data);
    }).catch((err)=>{
        console.log(err);
        res.render('error',{code:-6000});
    });
});

// 글 삭제
router.post('/delete',function(req,res,next){
    checkIsLogined(req.body.id).then((values)=>{
        if (values[0] == 1){
            if (req.session.passport && req.session.passport.user){
                useCrypto(req.session.passport.user.id,(cPassword)=>{
                    checkPassword(req.body.id, cPassword).then((passwordChecked)=>{
                        if (passwordChecked){
                            deletePost(req.body.id).then((result)=>{
                                res.send({code: result});
                            });
                        } else {
                            res.send({code: -7000});
                        }
                    });
                });
            } else{
                res.send({code : -7100});
            }
        } else {
            useCrypto(req.body.plainPassword,(cPassword)=>{
                checkPassword(req.body.id, cPassword).then((passwordChecked)=>{
                    if (passwordChecked){
                        deletePost(req.body.id).then((result)=>{
                            res.send({code: result});
                        });
                    } else {
                        res.send({code: -7200});
                    }
                });
            });
        }
    }).catch((err)=>{
        console.log(err);
        res.render('error',{code: -7300});
    })
});

// 글 추천
router.post('/thumbup',function(req,res,next){
    // 추천자 ip와 글 id를 전송
    db.thumbup(req.body.id,req.ip,(response,count)=>{
        res.send({result: response, count: count})
    });
});

// 댓글 삭제
router.post('/deleteReply',function(req,res,next){
    // 로그인 유저의 자신의 댓글 삭제
    if (req.body.isLogined == 1){
        if (req.session.passport && req.session.passport.user){
            password = req.session.passport.user.id;
            db.deleteReply(req.body.id,password,(code)=>{
                res.send({code:code});
            });
        } else {
            res.send({code: -1000});
        }
    // 비로그인 유저의 댓글 삭제
    }else {
        db.deleteReply(req.body.id,req.body.plainPassword,(code)=>{
            res.send({code: code});
        });
    }
});

// 댓글 새로고침
router.post('/refreshReply',function(req,res,next){
    db.getReply(req.body.id,(replyList)=>{
        // 댓글 리스트
        data = {replyList: replyList};

        // 로그인 여부 확인
        if (req.session.passport && req.session.passport.user){
            data.nickname = req.session.passport.user.nickname;
        }

        res.send(data);
    });
});

// 댓글 작성
router.post('/writeReply',function(req,res,next){
    if (req.body.isLogined == 1){
        if (req.session.passport && req.session.passport.user){
            req.body.writer = req.session.passport.user.nickname;
            req.body.password = req.session.passport.user.id;
        } else {
            res.send({code: -100});
        }
    }
    db.writeReply(req.body,(code)=>{
        res.send({code: code})
    });
});

// 로그인 했는지 체크, 로그인했다면 닉네임 전송
router.post('/loginCheck',function(req,res,next){
    if(req.session.passport && req.session.passport.user){
        res.send({logined: true,nickname: req.session.passport.user.nickname});
    } else {
        res.send({logined: false});
    }
});

// 글 조회
async function viewPost(id){
    // 조회수 증가
    await models.POST.update({
        VIEWS: Sequelize.literal('VIEWS + 1')},{
        where: { ID: id}
    });

    // 데이터 가져오기
    return models.POST.findOne({
        attributes: {exclude: ['PASSWORD']},
        where: { ID: id}
    });
}

// 인증글 여부 확인
async function checkIsLogined(id){
    const check = await models.POST.findOne({
        attributes: ['isLogined'],
        where: {ID: id}
    });

    return check.dataValues.isLogined;
}

// 비밀번호 확인
async function checkPassword(id,password){
    const data = await models.POST.findOne({
        attributes:['PASSWORD'],
        where:{
            ID:id
        }
    });

    return data.dataValues.PASSWORD == password;
}

// 글 삭제
async function deletePost(id){
    // 댓글 삭제
    await models.REPLY.destroy({
        where: { POST_ID: id}
    });


    // 글 삭제
    return await models.POST.destroy({
        where: { ID: id}
    });
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