"use strict";

/**
 * Module dependencies.
 */
var http = require('http'),
    path = require('path'),
    express = require('express'),
    app = express();

var options = {
  host: 'localhost',
  port: 2323
};

//check if server is already running
http.get(options, function(res) {
  console.log('server is running, redirecting to localhost');
  if (window.location.href.indexOf('localhost') < 0) {
    window.location = 'http://localhost:' + app.get('port');
  }
}).on('error', function(e) {
  //server is not yet running
  // all environments
  app.set('port', options.port);
  app.use(express.static(path.join(process.cwd(), 'public')));

  app.get('/', function(req,res){
    res.sendFile('/index.html');
  });

  http.createServer(app).listen(app.get('port'), function(err){
    console.log('server created');
    if (window.location.href.indexOf('localhost') < 0) {
      window.location = 'http://localhost:' + app.get('port');
    }
  });
});
var server = app.listen(3000);
