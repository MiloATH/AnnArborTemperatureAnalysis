var express = require('express');
var path = require('path');
var app = express();

app.use('/public', express.static(process.cwd() + '/public'));

app.get('/', function(req, res){
  var file = path.join(__dirname, 'public/index.html');
  res.sendFile(file, function(err) {
    if (err) {
      console.log(err);
      res.status(err.status).end();
    }
  });
})

var port = process.env.PORT || 8080;
app.listen(port, function() {
  console.log('Listening on port ' + port + '...');
});
