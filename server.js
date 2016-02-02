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

app.use(express.static('public'));
app.use(bodyParser.urlencoded({extended:true}));
app.use(session(CONFIG.SESSION));
app.use(passport.initialize());
app.use(passport.session());

app.set('views', 'templates');
app.set('view engine', 'jade');

passport.serializeUser(function(user, done) {
  done(null, user);
});
passport.deserializeUser(function(user, done) {
  done(null, user);
});

passport.use(new LocalStrategy(
  function(username, password, done){
    var isAuthenticated = authenticate(username, password);
    if(!isAuthenticated){
      return done(null, false);
    }
    console.log("in strategy");
    var user;
    Users.findOne({where : {
    username : username
    }})
    .then(function(data){
      user = data;
      return done(null, user);
    });
  }
));

function authenticate(username, password){
  console.log("authenticate function");
  var userAuth;
  Users.findOne({where : {
    username : username
  }})
    .then(function(data){
      userAuth = data;
    })
    .then(function(data){
      return(userAuth.username === username && userAuth.password === password);
    });
}

function isAuthenticated(req,res,next){
  if(!req.isAuthenticated()){
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

app.post('/login', passport.authenticate('local', {
  successRedirect : '/new',
  failureRedirect : '/login'
}));

app.get('/', function(req, res) {
  Photo.findAll()
    .then(function (data) {
      res.render('photos/index', {
        photoMain: data.shift(),
        photos : data
      });
    });
});



app.use('/gallery', require('./routes/gallery.js'));

var server = app.listen(3000, function() {
  db.sequelize.sync();
  console.log("server listening at : ", server.address());
});