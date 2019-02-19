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

//config definition
var config = { 
  save:{
    dir: "/pictures/", 
    prefix: "pikbooth-",
    ext: "jpg"
  },
  booth:{
    limit: 20
  },
  client:{
    limit: 20
  },
  cmd:{
    limit: 5,
    token: "1961"
  }, 
  mode:"dev"   
}
// overwrtie by env var
config.save.dir = process.env.PIKBOOTH_SAVE_DIR || "/pictures/" ;
config.save.prefix = process.env.PIKBOOTH_SAVE_PREFIX || "pikbooth-" ;
config.save.ext = process.env.PIKBOOTH_SAVE_EXT || "jpg" ;
config.mode = process.env.PIKBOOTH_MODE || "dev" ;
config.booth.limit = process.env.PIKBOOTH_BOOTH_LIMIT || 20 ;
config.client.limit = process.env.PIKBOOTH_CLIENT_LIMIT || 20 ;
config.cmd.limit = process.env.PIKBOOTH_CMD_LIMIT || 5 ;
config.cmd.token = process.env.PIKBOOTH_CMD_TOKEN || 1961 ;
//-------------------------------------------------

var mime = {
  gif: 'image/gif',
  jpg: 'image/jpeg',
  png: 'image/png',
  svg: 'image/svg+xml'
};

// ROUTES
////////////////////////////////////////

// root go to client page
app.get('/', function (req, res) {
  pictures = fs.readdirSync(config.save.dir).reverse().slice(0,config.client.limit-1);
  console.log('client request picture list')
  res.render('client', {type:"client",mode:config.mode, pictures: pictures})
});
app.get('/client', function (req, res) {
  pictures = fs.readdirSync(config.save.dir).reverse().slice(0,config.client.limit-1);
  console.log('client request picture list')
  res.render('client', {type:"client",mode:config.mode, pictures: pictures})
});

// booth go to booth page 
app.get('/booth', function (req, res) {
  pictures = fs.readdirSync(config.save.dir).reverse().slice(0,config.booth.limit-1);
  console.log('booth request picture list')
  res.render('booth', {type:"booth",mode:config.mode, pictures: pictures, booth:1})
});

//cm go to command page
app.get('/cmd', function (req, res) {
  pictures = fs.readdirSync(config.save.dir).reverse().slice(0,config.cmd.limit-1);
  console.log('cmd request picture list')
  res.render('cmd', {type:"cmd",mode:config.mode, pictures: pictures})
});


app.get('/infos', function (req, res) {
  pictures = fs.readdirSync(config.save.dir);
  console.log('picture list: '+pictures)
  res.render('infos', {type:"booth",mode:config.mode, count: pictures.length, config:config })
});


// take the picture
app.get('/photo/:ret', function (req, res) {
  var ret = req.params.ret;
  var exec = require('child_process').exec;
  // picture definition
  var now = new Date();
  var dt = dateFormat(now,"yyyymmdd-HHMMss" );
  var pictname= config.save.prefix+dt+"."+config.save.ext;
  var fullname = config.save.dir+pictname;

  console.log(`try to take picture ${fullname}`);
  if (config.mode=="dev") {
    fs.createReadStream('./fake/fake.jpg').pipe(fs.createWriteStream(fullname));
    console.log(`Fake click happens `);
    res.redirect('/'+ret);
  }
  else {
    exec('gphoto2 --capture-image-and-download --keep --filename "'+fullname+'"', (err, stdout, stderr) => {
      if (err) {
        console.error('Gphoto exec error: '+err);
        return;
      }
      console.log('Click happens '+fullname);
      res.redirect('/'+ret);
    });
  } 
});

// list all pictures
app.get('/pict', function (req, res) {
  pictures = fs.readdirSync(config.save.dir).reverse();
  console.log('picture list: '+pictures)
  res.writeHead(200, {'Content-Type': 'application/json' });
  res.send(pictures);
});

// get one pictures
app.get('/pict/:pict', function (req, res) {
  
  var file = req.params.pict;
  var type = mime[path.extname(file).slice(1)] || 'text/plain';
  var s = fs.createReadStream(config.save.dir+file);
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
