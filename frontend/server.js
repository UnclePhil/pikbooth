var express = require('express');
var app = express();

var dateFormat = require('dateformat');


// Enable HTML template middleware
app.engine('html', require('ejs').renderFile);

// Enable static CSS styles
app.use(express.static('styles'));

// reply to request with "Hello World!"
app.get('/', function (req, res) {
  res.render('index.html');
});

app.get('/photo', function (req, res) {
  var exec = require('child_process');
  var now = new Date();
  var dt = dateFormat(now,"yyyymmdd-hhMMss" )
  var fn = dt+".jpg";

  exec('gphoto2 --capture-image-and-download --keep --filename "'+fn+'"', (err, stdout, stderr) => {
    if (err) {
      console.error(`exec error: ${err}`);
      return;
    }
  
    console.log(`Click happens ${stdout}`);
  });
  res.render('index.html');
});


//start a server on port 80 and log its start to our console
var server = app.listen(80, function () {

  var port = server.address().port;
  console.log('Example app listening on port ', port);

});
