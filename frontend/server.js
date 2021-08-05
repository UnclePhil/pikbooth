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
    limit: 16,
    thwidth: 150
  },
  client:{
    limit: 1000
  },
  cmd:{
    limit: 50,
    token: "1961"
  }, 
  mode:"dev"   
}
// overwrtie by env var
config.save.dir = process.env.PIKBOOTH_SAVE_DIR || "./pictures/" ;
config.save.prefix = process.env.PIKBOOTH_SAVE_PREFIX || "pikbooth-" ;
config.save.ext = process.env.PIKBOOTH_SAVE_EXT || "jpg" ;
config.mode = process.env.PIKBOOTH_MODE || "fake" ;  // fake, dslr, rasp, webc
config.booth.limit = process.env.PIKBOOTH_BOOTH_LIMIT || 16 ; // number of picture visible in booth screen
config.booth.thwidth = process.env.PIKBOOTH_BOOTH_THWIDTH || 150 ;  // thumbnail width for booth screen
config.client.limit = process.env.PIKBOOTH_CLIENT_LIMIT || 1000 ; // number of pictures  in client screen 
config.cmd.limit = process.env.PIKBOOTH_CMD_LIMIT || 50 ;  // number of pictures in command module
config.cmd.token = process.env.PIKBOOTH_ID || 0000 ;  // not yet used

/// VARS ---

var mime = {
  gif: 'image/gif',
  jpg: 'image/jpeg',
  png: 'image/png',
  svg: 'image/svg+xml'
};

var nw = os.networkInterfaces( );


/////////////////////////////////////////////////////////
/// FUNCTIONS ---
/// get host information
/// ip, picture count
////////////////////////////////////////////////////////

/// get host ip, build number  and emit it
function gethostip() {
  cmd= 'curl -X GET --header "Content-Type:application/json" "$BALENA_SUPERVISOR_ADDRESS/v1/device?apikey=$BALENA_SUPERVISOR_API_KEY"'
  exec(cmd, (err, stdout, stderr) => {
    if (err) { console.log(err)
      return null; 
    }
    else { 
      let resp=JSON.parse(stdout); 
      let ip=resp.ip_address;
      let build=resp.commit;   
      console.log("Host supervisor response",resp);
      io.emit('boothip', ip);
      io.emit('boothbuild', build)
     }
  });
}

// count picture and emit number
function getpictcount() {
  var dt = fs.readdirSync(path.join(config.save.dir,"thumb")).length;
  console.log("Send booth pict count:",dt);
  io.emit('boothpictcount', dt);
}

function gethostinfo() {
  gethostip();
  getpictcount();
}

// check and create dir for picture & thumbnail
function makedir() {
  exec("mkdir -p "+ path.join(config.save.dir,"thumb/"), (err, stdout, stderr) => {
    if (err) { console.log(err) }
    else { console.log('Directory created') }
  });
}

// clean picture & thumb directory
function cleandir() {
  exec("rm -rf "+ path.join(config.save.dir,".*."), (err, stdout, stderr) => {
    if (err) { console.log("Cleaning error: ", err) }
    else { console.log('Directory cleaned') }
  });
  makedir()
}

/////////////////////////////////////////////////////////////////
//// take the picture //
////////////////////////////////////////////////////////////////

function fire(cltid){
  var exec = require('child_process').exec;
  // picture definition
  var now = new Date();
  var dt = dateFormat(now,"yyyymmdd-HHMMss" );
  var pictname= config.save.prefix+dt+"."+config.save.ext;
  var fullname = path.join(config.save.dir,pictname);
  var fullthumb = path.join(config.save.dir,"thumb/",pictname);

 
// Select driver
// fake: no Camera  (default)
// dslr: gphoto2 driver
// rasp: raspistill driver
// webc: webcam driver
//-----------------------------------------------------------
var cmd

switch (config.mode.toLowerCase()) {
  // dslr am with gphoto2
  case 'dslr':
    cmd = 'gphoto2 --capture-image-and-download --keep --filename "'+fullname+'"'
    break;

  // raspberrypicam with raspistill  
  case 'rasp':
    cmd = '/opt/vc/bin/raspistill -n -md 1 -t 1 -o '+fullname
    break;

  // webcam with ffmpeg
  case 'webc':
    cmd = 'ffmpeg -f video4linux2 -i /dev/v4l/by-id/usb-046d_081d_9B823220-video-index0 -vframes 1 '+fullname
    // cmd = 'fswebcam '+fullname
    break;

  // fake pictures
  default:

    nbr=Math.floor(Math.random() * 5) + 1
    fpct="fake"+nbr+".jpg"
    cmd = 'cp '+path.join('./fake',fpct)+' '+fullname
}
// process the command 
  exec(cmd, (err, stdout, stderr) => {
    if (err) {
      console.error(' photo exec error: '+err);
      io.to(cltid).emit('error', "Seems we have an error during the picture taking")
    }
    else {
      
      exec("convert -strip -thumbnail '"+config.booth.thwidth+"x>' "+fullname+" "+fullthumb, (err, stdout, stderr) => {
        if (err) {
          console.error('thumbnail exec error: '+err);
          io.to(cltid).emit('error', "Seems we have an error during the picture transformation")
        }
        else {
          console.log('OK Real picture '+pictname);
          io.emit('newpict', {"pict":pictname});
          gethostinfo()

        }
      });
      
    }
  });
}

/// EOF FUNCTIONS

////////////////////////////////////////
// HTTP ROUTES
////////////////////////////////////////

// default go to client page
app.get('/', nocache ,function (req, res) {
  res.render('client', {type:"client",cfg:config})
});

app.get('/client',nocache, function (req, res) {
  res.render('client', {type:"client",cfg:config})
});

// booth go to booth page 
app.get('/booth',nocache, function (req, res) {
  res.render('booth', {type:"booth",cfg:config, booth:1})
});

//cmd go to command page
// TODO : add security token
app.get('/cmd-'+config.cmd.token, nocache, function (req, res) {
  res.render('cmd', {type:"cmd",cfg:config})
});

//cmd go to command page
// TODO : add security token
app.get('/cmd-'+config.cmd.token+'/set', nocache, function (req, res) {
  res.render('cmdset', {type:"cmdset",cfg:config})
});


/// additional route

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


////////////////////////////////////////
// WEBSOCKET server
////////////////////////////////////////

////////////////////////////////////////////////////////////////
/// START ROUTINE
///////////////////////////////////////////////////////////////

makedir()

//start a server on port 3000 and log its start to our console
var server = app.listen(3000, function () {

  var port = server.address().port;
  console.log('PiKBooth frontend listening on port ', port);
  console.log('Config: '+JSON.stringify(config));

});


var io = require('socket.io')(server);

/// LISTEN SOCKET ///

io.on('connection', function(client) {
  console.log(client.id+': Connected');
  
  client.on('join', function(data) {
    var lim=15 ;
    switch (data) {
      case 'booth':
        lim=config.booth.limit;
        gethostinfo();
        break;
      case 'client':
        lim=config.client.limit;
        gethostinfo();
        break;
      case 'cmd':
        lim=config.cmd.limit;
        gethostinfo()
        break;
      }

    var pictures = fs.readdirSync(path.join(config.save.dir,"thumb")).reverse().slice(0,lim);
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
  
  client.on('savesettings', function(data) {
    console.log(client.id+":  change mode to: "+data)
    config.mode = data;
    gethostinfo()
  });

  

});




/// EOF Server