var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
var db = require('./../models');
var Photo = db.Photo;

function isAuthenticated(req,res,next){
  if(!req.isAuthenticated()){
    console.log('not auth');
    return res.redirect('/login');
  }
  console.log('authenticated');
  return next();
}

router.use(bodyParser.urlencoded({ extended : true }));

router.get('/new', isAuthenticated, function(req, res) {
  res.render('photos/new');
});

router.get('/:id', function(req, res) {
  var thumbs;
  var main;
  Photo.findAll({where : {
    id : {
      $ne : req.params.id
    }
  }})
    .then(function (data) {
      thumbs = data;
      Photo.findById(req.params.id)
        .then(function(data){
          main = data;
        })
        .then(function(data){
          res.render('photos/single', {
            photo: main,
            thumbs: thumbs,
          });
        });
    });
});

router.get('/',function(req, res){
  res.redirect('/');
});

router.post('/', isAuthenticated, function (req, res) {
  console.log(req.body.id);
  Photo.create({
    title : req.body.title,
    link : req.body.link,
    description : req.body.description })
    .then(function (data) {
      res.redirect('gallery/' +data.id);
    });
});

router.get('/:id/edit', isAuthenticated, function(req, res){
  Photo.findById(req.params.id)
  .then(function(data){
    res.render('photos/edit', {
      photo : data
    });
  });
});

router.put('/:id', isAuthenticated, function(req, res){
  console.log('in put');
  Photo.update(
  {
    updatedAt : 'now()',
    title : req.body.title,
    description : req.body.description,
    link : req.body.link
  }, {
    where : {
      id : req.params.id
    }
  })
  .then(function(){
    res.redirect('/gallery/' + req.params.id);
  });
});

router.delete('/:id', isAuthenticated, function(req, res){
  Photo.destroy({
    where: {
      id: req.params.id
    }
  })
  .then(function(){
    res.redirect('/');
  });
});

module.exports = router;