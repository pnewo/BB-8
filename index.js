'use strict'

var app = require('express')()
var http = require('http').Server(app)
var io = require('socket.io')(http)
var sphero = require("sphero"),
    bb8 = sphero("45be286daaaf440183c458cc45526660")

bb8.connect().then(function() {
  console.log('BB8 connected')
  io.emit('status',{ connected: 'true' })

  var rColor = Math.floor(Math.random() * 255),
      gColor = Math.floor(Math.random() * 255),
      bColor = Math.floor(Math.random() * 255)

  bb8.color({ red: rColor, green: gColor, blue: bColor })
}).catch(function(err) { console.log('connection error',err)})

app.get('/', function(req, res){
  res.sendFile('index.html', { root: __dirname })
});

app.get('/dist/index.js', function(req, res){
  res.sendFile('/dist/index.js', { root: __dirname })
});

io.on('connection', function(socket){
  socket.on('move', function(mv){
    if (bb8.ready) {
      console.log('direction:', mv.direction, 'speed:', mv.speed)
      bb8.roll(parseInt(mv.speed,10), parseInt(mv.direction,10))
    }
  });
});

http.listen(3000, function(){
  console.log('listening on *:3000')
});

/*
var sphero = require("sphero"),
    bb8 = sphero("45be286daaaf440183c458cc45526660")

var stdin = process.stdin
stdin.setRawMode(true)
stdin.resume()
stdin.setEncoding('utf8')

stdin.on( 'data', function(char){
  if ( char === '\u0003' ) {
    process.stdin.pause();
    process.exit()
  }
  if ( char === 'a' ) {
    console.log('roll left')
    bb8.roll(100, 270)
  }
  if ( char === 'd' ) {
    console.log('roll right')
    bb8.roll(100, 90)
  }
  if ( char === 'w' ) {
    console.log('roll up')
    bb8.roll(100, 0)
  }
  if ( char === 's' ) {
    console.log('roll down')
    bb8.roll(100, 180)
  }
  if ( char === 'e' ) {
    console.log('roll stop')
    bb8.roll(0, 0)
  }
  // write the key to stdout all normal like
  //dconsole.log('Getting', char)
  //process.stdout.write( char );
});

bb8.connect(function() {
  setInterval(function() {
    var rColor = Math.floor(Math.random() * 255),
        gColor = Math.floor(Math.random() * 255),
        bColor = Math.floor(Math.random() * 255)

    bb8.color({ red: rColor, green: gColor, blue: bColor })
  }, 500)
})
*/
