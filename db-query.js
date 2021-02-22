const e = require('express');
var db = require('./db-connect')

var getList = function(amount,type,page,callback){
    // 전체 글 조회
    if (type===undefined){
        db.query('SELECT COUNT(*) AS COUNT FROM POST',function(err,count){
            if (err)
                print('에러 발생 : ' + err);
            else{
                count = count[0].COUNT;
                var maxPage = Math.ceil(count / amount);

                db.query('SELECT * FROM POST ORDER BY ID DESC LIMIT ?, ?',[(page-1)*amount,amount],function(err,result){
                    if (err)
                        console.log('에러 발생 : ' + err);
                    else
                        callback(result,maxPage);
                });
            }
        });
    // 특정 게시판 글 조회
    } else {
        db.query('SELECT COUNT(*) AS COUNT FROM POST WHERE TYPE=?',[type],function(err,count){
            if (err)
                print('에러 발생 : ' + err);
            else{
                count = count[0].COUNT;
                var maxPage = Math.ceil(count / amount);

                db.query('SELECT * FROM POST WHERE TYPE=? ORDER BY ID DESC LIMIT ?, ?',[type,(page-1)*amount,amount],function(err,result){
                    if (err)
                        console.log('에러 발생 : ' + err);
                    else
                        callback(result,maxPage);
                });
            }
        });
    }
}

module.exports = getList;