var express = require('express');
var app = express();
var CONFIG = require('./config/config.js');
var bodyParser = require('body-parser');
var db = require('./models');
var Photo = db.Photo;
var Users = db.Users;
var passport = require('passport');
var session = require('express-session');
var LocalStrategy = require('passport-local').Strategy;
var methodOverride = require('method-override');
var flash = require('connect-flash');
var loggedInChecker = false;

app.use(express.static('public'));
app.use(bodyParser.urlencoded({extended:true}));

app.set('views', 'templates');
app.set('view engine', 'jade');

app.use(session(CONFIG.SESSION));
app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser(function(user, done) {
  done(null, user);
});
passport.deserializeUser(function(user, done) {
  done(null, user);
});

passport.use(new LocalStrategy(
  function(username, password, done){
    var user;
    Users.findOne({where : {
      username : username
    }})
    .then(function(data,err){
      if(err) return done(err);
      user = data;
      if(!user){
        console.log("no user");
        return done(null, false);
      }
      if(user.username === username && user.password !== password){
        console.log("wrong pw");
        return done(null, false);
      }
      if(user.username === username && user.password === password){
        console.log('success');
        loggedInChecker=true;
        return done(null, user);
      }
    });
  }
));


function isAuthenticated(req,res,next){
  if(!req.isAuthenticated()){
    console.log('not auth');
    return res.redirect('/login');
  }
  console.log('authenticated');
  return next();
}

app.use( methodOverride(function( req, res ) {
  if( req.body && typeof req.body === 'object' && '_method' in req.body ) {
    var method = req.body._method;
    delete req.body._method;
    return method;
  }
}));

app.get('/login', function(req, res){
  res.render('photos/login');
});

app.get('/register', function(req,res){
  res.render('photos/register');
});

app.get('/logout', function(req,res){
  loggedInChecker=false;
  req.logout();
  res.redirect('/login');
});

app.post('/login', passport.authenticate('local', {
  successRedirect : '/',
  failureRedirect : '/login',
}));

app.post('/register', function(req,res){
  Users.findOne({
    where:{
      username: req.body.username
    }
  })
  .then(function(data){
    if(!data){
      Users.create({
        username : req.body.username,
        password : req.body.password
      })
      .then(function (data) {
        res.redirect('/logIn');
      })
    } else {
      res.redirect('/register');
    }
  });

});


app.get('/', function(req, res) {
  Photo.findAll()
    .then(function (data) {
      res.render('photos/index', {
        photoMain: data.shift(),
        photos : data,
        loggedIn: loggedInChecker
      });
    });
});



app.use('/gallery', require('./routes/gallery.js'));

var server = app.listen(3000, function() {
  db.sequelize.sync();
  console.log("server listening at : ", server.address());
});