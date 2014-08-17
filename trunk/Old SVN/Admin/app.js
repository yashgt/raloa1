/**
 * Module dependencies.
 */

var express = require('express');
var admin = require('./admin');

//var Route = require('./Route');
var fs = require('fs');
var http = require('http');
var https = require('https');

var nconf = require('nconf');
nconf.argv().env() ;
nconf.file({ //Search for this file in this directory and use it as my config file
	file: 'config.json',
	dir: '../..',
	search : true
});

var key = fs.readFileSync('./ssl-key.pem');
var cert = fs.readFileSync('./ssl-cert.pem')
var https_options = {
    key: key,
    cert: cert
};
var path = require('path');
var mysql = require('mysql');
var gm = require('googlemaps');
var util = require('util');
	//var a=0;
//DB connection
var db = mysql.createConnection({
    host: nconf.get('database:host'),
    user: nconf.get('database:user'),
    password: nconf.get('database:password'),
    database: nconf.get('database:database'),
    multipleStatements: true
});


var app = express();
var MySQLStore = require('connect-mysql')(express);
var options = { 
        config: {
			host: nconf.get('database:host'),
            user: nconf.get('database:user'), 
            password: nconf.get('database:password'), 
            database: nconf.get('database:database') 
        }
    };
	

var passport = require('passport');
var authentication = require('./authentication');
//  , LocalStrategy = require('passport-local').Strategy;

passport.use(authentication.localStrategy);


gm.config('key', nconf.get('gmap:key'));
//gm.config('stagger-time', 0);

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
	
app.set('port', nconf.get('admin:port'));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));
});

// development only
if ('development' == app.get('env')) {
    app.use(express.errorHandler());
}


passport.serializeUser(authentication.serializeUser);

passport.deserializeUser(authentication.deserializeUser);


app.get('/', authentication.ensureLogin, admin.admin);	//Unless logged in, user should be restricted from using this path

app.post('/login',
  passport.authenticate('local', { successRedirect: '/',
                                   failureRedirect: '/login.html',
                                   failureFlash: false })
);

app.get('/logout', authentication.logout);

app.get('/api/routes'
, authentication.ensureAPIRoles(['FLEETADMIN']) //TODO Add this to all api routes
, function(req, res) {
    console.log('Routes');
	var fleetGroupId = req.user.fleetGroupId ;
	//TODO query the routes that belong to the fleet group only. This should be done for ALL methods.
    db.query("CALL list_routes();", function(err, results) 
			{
			res.json(results[0].map(
				function(show_route) {
					return {
							'routeId': show_route.routeId,
							'from': show_route.start_stop_name,
							'to': show_route.end_stop_name
							};
					}));
			});
	});

//Get the segment of stop[idx] from previous stop
getSegment = function(stops, idx, callback1, callback2){
	console.log("Getting segment %j", idx);
	if(idx==0)
	{
		callback1(0);
		getSegment(stops, idx+1, callback1, callback2);
		return;
	}
var seg = 0; //tempo
		if (seg == 0) {
			 console.log("Querying google for %j %j to %j %j",  stops[idx-1].lat , stops[idx-1].lng, stops[idx].lat , stops[idx].lng);
             gm.directions(stops[idx-1].lat + "," + stops[idx-1].lng, stops[idx].lat + "," + stops[idx].lng,
                    function(err, data) {						
                        var a = parseFloat(data.routes[0].legs[0].distance.text);
						var b = parseInt(data.routes[0].legs[0].duration.text);
						
						db.query("CALL add_segment(?,?,?,?); ", [ stops[idx-1].stopId , stops[idx].stopId , a, b]
						,function(err, results){
						//console.log(err);
						//console.log(results);
						});

						callback1(a);
						if(idx==stops.length-1)
						{
							callback2();
							return;
						}
					//	console.log("Setting timeout");
						setTimeout(function(){
						//	console.log("Now doing for next");
							getSegment(stops, idx+1, callback1,callback2);
						}, 200);
                    }
                ); //gm directions
		}
		else{
			callback1(seg);
			getSegment(stops, idx+1, callback1, callback2);
		}
};


