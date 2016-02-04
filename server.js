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
var userId;
var bcrypt = require('bcrypt');

app.use(express.static('public'));
app.use(bodyParser.urlencoded({extended:true}));
app.use(flash());
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

passport.use(new LocalStrategy({
  passReqToCallback: true
  },
  function(req, username, password, done){
    var user;
    Users.findOne({where : {
      username : username
    }})
    .then(function(data){
      user = data;
      if(!user){
        req.flash("messages", "User does not exist");
        return done(null, false);
      }
      bcrypt.compare(password, user.password, function(err, res){
        console.log(res);
        if(user.username === username && res === false){
          req.flash("messages", "Password incorrect");
          return done(null, false);
        }
        if(user.username === username && res === true){
          userId = user.id;
          loggedInChecker=true;
          return done(null, user);
        }
      });
    });
  }
));

app.use( methodOverride(function( req, res ) {
  if( req.body && typeof req.body === 'object' && '_method' in req.body ) {
    var method = req.body._method;
    delete req.body._method;
    return method;
  }
}));

app.get('/login', function(req, res){
  res.render('photos/login', {messages : req.flash('messages')});
});

app.get('/register', function(req,res){
  res.render('photos/register', {messages : req.flash('messages')});
});

app.get('/logout', function(req,res){
  loggedInChecker=false;
  req.logout();
  res.redirect('/login');
});

app.post('/login', passport.authenticate('local', {
  successRedirect : '/gallery',
  failureRedirect : '/login',
  failureFlash : true,
  succesFlash : true
}));

function registerValidation(req,res,next){
  if(req.body.password !== req.body.passwordVerification){
    return res.json('password verification did not match');
  }

  if(req.body.username.length === 0 || req.body.password.length === 0 || req.body.passwordVerification.length === 0){
    return res.json('All fields need to be filled in');
  }

  next();
}

app.post('/register', registerValidation, function(req,res){
  Users.findOne({
    where:{
      username: req.body.username
    }
  })
  .then(function(data){
    if(!data){
      bcrypt.genSalt(10, function(err,salt){
        bcrypt.hash(req.body.password, salt, function(err,hash){
          Users.create({
            username : req.body.username,
            password : hash
          })
          .then(function (data) {
            req.login(data, function(err) {
              if (err) { return next(err); }
              loggedInChecker = true;
              return res.redirect('/gallery');
            });
          });
        });
      });
    } else {
      req.flash('messages', 'Username taken');
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
        loggedIn: loggedInChecker,
      });
    });
});



app.use('/gallery', require('./routes/gallery.js'));

var server = app.listen(3000, function() {
  db.sequelize.sync();
  console.log("server listening at : ", server.address());
});