var db = require('./db-connect')
var useCrypto = require('./crypto');

var getList = function(amount,type,page,callback){
    // 전체 글 조회
    if (type=='all'){
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
        if(err || post[0] === undefined){
            console.log('에러 발생 : ' + err);
            callback(false);
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

var viewForUpdatePost = function(id,callback){
    db.query('SELECT * FROM POST WHERE ID=?',[id],(err,post)=>{
        if (err)
            callback(false);
        else
            callback(post[0]);
    });
};

var updatePost = function(data,callback){
    db.query('UPDATE POST SET TITLE=? , CONTENT=? WHERE PASSWORD=?',[data.title,data.content,data.code],(err)=>{
        callback(err);
    });
}

var searchPost = function(data,amount,callback){
    // DB 칼럼명에 맞게 변경
    if (data.mode=='제목')
        data.mode='TITLE';
    else if (data.mode=='작성자')
        data.mode='AUTHOR';
    else if (data.authormode=='내용')
        data.mode='CONTENT';


    if(data.type=='all'){
        db.query('SELECT COUNT(*) AS COUNT FROM POST WHERE ?? LIKE ?',[data.mode,"%"+data.keyword+"%"],(err,count)=>{
            if (err)
                callback(false);
            else{
                count = count[0].COUNT;
                var maxPage = Math.ceil(count / amount);

                db.query('SELECT * FROM POST WHERE ?? LIKE ? ORDER BY ID DESC LIMIT ?, ?',[data.mode,"%"+data.keyword+"%",(data.page-1)*amount,amount],(err,result)=>{
                    if(err)
                        callback(false);
                    else
                        callback(result,maxPage);
                });
            }
        });
    } else{
        db.query('SELECT COUNT(*) AS COUNT FROM POST WHERE TYPE=? AND ?? LIKE ?',[data.type,data.mode,"%"+data.keyword+"%"],(err,count)=>{
            if (err)
                callback(false);
            else{
                count = count[0].COUNT;
                var maxPage = Math.ceil(count / amount);

                db.query('SELECT * FROM POST WHERE TYPE=? AND ?? LIKE ? ORDER BY ID DESC LIMIT ?, ?',[data.type,data.mode,"%"+data.keyword+"%",(data.page-1)*amount,amount],(err,result)=>{
                    if(err)
                        callback(false);
                    else
                        callback(result,maxPage);
                });
            }
        });
    }
}

var thumbup = function(id,ip,callback){
    // 추천수 카운트 변수
    var count;

    // 해당 글의 추천 수를 새로운 DB에서 카운트 해서 가져오기
    db.query('SELECT COUNT(*) AS COUNT FROM THUMBUPS WHERE POST_ID=?',[id],(err,result)=>{
        if (err){
            errcode = 1
            callback(false,errcode);
            console.log(err);
            return;
        }
        count = result[0].COUNT;
    });

    // 해당 글을 추천한 ip리스트 가져오기
    db.query('SELECT USER_IP FROM THUMBUPS WHERE POST_ID=?',[id],(err,result)=>{
        if (err){
            errcode = 2
            callback(false,errcode);
            console.log(err);
            return;
        }


        // 해당 ip가 이미 추천한 ip인지 확인
        for (let savedIp of result)
            if (savedIp.USER_IP == ip)
                var forDelete = true;

        if (forDelete){
            // 추천 취소
            db.query('DELETE FROM THUMBUPS WHERE POST_ID=? AND USER_IP=?',[id,ip],(err,hi)=>{
                if (err){
                    errcode = 3
                    console.log(err);
                    callback(false,errcode);
                    return;
                }
                
                count--;
                // 해당 글의 추천수 조정
                db.query('UPDATE POST SET THUMBUP=? WHERE ID=?',[count,id],()=>{});
                callback('deleted',count);
            });
        } else{
            // 추천 진행
            db.query('INSERT INTO THUMBUPS (`POST_ID`, `USER_IP`) VALUES (?,?)',[id,ip],(err)=>{
                if (err){
                    errcode = 4
                    callback(false,errcode);
                    console.log(err);
                    return;
                }

            count++;
                // 해당 글의 추천수 조정
                db.query('UPDATE POST SET THUMBUP=? WHERE ID=?',[count,id],()=>{});
                callback('success',count);
            });
        }
    });
}

exports.getList = getList;
exports.viewPost = viewPost;
exports.writePost = writePost;
exports.checkPassword = checkPassword;
exports.deletePost = deletePost;
exports.viewForUpdatePost = viewForUpdatePost;
exports.updatePost = updatePost;
exports.searchPost = searchPost;
exports.thumbup = thumbup;