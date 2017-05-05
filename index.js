// These two dependencies remain the same
var tessel = require('tessel');

// ambient
var ambientlib = require('ambient-attx4');
var ambient = ambientlib.use(tessel.port['A']);

// Require two other core Node.js modules
var fs = require('fs');
var url = require('url');

var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var port = process.env.PORT || 3000;

app.get('/', function(req, res){
    res.sendFile(__dirname + '/ambient.html');
});

http.listen(port, function(){
  console.log('listening on *:' + port);
});

var data = new Object();
ambient.on('ready', function() {
    // Get points of light and sound data.
    setInterval(function() {
        ambient.getLightLevel(function(err, lightdata) {
            if (err) throw err;
            ambient.getSoundLevel(function(err, sounddata) {
                if (err) throw err;
                data.light = lightdata.toFixed(8);
                data.sound = sounddata.toFixed(8);
                io.emit("ambient", data);
                console.log("Light level:", lightdata.toFixed(8), " ", "Sound Level:", sounddata.toFixed(8));
                if(data.light > 0.04){
                  tessel.led[2].on();
                }
                else{
                  tessel.led[2].off();
                }
                if(data.sound > 0.03){
                  tessel.led[3].on();
                }
                else{
                  tessel.led[3].off();
                }
            });
        });
    }, 500); // The readings will happen every .5 seconds
});

ambient.on('error', function(err) {
    console.log(err);
});
