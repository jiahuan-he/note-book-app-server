const express = require('express')

const app = express();


app.get('/', function (req, res, next) {
    res.send('get')
});

app.post('/', function(req, res, next) {
    res.send('post')
});


app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});
