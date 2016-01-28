var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var db = require('./models');
var Photo = db.Photo;

app.use(bodyParser.urlencoded({extended:true}));

app.set('views', templates);
app.set('view engine', 'jade');

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