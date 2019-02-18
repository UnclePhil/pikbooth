var express = require('express');
var app = express();
var path = require('path');
fs = require('fs');
var exphbs  = require('express-handlebars');


var dateFormat = require('dateformat');

// Enable static CSS styles
app.use(express.static('assets'));

// enable template engines
app.engine('handlebars', exphbs({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');

//configuration
var config = { 
  save:{
    dir: "/pictures/", 
    prefix: "pikbooth-",
    ext: "jpg"
  }, 
  mode:"dev"   
}

var imgmime = {
  gif: 'image/gif',
  jpg: 'image/jpeg',
  png: 'image/png',
  svg: 'image/svg+xml'
};

// ROUTES
////////////////////////////////////////

// root booth file
app.get('/', function (req, res) {
  pictures = fs.readdirSync(config.save.dir);
  console.log('picture list: '+pictures)
  res.render('booth', {pictures: pictures})
});


// take the picture
app.get('/photo', function (req, res) {
  var exec = require('child_process').exec;
  // picture definition
  var now = new Date();
  var dt = dateFormat(now,"yyyymmdd-hhMMss" );
  var pictname= config.save.prefix+dt+"."+config.save.ext;
  var fullname = config.save.dir+pictname;

  console.log(`try to take picture ${fullname}`);
  if (config.mode=="dev") {
    fs.createReadStream('./fake/fake.jpg').pipe(fs.createWriteStream(fullname));
    console.log(`Fake click happens `);
    res.redirect('/');
  }
  else {
    exec('gphoto2 --capture-image-and-download --keep --filename "'+fullname+'"', (err, stdout, stderr) => {
      if (err) {
        console.error('Gphoto exec error: '+err);
        return;
      }
      console.log('Click happens '+fullname);
      res.redirect('/');
    });
  } 
});

// list all pictures
app.get('/pict', function (req, res) {
  pictures = fs.readdirSync(config.save.dir);
  console.log('picture list: '+pictures)
  res.writeHead(200, {'Content-Type': 'application/json' });
  res.send(pictures);
});

// get one pictures
app.get('/pict/:pict', function (req, res) {
  
  var pict = request.params.pict;
  s = fs.readFileSync(config.save.dir+pict);
  var type = mime[path.extname(file).slice(1)] || 'text/plain';
  var s = fs.createReadStream(config.save.dir+pict);
  s.on('open', function () {
      res.set('Content-Type', type);
      s.pipe(res);
  });
  s.on('error', function () {
      res.set('Content-Type', 'text/plain');
      res.status(404).end('Not found');
  });

});


//start a server on port 80 and log its start to our console
var server = app.listen(80, function () {

  var port = server.address().port;
  console.log ('starting mode: '+config.mode)
  console.log('Example app listening on port ', port);

});
