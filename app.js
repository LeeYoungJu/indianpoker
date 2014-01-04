
/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var user = require('./routes/user');
var http = require('http');
var path = require('path');
var socketio = require('socket.io');

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(express.cookieParser());
app.use(express.session({secret: 'secret key'}));
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/', routes.index);
app.post('/enter', routes.enter);
app.get('/enter', routes.enter_get);
app.post('/makeRoom', routes.makeRoom);
app.get('/join/:title/:id/:isMaster', routes.join);
app.get('/play', routes.game_room);
app.post('/play', routes.game_room);
app.get('/register_form', routes.register_form);
app.post('/register', routes.register);
app.get('/register', routes.index);
app.get('/logout', routes.logout);

app.get('/users', user.list);


var server = http.createServer(app);

require('./poker_server')(server);

server.listen(app.get('port'), function() {
	console.log("express server listening on port " + app.get('port'));
});
