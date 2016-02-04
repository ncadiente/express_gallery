var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
var db = require('./../models');
var Photo = db.Photo;
var loggedInChecker = false;
var userId;


function isAuthenticated(req,res,next){
  if(!req.isAuthenticated()){
    console.log('not auth');
    return res.redirect('/login');
  }
  console.log('authenticated');
  return next();
}

function userAuth(req,res,next){
  loggedInChecker= req.isAuthenticated();
  next();
}


router.use(bodyParser.urlencoded({ extended : true }));

router.use(userAuth);

router.get('/new', isAuthenticated, function(req, res) {
  res.render('photos/new', {
    loggedIn: loggedInChecker
  });
});

router.get('/:id', function(req, res) {
  var thumbs;
  var main;
  var user;
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
          if(req.isAuthenticated()){
            res.render('photos/single', {
              photo: main,
              thumbs: thumbs,
              loggedIn: loggedInChecker,
              isOwner : (req.user.id === main.UserId)
            });
          } else {
            res.render('photos/single', {
              photo: main,
              thumbs: thumbs,
              loggedIn: loggedInChecker,
              isOwner : false
            });
          }
        });
    });
});

router.get('/',function(req, res){
  res.redirect('/');
});

router.post('/', isAuthenticated, function (req, res) {
  Photo.create({
    title : req.body.title,
    link : req.body.link,
    description : req.body.description,
    UserId : req.user.id })
    .then(function (data) {
      res.redirect('gallery/' +data.id);
    });
});

router.get('/:id/edit', isAuthenticated, function(req, res){
  Photo.findById(req.params.id)
  .then(function(data){
    if(req.user.id === data.UserId){
      res.render('photos/edit', {
        photo : data
      });
    } else {
      res.send("not authorized");
    }
  });
});

router.put('/:id', isAuthenticated, function(req, res){
  Photo.findById(req.params.id)
    .then(function(data){
      if(req.user.id === data.UserId){
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
      } else {
        res.send('not authorized');
      }
    });
});

router.delete('/:id', isAuthenticated, function(req, res){
  Photo.findById(req.params.id)
    .then(function(data){
      if(req.user.id === data.UserId){
        Photo.destroy({
          where: {
            id: req.params.id
          }
        })
        .then(function(){
          res.redirect('/');
        });
      } else {
        console.log('not authorized');
      }
    });
});

module.exports = router;