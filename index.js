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
  if ( char === 'a' ) {
    console.log('roll left')
    bb8.roll(100, 270)
  }
  if ( char === 'd' ) {
    console.log('roll right')
    bb8.roll(100, 90)
  }
  if ( char === 'w' ) {
    console.log('roll up')
    bb8.roll(100, 0)
  }
  if ( char === 's' ) {
    console.log('roll down')
    bb8.roll(100, 180)
  }
  if ( char === 'e' ) {
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
