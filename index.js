var sphero = require("sphero"),
    bb8 = sphero("45be286daaaf440183c458cc45526660")

bb8.connect(function() {
  setInterval(function() {
    var rColor = Math.floor(Math.random() * 255),
        gColor = Math.floor(Math.random() * 255),
        bColor = Math.floor(Math.random() * 255)

    console.log( rColor, gColor, bColor)
    bb8.color({ red: rColor, green: gColor, blue: bColor })
  }, 500)
})
