var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var db = require('./models');
var Photo = db.Photo;
var methodOverride = require('method-override');

app.use(bodyParser.urlencoded({extended:true}));

app.set('views', 'templates');
app.set('view engine', 'jade');

app.use( methodOverride(function( req, res ) {
  if( req.body && typeof req.body === 'object' && '_method' in req.body ) {
    var method = req.body._method;
    delete req.body._method;
    return method;
  }
}));

app.get('/', function(req, res) {
  Photo.findAll()
    .then(function (photo) {
      res.json(photo);
    });
});



app.use('/gallery', require('./routes/gallery.js'));

var server = app.listen(3000, function() {
  db.sequelize.sync();
  console.log("server listening at : ", server.address());
});