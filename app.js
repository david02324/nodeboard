var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var session = require('express-session');

var listRouter = require('./routes/list');
var viewRouter = require('./routes/view');
var writeRouter = require('./routes/write');
var modifyRouter = require('./routes/modify');
var searchRouter = require('./routes/search');
var loginRouter = require('./routes/login');
var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
// 세션
app.use(session({
  secret: 'SECRET CODE',
  resave: false,
  saveUninitialized: true
}))

// 제이쿼리
app.use('/jq',express.static(__dirname+'/node_modules/jquery/dist'));
// 부트스트랩
app.use('/js',express.static(__dirname+'/node_modules/bootstrap/dist/js'));
app.use('/css',express.static(__dirname+'/node_modules/bootstrap/dist/css'));

app.use('/', listRouter);
app.use('/view',viewRouter);
app.use('/write',writeRouter);
app.use('/update',modifyRouter);
app.use('/search',searchRouter);
app.use('/login',loginRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;