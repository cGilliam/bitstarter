var express = require('express');
var app = express.createServer(express.logger());

app.get('/', function(request, response) {
    var fs = require('fs');
    var mystring = fs.readFileSync('index.html');
    var buf = new Buffer(mystring);  // second argument not needed because defaults to 'utf8'
    response.send(buf.toString()); // no arguments needed because default is (utf8, 0, buffer.length)
});

var port = process.env.PORT || 8080;
app.listen(port, function() {
  console.log("Listening on " + port);
});
