var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
    let {title} = req.query;
    res.render('view', {title: title});
});

module.exports = router;