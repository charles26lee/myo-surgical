var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Laparoscopy Training with Myo © 2016' });
});

module.exports = router;
