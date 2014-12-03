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
var async = require('async');
var _ = require('underscore');


var app = express();

var nconf = require('nconf');
nconf.argv().env();
nconf.file({ //Search for this file in this directory and use it as my config file
    file: 'config.json',
    dir: '..',
    search: true
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
db.connect(function(conn) {
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
        secret: 'supersecretkeygoeshere',
        store: new MySQLStore(options)
    }));
    app.use(passport.initialize());
    app.use(passport.session());

    app.set('port', process.env.PORT || 3000);
    app.set('views', path.join(__dirname, 'public'));
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

http.createServer(app).listen(app.get('port'), function() {
    logger.info('Express server listening on port {0}', app.get('port'));
    //console.log('Express server listening on port ' + app.get('port'));
});

app.get('/api/fleets', function(req, res) {
    var user_id = req.session.passport.user.userId;
    db.query("call list_user_fleets(?);", [user_id], function(results) {
        res.json(results[0].map(
            function(fleet) {
                return {
                    fleet_id: fleet.fleet_id,
                    fleet_name: fleet.fleet_name,
                    level: fleet.level
                };
            }));
    });
});

app.post('/api/stop', function(req, res) {
    var stopDetail = req.body;
    stopDetail.fleetId = req.session.passport.user.rootFleetId;
    logger.debug("Saving stop {0}", stopDetail);
    db.query("set @id := ? ; call save_stop(@id,?,?,?,?) ; select @id; ", [stopDetail.id, stopDetail.name, stopDetail.latitude, stopDetail.longitude, stopDetail.fleetId], function(results) {
        var id = results[2][0]["@id"];
        console.log("Stop created with ID : %j", id);
        logger.info("Name of the stop : ", stopDetail.name);
        res.json({
            id: id
        });
    });
});

app.post('/api/currentFleet', function(req, res) {
    var fleet = req.body;
    req.session.passport.user.fleetId = fleet.fleetId;
    res.json({});
});

app.post('/api/calendar', function(req, res) {
    var calendar = req.body;
    logger.debug("Saving calendar: ", calendar);
    //db.query

    res.json({
        calendarId: 1
    });
});

app.get('/api/fleet/:fleet_id', function(req, res) {
    var fleetId = req.params.fleet_id;
    db.query("call get_fleet_detail(?);", [fleetId], function(results) {
        var fleetDetail = {
            center: {
                latitude: results[0][0].cen_lat,
                longitude: results[0][0].cen_lon
            },
            zoom: results[0][0].zoom,
            bounds: {
                northeast: {
                    latitude: results[0][0].ne_lat,
                    longitude: results[0][0].ne_lon
                },
                southwest: {
                    latitude: results[0][0].sw_lat,
                    longitude: results[0][0].sw_lon
                }
            },
            stops: results[1].map(function(stop) {
                return {
                    id: stop.stop_id,
                    latitude: stop.latitude,
                    longitude: stop.longitude,
                    name: stop.name
                };
            }),
            calendars: [{ //TODO
				serviceId: 1,
                serviceName: 'All days',
                mon: true,
                tue: true,
                wed: true,
                thu: true,
                fri: true,
                sat: true,
                sun: true,
                startDate: '2014-10-1',
                endDate: '2100-10-1'
            }],
            routes: [
				{
					routeId: 1
					, routeNum : 100
					, st : 'Panaji'
					, en : 'Mapusa'					
				}
				,{
					routeId: 2
					, routeNum : 101
					, st : 'Panaji'
					, en : 'Margao'					
				}
				,{
					routeId: 3
					, routeNum : 102
					, st : 'Panaji'
					, en : 'Ponda'					
				}
			] //TODO
        };
        res.json(fleetDetail);
    });
    /*
    dbConn.query("call get_fleet_detail(?);", [fleetId], function(err, results) {
        if (err == undefined) {
            console.log("Results %j ", results);
            var fleetDetail = {
                center: {
                    latitude: results[0][0].cen_lat,
                    longitude: results[0][0].cen_lon
                },
                zoom: results[0][0].zoom,
                bounds: {
                    northeast: {
                        latitude: results[0][0].ne_lat,
                        longitude: results[0][0].ne_lon
                    },
                    southwest: {
                        latitude: results[0][0].sw_lat,
                        longitude: results[0][0].sw_lon
                    }
                },
                stops: results[1].map(function(stop) {
                    return {
                        id: stop.stop_id,
                        latitude: stop.latitude,
                        longitude: stop.longitude,
                        name: stop.name
                    };
                }),
                routes: [] //TODO
            };
            res.json(fleetDetail);
        } else {
            console.log("Error %j", err);
        }
    });
	*/
});
app.get('/api/fleets/:fleetgroup_id', function(req, res) {
    db.query("call list_fleets();", function(results) {
        res.json(results[0].map(
            function(fleet) {
                return {
                    id: fleet.id,
                    name: fleet.name
                };
            }));
    });
});


//Gives out the object to be added to routelist
app.post('/api/route/', function(req, res){
	var route = req.body;
	
	db.getTransaction( 
		//(function(route) {
			//return 
			function(tran){
				var routesWF = [
					function(callback){
						saveRouteEntity(tran, route, function(routeId){
							route.routeId = routeId; 
							route.stages.forEach(function(stage){ stage.routeId = routeId; });
							callback(null, tran, route);
						});
					}
					, function(	tran, route, callback){
						console.log("Saving stages for route %j", route);
						
						var stageSeries = [];
						route.stages.forEach( function(stage){
							stageSeries.push(
								function(callback){
									var stageWF = [
										function(callback){
											saveStageEntity(tran, stage, function(stageId){
												stage.stageId = stageId ;
												stage.stops.forEach(function(stop){ stop.stageId = stageId;});
												callback(null, stageId);
											});
										}
										,
										function(stageId, callback){
											var stopSeries = [] ;
											stage.stops.forEach(function(stop){
												stopSeries.push(
													function(callback){
														saveStopEntity(tran, stop, function(stopId){
															callback(null, stopId);
														});													
													}
												);
											});
											
											async.series(stopSeries, function(err, results){
												callback(null, stage);
											});
										}
									];	
									async.waterfall(stageWF, function(err, result){
										callback(null, stage);
									});								
									
								}
							);							
						});
						
						async.series(stageSeries, function(err,results){
							callback(null, route);
						});
					}
				];	
				async.waterfall(routesWF, function(err, result){
					tran.commit(function(){
						console.log("Sending data");
						res.json({routeId: route.routeId, st: 'Panaji', en: 'Mapusa', routeNum: 101 });
					}
					,function(){
						res.send(500, 'Failed to create route');
					});
					
				});
			} 
			//;		
		//})(route);
	
		);
	
});


//CBM TO ADD STORED PROCS

saveRouteEntity = function(tran, route, cb){
	setTimeout( function(){
			var routeId = 5;
			console.log("Route %j", route);
			logger.debug('Saved route record. ID is {0}', routeId);
			cb(routeId);
		}
	, 1000);
};
saveStageEntity = function(tran, stage, cb){
	setTimeout( function(){
			var stageId = 1;
			logger.debug('Saved stage record {0}', stage);
			cb(stageId);
		}
	, 1000);
};
saveStopEntity = function(tran, stop, cb){
	setTimeout( function(){
			var stopId = 100;
			logger.debug('Saved stop record. ID is {0}', stopId);
			cb(stopId);
		}
	, 1000);
};

app.get('/api/route/:route_id', function(req, res) {
    //TODO get from DB
    res.json({
        routeId: 1,        
		stages: [
			{ title: 'Stage1', direction:0, stops: [{id: 1}, {id: 2}] }
			,{ title: 'Stage2', direction:0, stops: [{id: 3}, {id: 4}] }
		]
		
        ,timings: [{
            tripId: 1,
            direction: 0,
			serviceId: 1,
            frequency_trip: true,
            frequency_start_time: '09:00',
            frequency_end_time: '10:00',
            '1': '09:00',
            '2': '09:10',
            '3': '09:20',
			'4': '09:25',
        }, {
            tripId: 2,
            direction: 0,
			serviceId: 1,
            frequency_trip: true,
            frequency_start_time: '09:00',
            frequency_end_time: '10:00',
            '1': '09:00',
            '2': '09:10',
            '3': '09:20',
			'4': '09:25'
        }]
    });
});

//AUTH REGION
passport.serializeUser(authentication.serializeUser);
passport.deserializeUser(authentication.deserializeUser);


app.get('/', authentication.ensureLogin, function(req, res) {
    console.log("%j", req.session);
    res.render('index', {
        user: req.session.passport.user
    });

}); //Unless logged in, user should be restricted from using this path

app.post('/login',
    passport.authenticate('local', {
        successRedirect: '/',
        failureRedirect: '/login.html',
        failureFlash: false
    })
);
app.get('/logout', authentication.logout);
//AUTH REGION ends

app.post('/api/segments', function(req, res) {

});

app.get('/api/routes', function(req, res) {
	//TODO get from DB
	res.json([
		{ routeId: 1, fromStop: 'Panaji', toStop: 'Mapusa', routeNo: 101 }
		, { routeId: 2, fromStop: 'Panaji', toStop: 'Margao', routeNo: 102 }
	]);
});

app.post('/api/stops', authentication.ensureAPIRoles(['FLEETADMIN']) //TODO Add this to all api routes
    , function(req, res) {
        admin.saveStops([]);
    });

app.get('/api/stops', function(req, res) {

});