getSegments = function(routeDetail, callback){
	var i = 0;
	var segments = [];
	getSegment(routeDetail.stops
		, 0
		, function(seg){
			segments.push[seg];
		//	console.log("Segments is now %j", segments);
			}
		, function(){
			callback(segments);
		}
	);	
};
app.post('/api/segments', function(req,res) {
	getSegments(req.body.stops, function(segments){
		//segments is the array of segments
		res.json(segments);
	});
});


app.post('/api/routes', function(req, res) {
//console.log("Routedetail= %j",req.body.timings);
	var xyz = req.body.stops.length
    db.query("CALL save_route(?,@id) ; select @id; ", [req.body.routeId], function(err, results) {
        var stops = req.body.stops;
        route_id = results[1][0]["@id"];
		
		if(req.body.routeId==0){
		console.log("Route created with ID : ", route_id, " having ", xyz, "stops");
				getSegments(req.body, function(segments){
				//	console.log("Segments %j", segments);
					});
					var len=stops.length;
				for (var i = 0; i < len; i++) {
						db.query("CALL add_stop_to_route(?,?,?,?,@id) ; select @id; ", [stops[i].stopId, route_id, i + 1, (len-i)], function(err, results) {
						//console.log('Stop added to route : ' + req.body.stops[i].name);
					});
					};//end foreach stop add stop to route
					delete len;
					var route = {
								'routeId': 1,
								'from': 'Source',
								'to': 'Destination'
								};
			};
			var routeDetail = req.body ;
			var trips = Object.keys(routeDetail.timings);
			trips.forEach(function(trip)
			{
			 if(trip <0){
			  (
			   function(newTripId) { /* This is the closure function */
				db.query("CALL add_trip(?,?,?,@id) ; select @id; ", [route_id, routeDetail.timings[newTripId].direction, newTripId], function(err, results) {
				var realTripId = results[1][0]["@id"];
				console.log("New trip created with Trip ID= %j",realTripId);
				  for (var i = 0; i < stops.length; i++) {
					db.query("CALL set_route_stop_trip_time(?,?,?,?); ", [route_id, stops[i].stopId, realTripId, routeDetail.timings[newTripId][stops[i].stopId]], function(err, results) {});
				  };
			  
				});
			   }
			  )(trip); // 'freezing' the -ve trip ID
			  }
			}
			);
        res.json(route);
    });
});

app.get('/api/stops', function(req, res) {
    db.query("CALL list_stops();", function(err, results) {
        res.json(results[0].map(
            function(stop) {
                //console.log("Stop %j " , stop);
                return {
						lat: stop.latitude,
						lng: stop.longitude,
						name: stop.name,
						stopId: stop.stop_id
						};
            }));
    });
});

app.post('/api/stops', function(req, res) {
    console.log("Creating stop named " + req.body.name + " at " + req.body.lat + "," + req.body.lng);
    var id = 0;
    db.query("CALL add_stop(?,?,?,@id) ; select @id; ", [req.body.name, req.body.lat, req.body.lng], function(err, results) {
        //console.log("Results %j " , results[1][0]);
        id = results[1][0]["@id"];
        console.log("Stop created with ID : ", id);
        console.log("Name of the new stop : ", req.body.name);
		});
    res.json({
        id: id
    });
});

app.get('/api/routes/:route_id', function(req, res) {
  //  console.log("Route ID %j", req.params.route_id);
	var routeDetail = {
        'routeId': req.params.route_id,
        'stops': [],
        'timings': {},
        'segments': []
    };
    
    db.query("CALL route_detail(?) ; ", [req.params.route_id], function(err, results) {
    routeDetail.stops = results[0].map(
            function(routestop) {
                    return {
						'stopId': routestop.stop_id,
						'name': routestop.stop_name,
						'lat': routestop.latitude,
						'lng': routestop.longitude,
						'seg' : routestop.time
					};
            });
			
			results[1].forEach(function(tripdir){
			routeDetail.timings[tripdir.trip_id] = {direction : tripdir.direction};
			});
		
			results[2].forEach(function(routestoptime){
			routeDetail.timings[routestoptime.trip_id][routestoptime.stop_id] = routestoptime.time;
			});
	
		res.json(routeDetail);
    });

});

/*
http.createServer(app).listen(app.get('port'), function() {
    console.log('Express server listening on port ' + app.get('port'));
});
*/

server = https.createServer(https_options, app).listen(app.get('port'));
