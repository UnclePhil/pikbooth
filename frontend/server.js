var express = require('express');
var app = express();
var path = require('path');
fs = require('fs');
var hbs  = require('express-handlebars');
var dateFormat = require('dateformat');
var os = require( 'os' );
var exec = require('child_process').exec;

// Enable static CSS styles & js
app.use(express.static('assets'));


// enable template engines
app.engine( 'hbs', hbs( { 
  extname: 'hbs', 
  defaultLayout: 'main', 
  layoutsDir: __dirname + '/views/layouts/',
  partialsDir: __dirname + '/views/partials/'
} ) );

app.set( 'view engine', 'hbs' );

// define nocache middleware for some url
function nocache(req, res, next) {
  res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
  res.header('Expires', '-1');
  res.header('Pragma', 'no-cache');
  next();
}



//config definition
var config = { 
  save:{
    dir: "./pictures/", 
    prefix: "pikbooth-",
    ext: "jpg"
  },
  booth:{
    limit: 12,
    thwidth: 150
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
config.save.dir = process.env.PIKBOOTH_SAVE_DIR || "./pictures/" ;
config.save.prefix = process.env.PIKBOOTH_SAVE_PREFIX || "pikbooth-" ;
config.save.ext = process.env.PIKBOOTH_SAVE_EXT || "jpg" ;
config.mode = process.env.PIKBOOTH_MODE || "fake" ;  // fake dslr, rasp, webc
config.booth.limit = process.env.PIKBOOTH_BOOTH_LIMIT || 20 ;
config.booth.thwidth = process.env.PIKBOOTH_BOOTH_THWIDTH || 150 ;  // thumbnal width for booth
config.client.limit = process.env.PIKBOOTH_CLIENT_LIMIT || 20 ;
config.cmd.limit = process.env.PIKBOOTH_CMD_LIMIT || 5 ;
config.cmd.token = process.env.PIKBOOTH_CMD_TOKEN || 1961 ;

//-------------------------------------------------

// check and create dir for picture & thumbnail
exec("mkdir -p "+ path.join(config.save.dir,"thumb/"), (err, stdout, stderr) => {
  if (err) { console.log(err) }
  else { console.log('Directory created') }
});


var mime = {
  gif: 'image/gif',
  jpg: 'image/jpeg',
  png: 'image/png',
  svg: 'image/svg+xml'
};

var nw = os.networkInterfaces( );
//console.log (nw);
// ROUTES
////////////////////////////////////////

// root go to client page
app.get('/', nocache ,function (req, res) {
  res.render('client', {type:"client",mode:config.mode})
});
app.get('/client',nocache, function (req, res) {
  res.render('client', {type:"client",mode:config.mode})
});

// booth go to booth page 
app.get('/booth',nocache, function (req, res) {
  res.render('booth', {type:"booth",mode:config.mode, booth:1})
});

//cm go to command page
app.get('/cmd', nocache, function (req, res) {
  res.render('cmd', {type:"cmd",mode:config.mode})
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
app.get('/thumb/:pict', function (req, res) {
  
  var file = req.params.pict;
  var type = mime[path.extname(file).slice(1)] || 'text/plain';
  var s = fs.createReadStream(config.save.dir+'thumb/'+file);
  s.on('open', function () {
      res.set('Content-Type', type);
      s.pipe(res);
  });
  s.on('error', function () {
      res.set('Content-Type', 'text/plain');
      res.status(404).end('thumb Not found');
  });

});

app.get('/infos', nocache, function (req, res) {
  pictures = fs.readdirSync(config.save.dir);
  count = pictures.lenght
  lastpict = pictures.reverse()[0];
  ip="111.222.333.444" ;
  console.log('info picture list: '+pictures)
  res.render('infos', {type:"booth",mode:config.mode, count: count, lastpict:lastpict ,config:config, ip:ip })
});


// take the picture
function fire(cltid){
  var exec = require('child_process').exec;
  // picture definition
  var now = new Date();
  var dt = dateFormat(now,"yyyymmdd-HHMMss" );
  var pictname= config.save.prefix+dt+"."+config.save.ext;
  var fullname = path.join(config.save.dir,pictname);
  var fullthumb = path.join(config.save.dir,"thumb/",pictname);

// todo change the logic to allow multiple driver depending of the config
// fake: no Camera  (default)
// dslr: gphoto2 driver
// rasp: raspistill driver
// webc: webcam driver
//-----------------------------------------------------------
var cmd

switch (config.mode.toLowerCase()) {
  case 'dslr':
    cmd = 'gphoto2 --capture-image-and-download --keep --filename "'+fullname+'"'
    break;

  case 'rasp':
    cmd = 'raspistill -o '+fullname
    break;

  case 'webc':
    cmd = 'fswebcam '+fullname
    break;

  default:
    cmd = 'cp '+path.join('./fake','fake.jpg')+' '+fullname
}


// process the command 
  exec(cmd, (err, stdout, stderr) => {
    if (err) {
      console.error('Gphoto exec error: '+err);
      io.to(cltid).emit('error', "Seems we have an error during the picture taking")
    }
    else {
      
      exec("convert -strip -thumbnail '"+config.booth.thwidth+"x>' "+fullname+" "+fullthumb, (err, stdout, stderr) => {
        if (err) {
          console.error('thumbnal exec error: '+err);
          io.to(cltid).emit('error', "Seems we have an error during the picture transformation")
        }
        else {
          console.log('OK Real picture '+pictname);
          io.emit('newpict', pictname);
        }
      });
      
    }
  });
}


//start a server on port 3000 and log its start to our console
// WEBSOCKET 
var server = app.listen(3000, function () {

  var port = server.address().port;
  console.log('PiKBooth frontend listening on port ', port);
  console.log('Config: '+JSON.stringify(config));

});

var io = require('socket.io')(server);


io.on('connection', function(client) {
  console.log(client.id+': Connected');
  
  client.on('join', function(data) {
    var pictures = fs.readdirSync(path.join(config.save.dir,"thumb")).reverse().slice(0,config.booth.limit);
    io.to(client.id).emit('allpicts', pictures);
    console.log(client.id+": ("+data+") push pictures");
  });

  client.on('fire', function(data) {
    console.log(client.id+": ("+data+") fire a picture")
    fire(client.id) ;
  });
  client.on('cmdfire', function(data) {
    console.log(client.id+": ("+data+") fire a picture")
    io.emit('firebycmd');
  });



});
