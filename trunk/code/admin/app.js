/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var user = require('./routes/user');
var http = require('http');
var path = require('path');
//var mysql = require('mysql');
var db = require('db');
var admin = require('admin');
var logger = require('logger').getLogger();

var app = express();

var nconf = require('nconf');
nconf.argv().env() ;
nconf.file({ //Search for this file in this directory and use it as my config file
	file: 'config.json',
	dir: '..',
	search : true
});
var dbConfig = {
    host: nconf.get('database:host'),
    user: nconf.get('database:user'),
    password: nconf.get('database:password'),
    database: nconf.get('database:database'),
    multipleStatements: true
};
/*
var db = mysql.createConnection({
    host: nconf.get('database:host'),
    user: nconf.get('database:user'),
    password: nconf.get('database:password'),
    database: nconf.get('database:database'),
    multipleStatements: true
});
*/
db.createPool(dbConfig);
var dbConn;
db.connect( function(conn){
	dbConn = conn;
	});

var MySQLStore = require('connect-mysql')(express);
var options = { 
        config: dbConfig
};
var passport = require('passport');
var authentication = require('authentication');	
passport.use(authentication.localStrategy);	

// all environments
app.configure(function() {
app.use(express.cookieParser());
app.use(express.bodyParser());
app.use(express.session({ 
	secret: 'supersecretkeygoeshere'
	, store: new MySQLStore(options)
	}
	));
 app.use(passport.initialize());
  app.use(passport.session());
  
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));
}); //configure ends

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

//app.get('/', routes.index);
//app.get('/users', user.list);

http.createServer(app).listen(app.get('port'), function(){
	logger.info('Express server listening on port ' + app.get('port'));
  //console.log('Express server listening on port ' + app.get('port'));
});

app.get('/api/fleets', function(req, res) {
	var user_id = req.session.passport.user.userId;
	dbConn.query("call list_user_fleets(?);", [user_id], function(err, results) {
		if(err==undefined){
		res.json(results[0].map(
            function(fleet) {
                return {
						fleet_id: fleet.fleet_id,
						fleet_name: fleet.fleet_name,
						level: fleet.level
						};
			}));
		}
		else {
			console.log("Error %j", err);
		}
			
	});
});

app.post('/api/stop', function(req, res) {
	var stopDetail = req.body ;
	stopDetail.fleetId = req.session.passport.user.rootFleetId ;
	console.log("Saving stop %j", stopDetail );
	dbConn.query("set @id := ? ; call save_stop(@id,?,?,?,?) ; select @id; ", [stopDetail.id, stopDetail.stopName, stopDetail.latitude, stopDetail.longitude, stopDetail.fleetId], function(err, results) {
		if(err==undefined){
        console.log("Results %j " , results);
        var id = results[2][0]["@id"];
        console.log("Stop created with ID : %j", id);
        logger.info("Name of the stop : ", stopDetail.stopName);
		res.json({id: id});
		}
		else{
			console.log("Error %j", err);
		}
    });


	
});
app.post('/api/currentFleet', function(req, res) {
	var fleet = req.body;
	req.session.passport.user.fleetId = fleet.fleetId;
	res.json({});
});

app.get('/api/fleet/:fleet_id', function(req,res){
	var fleetId = req.params.fleet_id ;
	dbConn.query("call get_fleet_detail(?);", [fleetId], function(err, results){
		if(err==undefined){
			console.log("Results %j " , results);
			var fleetDetail = {
		center : {latitude:results[0][0].cen_lat, longitude:results[0][0].cen_lon} ,
		zoom : results[0][0].zoom,
		bounds : {northeast:{latitude:results[0][0].ne_lat, longitude:results[0][0].ne_lon} , southwest:{latitude:results[0][0].sw_lat, longitude:results[0][0].sw_lon}},
		stops : results[1].map(function(stop){ return {id:stop.stop_id, latitude:stop.latitude, longitude:stop.longitude, name:stop.name}; }),
		routes : []//TODO
		};
		res.json(fleetDetail);
		}
		else{
			console.log("Error %j", err);
		}
	});
});
app.get('/api/fleets/:fleetgroup_id', function(req, res) {
    dbConn.query("CALL list_fleets();", function(err, results) {
        res.json(results[0].map(
            function(fleet) {
                return {
						id: fleet.id,
						name: fleet.name
						};
            }));
    });
});

//AUTH REGION
passport.serializeUser(authentication.serializeUser);
passport.deserializeUser(authentication.deserializeUser);


app.get('/', authentication.ensureLogin, function(req, res){
	console.log("%j", req.session);
    res.render('index', { user: req.session.passport.user });  
  
});	//Unless logged in, user should be restricted from using this path

app.post('/login',
  passport.authenticate('local', { successRedirect: '/',
                                   failureRedirect: '/login.html',
                                   failureFlash: false })
);
app.get('/logout', authentication.logout);
//AUTH REGION ends

app.post('/api/segments', function(req,res) {

});

app.post('/api/routes', function(req, res) {

});

app.get('/api/routes', function(req, res) {

});

app.post('/api/stops'
, authentication.ensureAPIRoles(['FLEETADMIN']) //TODO Add this to all api routes
, function(req, res) {
	admin.saveStops([]);
});

app.get('/api/stops', function(req, res) {

});

app.get('/api/routes/:route_id', function(req, res) {

});