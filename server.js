var express = require('express');
var app = express();

app.use('/public', express.static(process.cwd() + '/public'));

var port = process.env.PORT || 8080;
app.listen(port, function() {
    console.log('Listening on port ' + port + '...');
});
