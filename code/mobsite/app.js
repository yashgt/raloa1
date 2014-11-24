
/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var stops = require('./stops');
var http = require('http');
var url = require("url");
var gm = require('googlemaps');
var path = require('path');
//var mysql = require('mysql');
var db = require('db');
/*var db = mysql.createConnection({ 
host: 'localhost',
user: 'root',
password: 'goatrans',
database: 'goatrans'
	,multipleStatements: true
});
*/

var app = express();

var nconf = require('nconf');
nconf.argv().env();
nconf.file({ //Search for this file in this directory and use it as my config file
    file: 'config.json',
    dir: '..',
    search: true
});
//connection details
var dbConfig = {
    host: nconf.get('database:host'),
    user: nconf.get('database:user'),
    password: nconf.get('database:password'),
    database: nconf.get('database:database'),
    multipleStatements: true
};
// connection string
db.createPool(dbConfig);
var dbConn;
db.connect(function(conn) {
    dbConn = conn;
});

var MySQLStore = require('connect-mysql')(express);
var options = {
    config: dbConfig
};

// all environments
app.set('port', process.env.PORT || 8000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(express.cookieParser());
app.use(express.cookieSession({secret: 'secret'}));
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));//configure ends

var adsenseconfig = {
  client: 'ca-pub-4874055255011136',
  slotname: '<slotname-id>'
};


// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}
http.createServer(app).listen(app.get('port'), function() {
    logger.info('Express server listening on port {0}', app.get('port'));
    //console.log('Express server listening on port ' + app.get('port'));
});

app.get('/ad', function(req, res) {

  adsense.getAd(config, req, function(ad) {
    if (!ad) {
      console.log('Error');
      res.send('Error');
    }
    console.log('Ad:', ad);    
    res.send(ad);
  });
});

app.get('/trips', function(req, res){
	console.log('Trips');
	res.json([
	  {'id': 1, 'name' : 'Test1'}
	  ]);
	});
/*
app.get('/', stops.index);
app.get('/', routes.index);
app.get('/', function (req, res) {
    console.log("default");
    res.send("ok");
});
*/


//Return the list of stops starting with "term" in their name.
app.get('/api/stops', function(req, res){
	var term = req.query.term ;
	console.log("Searching for stops starting with %j", term);
	//TODO Do this using DB query
	db.query("CALL list_astops(?);", [term],function(err, results){
		//console.log("Results %j " , results);
		console.log("Stops");
		//var stops = [ {latitude:19.099953,  longitude:72.844224, name:'Borivili', stop_id:1}, {latitude:15, longitude:71, name:'Margao', stop_id:2}, {latitude:15, longitude:71, name:'Ponda', stop_id:3}, {latitude:15, longitude:71, name:'Fatorda', stop_id:4}, {latitude:19.055617,  longitude:72.83284219, name:'Bandra', stop_id:1}  ] ;
		res.json(results[0].map(
				function(stop){
					console.log("Stop %j " , stop);
					return {lat: stop.latitude, lng: stop.longitude, name: stop.name , stopId: stop.stop_id} ;
		}));
	});
});
	
	
		function onRequest(request, response) {
		var pathname = url.parse(request.url).pathname;
console.log("Request for " + pathname + " received.");
//console.log("Request received.");
response.writeHead(200, {"Content-Type": "text/plain"});
//response.write("Hello World");
response.end();
}
	

//var server = http.createServer(app);
//var io = require('socket.io').listen(server);
//server.listen(app.get('port'));



