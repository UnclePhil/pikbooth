var express = require('express');
var app = express();
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
    dir: "./saved/", 
    prefix: "pikbooth-",
    ext: "jpg"
  } 
}
// ROUTES
////////////////////////////////////////

// root booth file
app.get('/', function (req, res) {
  res.render('booth.html');
});


// take the picture
app.get('/photo', function (req, res) {
  var exec = require('child_process').exec;
  // picture definition
  var now = new Date();
  var dt = dateFormat(now,"yyyymmdd-hhMMss" );
  var pictname= config.save.prefix+dt+"."+config.save.ext;
  var fullname = config.save.dir+pictname;

  console.log(`try to take picture ${fn}`);

  exec('gphoto2 --capture-image-and-download --keep --filename "'+fullname+'"', (err, stdout, stderr) => {
    if (err) {
      console.error(`exec error: ${err}`);
      return;
    }
    console.log(`Click happens ${stdout}`);
    res.render('booth.html', pictname)
  });
  ;
});

// list all pictures
app.get('/pict', function (req, res) {
  
});

// get one pictures
app.get('/pict/:pict', function (req, res) {
  var img = fs.readFileSync(config.save.dir+pict);
  res.writeHead(200, {'Content-Type': 'image/jpg' });
  res.end(pict, 'binary');
});


//start a server on port 80 and log its start to our console
var server = app.listen(80, function () {

  var port = server.address().port;
  console.log('Example app listening on port ', port);

});
