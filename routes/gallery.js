var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
var db = require('./../models');
var Photo = db.Photo;


router.use(bodyParser.urlencoded({ extended : true }));

router.get('/:id', function(req, res) {
  Photo.findById(req.params.id)
    .then(function (photo) {
      res.json(photo);
    });
});

router.post('/', function (req, res) {
  Photo.create({
    title : req.body.title,
    link : req.body.link,
    description : req.body.description })
    .then(function (photo) {
      res.json(photo);
    });
});


module.exports = router;