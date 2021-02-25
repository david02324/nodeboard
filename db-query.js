var db = require('./db-connect')
var useCrypto = require('./crypto');

var getList = function(amount,type,page,callback){
    // 전체 글 조회
    if (type===undefined){
        db.query('SELECT COUNT(*) AS COUNT FROM POST',function(err,count){
            if (err)
                console.log('에러 발생 : ' + err);
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
                console.log('에러 발생 : ' + err);
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

var viewPost = function(id,callback){
    // 조회수 증가
    db.query('UPDATE POST SET VIEWS=VIEWS+1 WHERE ID=?',[id],function(){});
    // 글 조회
    db.query('SELECT * FROM POST WHERE ID=?',[id],function(err,post){
        if(err){
            console.log('에러 발생 : ' + err);
        } else{
            callback(post[0]);
        }
    });
}

var writePost = function(data,callback){
    // 쿼리에 insert
    db.query('INSERT INTO POST (`TITLE`, `AUTHOR`, `TYPE`, `CONTENT`, `PASSWORD`) VALUES (?, ?, ?, ?, ?)',
        [data.title,data.author,data.type,data.content,data.password],function(err){
            if (err)
                callback(false);
            else
                callback(true);
        });
}

var checkPassword = function(id,plainPassword,callback){
    useCrypto(plainPassword,function(password){
        db.query('SELECT PASSWORD FROM POST WHERE ID=?',[id],function(err,savedPassword){
            if (savedPassword[0].PASSWORD==password)
                callback(true);
            else
                callback(false);
        });
    });
}

var deletePost = function(id,callback){
    db.query('DELETE FROM POST WHERE ID=?',[id],(err)=>{
        if (err)
            callback(false);
        else
            callback(true);
    });
};

exports.getList = getList;
exports.viewPost = viewPost;
exports.writePost = writePost;
exports.checkPassword = checkPassword;
exports.deletePost = deletePost;