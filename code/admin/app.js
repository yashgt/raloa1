/**
 * Module dependencies.
 */
//require('newrelic');
var express = require('express');
var routes = require('./routes');
var user = require('./routes/user');
var http = require('http');
var https = require('https');
var path = require('path');
//var mysql = require('mysql');
var db = require('db');
var admin = require('admin');
var logger = require('logger').getLogger();
var async = require('async');
var _ = require('underscore');
var gm = require('googlemaps');
var fs = require('fs');
var morgan = require('morgan');
require("date-format-lite");
morgan.token('local-datetm', function(req, res){
	return (new Date()).format('YYYYMMDD hh:mm:ss.SS');
	})


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
        store: new MySQLStore(options),
		//cookie: {maxAge: 1000}
    }));
    app.use(passport.initialize());
    app.use(passport.session());

    app.set('port', process.env.PORT || nconf.get('admin:port') || 3000);
	app.set('sslport', process.env.PORT || nconf.get('admin:sslport') || 4000);
    app.set('views', path.join(__dirname, 'public'));
    app.set('view engine', 'ejs');
    app.use(express.favicon());
    //app.use(express.logger('dev'));
    //app.use(express.logger({format : ':remote-addr :date :method :url :referrer :user-agent :status :response-time'}));
	app.use(morgan(':remote-addr :local-datetm :method :url :referrer :status :response-time :res[content-length]'));
    app.use(express.json());
    app.use(express.urlencoded());
    app.use(express.methodOverride());
    app.use(app.router);
	app.use(express.compress());
	
	var oneDay = 86400000;
	var staticOptions = {
		maxAge: oneDay
	};

    app.use(express.static(path.join(__dirname, 'public'), staticOptions));
}); //configure ends

// development only
if ('development' == app.get('env')) {
    app.use(express.errorHandler());
}

//app.get('/', routes.index);
//app.get('/users', user.list);
var sslOptions = {
  key: fs.readFileSync('ssl-key.pem'),
  cert: fs.readFileSync('ssl-cert.pem'),
  
  requestCert: true,
  rejectUnauthorized: false
};


var server = http.createServer(app).listen(app.get('port'), function() {
    logger.info('Express server listening on port {0}', app.get('port'));
    //console.log('Express server listening on port ' + app.get('port'));
});


var server = https.createServer(sslOptions,app).listen(app.get('sslport'), function() {
    logger.info('Express server listening for https on port {0}', app.get('sslport'));
    //console.log('Express server listening on port ' + app.get('port'));
});

console.log('Server address %j', server.address());

/*
setInterval(function() {
    admin.generateSegments();
}, 60000);
*/
app.get('/api/fleets', function(req, res) {
    var user_id = req.session.passport.user.userId;
    db.query("call list_user_fleets(?);", [user_id], function(results) {
        res.json(results[0].map(
            function(fleet) {
                return {
                    fleetId: fleet.fleet_id,
                    fleetName: fleet.fleet_name,
                    level: fleet.level
                };
            }));
    });
});

app.post('/api/stop', function(req, res) {
    var stopDetail = req.body;
	var user_id = req.session.passport.user.userId;
    stopDetail.fleetId = req.session.passport.user.rootFleetId;
    logger.info("Saving stop {0}", stopDetail);
    db.query("set @id := ? ; call save_stop(@id,?,?,?,?,?,?) ; select @id; ", [stopDetail.id, stopDetail.name, stopDetail.latitude, stopDetail.longitude, stopDetail.fleetId, stopDetail.peerStopId, user_id], function(results) {
        var id = results[2][0]["@id"];
        logger.info("Stop {0} created with ID {1}", stopDetail.name, id);
        res.json({
            id: id
        });
    }, function(error) {
        res.send(500, 'Failed to create stop: ' + error);
    });
});

app.delete('/api/stop/:id', function(req, res) {
	var stop_id = req.params.id ;
	var user_id = req.session.passport.user.userId;
	db.query("set @id := ? ; call delete_stop(@id,?) ; select @id; ", [stop_id, user_id], function(results) {
        logger.info("Stop {0} deleted", stop_id);
        res.json({
            id: id
        });
    }, function(error) {
        res.send(500, 'Failed to delete stop: ' + error);
    });
});

app.post('/api/currentFleet', function(req, res) {
    var fleet = req.body;
    logger.debug("Current fleet is {0}", fleet.fleetId);
    req.session.passport.user.fleetId = fleet.fleetId;
    res.json(fleet);
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
    var fleetId = parseInt(req.params.fleet_id);
    db.query("call get_fleet_detail(?);", [fleetId], function(results) {
        var fleetDetail = {
            fleetId: fleetId,
            defaultServiceId: 1,
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
			trip_cnt: results[0][0].trip_cnt,
            allstops: results[1].map(function(stop) {
                return {
                    id: stop.stop_id,
                    latitude: stop.latitude,
                    longitude: stop.longitude,
                    name: stop.name,
                    peerStopId: stop.peer_stop_id
                };
            }),
            
            routes: results[2].map(function(route) {
                return {
                    routeId: route.route_id,
                    routeNum: route.route_name,
                    st: route.start_stop_name,
                    en: route.end_stop_name,
					serviced: route.serviced

                };
            }),
						
			calendars: results[3].map(function(calendar) {
			return {
                serviceId: calendar.calendar_id,
                serviceName: calendar.calendar_name,
                mon: calendar.mon,
                tue: calendar.tue,
                wed: calendar.wed,
                thu: calendar.thu,
                fri: calendar.fri,
                sat: calendar.sat,
                sun: calendar.sun,
                startDate: calendar.start_date,
                endDate: calendar.end_date
				};
            }),
           
        };
        res.json(fleetDetail);
    });

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
app.post('/api/route/', function(req, res) {
    var route = req.body;

    logger.info("Saving route {0}", route);
    route.fleetId = req.session.passport.user.rootFleetId; // Routes and stops belong to Root fleet
	var currentFleetId = req.session.passport.user.fleetId; // The trip belongs to the currently chosen fleet

    route.startStopId = route.stages[0].stops[0].onwardStop.id;
	var start_stop_name = route.stages[0].stops[0].onwardStop.name;
    var stageLength = route.stages.length - 1
    var stopLength = route.stages[stageLength].stops.length - 1
    route.endStopId = route.stages[stageLength].stops[stopLength].onwardStop.id;
	var end_stop_name = route.stages[stageLength].stops[stopLength].onwardStop.name;

    var stop_sequence = 1;
    route.stages.forEach(function(stage) {
        stage.stops.forEach(function(stop) {
            stop.sequence = stop_sequence++;
        });
    });

    db.getTransaction(

        //(function(route) {
        //return 
        function(tran) {
            var routesWF = [

                function(callback) {
                    saveRouteEntity(tran, route, function(routeId) {
                        route.routeId = routeId;
                        route.stages.forEach(function(stage) {
                            stage.routeId = routeId;
                        });
                        callback(null, tran, route);
                    }
					, function(){callback("Unable to save route", null); }
					);
                },

                function(tran, route, callback) {
                    console.log("Saving stages for route %j", route);

                    var stageSeries = [];
                    route.stages.forEach(function(stage) {
                        stageSeries.push(
                            function(callback) {
                                var stageWF = [
                                    function(callback) {
                                        saveStageEntity(tran, stage, function(stageId) {
                                            stage.stageId = stageId;
                                            stage.stops.forEach(function(stop) { //This is a routestop
                                                stop.stageId = stageId;
                                                stop.routeId = stage.routeId;
                                            });
                                            callback(null, stageId);
                                        }
										, function(){callback("Unable to save stage", null); }
										);
                                    },
                                    function(stageId, callback) {
                                        var stopSeries = [];
                                        stage.stops.forEach(function(stop) {
                                            stopSeries.push(
                                                function(callback) {
                                                    saveRouteStopEntity(tran, stop, function() {
                                                        callback(null, 1);
                                                    }
													, function(){callback("Unable to save route-stop", null); }
													);
                                                }
                                            );
                                        });

                                        async.series(stopSeries, function(err, results) {
                                            callback(err || null, stage);
                                        });
                                    }
                                ];
                                async.waterfall(stageWF, function(err, result) {
                                    callback(err || null, stage);
                                });

                            }
                        );
                    });

                    async.series(stageSeries, function(err, results) {
                        callback(err || null, tran, route);
                    });
                },
                function(tran, route, callback) {
                    console.log("Saving trips for route %j", route);

                    var tripSeries = [];
					
                    route.trips.forEach(function(tripList) {
                        tripList.forEach(function(trip) {
							if(trip.tripId<0 || trip.isDirty){
								trip.routeId = route.routeId;
								if(trip.tripId<0)
									trip.fleetId = currentFleetId; //Set the fleet only for new trips
								tripSeries.push(function(callback) {
									var tripWF = [
										function(callback) {
											saveTripEntity(tran, trip, function(tripId) {
												trip.tripId = tripId;                                            
												callback(null, trip);
											}
											, function(){callback("Unable to save trip", null); }
											);
										},
										function(trip, callback) { //Save RSTs
											var RSTSeries = [];
											Object.keys(trip.stops).forEach(function(stopId) {
												RSTSeries.push(function(callback) {
													var RST = {
														routeId: route.routeId,
														stopId: parseInt(stopId),
														tripId: trip.tripId,
														time: '' + trip.stops['' + stopId + ''] + ''
													};
													saveRouteStopTripEntity(tran, RST, function() {
														callback(null, 1);
													}
													, function(){callback("Unable to save route-stop-trip", null); }
													);
												});
											});
											async.series(RSTSeries, function(err, results) {
												callback(err || null, trip);
											});
										}
									];

									async.waterfall(tripWF, function(err, result) {
										callback(err || null, trip);
									});
								});
							}
                        });
                    });

                    async.series(tripSeries, function(err, results) {
                        callback(err || null, route);
                    });
                }
            ];
            async.waterfall(routesWF, function(err, result) {
				if(!err){
                tran.commit(function() {                    
					admin.generateSegments(
						route.routeId, 
					/*(function(route){
					 * 						return */
						function(){

							admin.getRouteDetail(route_id, function(routeDetail){
								routeDetail.st = start_stop_name;
								routeDetail.en = end_stop_name;

        						res.json(routeDetail);
							});	
							/*
							route.routeNum = "";
							route.st = route.stages[0].stops[0].onwardStop.name;
							route.en = route.stages[stageLength].stops[stopLength].onwardStop.name;
							res.json(route);
							*/
						}
																				
					/*})(route)*/
					);

                }, function() {
                    res.send(500, 'Failed to create route');
                });
				}
				else{
					tran.rollback();
					res.send(500, 'Failed to create route');
				}

            });
        }
        //;		
        //})(route);

    );

});


//CBM TO ADD STORED PROCS

saveRouteEntity = function(tran, route, cb, fcb) {
    tran.query("set @id := ? ; call save_route(@id,?,?,?,?,?) ; select @id; ", [route.routeId, route.fleetId, 'ABC', route.startStopId, route.endStopId, 0], function(results) {
        //console.log(results);
        route_id = results[2][0]["@id"];
        logger.debug('Saved route record. ID is {0}', route_id);
        cb(route_id);
    }
	,function(err){	logger.error("Failed due to {0}", err); fcb();	}
	);
};

saveStageEntity = function(tran, stage, cb, fcb) {
    tran.query("set @id := ? ; call save_stage(@id,?,?) ; select @id; ", [stage.stageId, stage.routeId, stage.title], function(results) {
        stage_id = results[2][0]["@id"];
        logger.debug('Saved stage record {0}', stage_id);
        cb(stage_id);
    }
	,function(err){	logger.error("Failed due to {0}", err); fcb();	}
	);
};

saveRouteStopEntity = function(tran, routeStop, cb, fcb) {
    tran.query("CALL save_route_stop(?,?,?,?,?);", [routeStop.onwardStop.id, routeStop.returnStop.id, routeStop.routeId, routeStop.stageId, routeStop.sequence], function(results) {
        logger.debug('Saved route_stop record');
        cb();
    }
	,function(err){	logger.error("Failed due to {0}", err); fcb();	}
	);
};

saveTripEntity = function(tran, trip, cb, fcb) {
    tran.query("set @id := ? ; call save_trip(@id,?,?,?,?,?,?,?,?) ; select @id; ", [trip.tripId, trip.serviceId, trip.direction, trip.routeId,  trip.fleetId, trip.frequencyTrip, trip.frequencyStartTime, trip.frequencyEndTime, trip.frequencyGap], function(results) {
        var trip_id = results[2][0]["@id"];
        logger.debug('Saved trip record {0}', trip);
        cb(trip_id);
    }
	,function(err){	logger.error("Failed due to {0}", err); fcb();	}
	);

};

saveRouteStopTripEntity = function(tran, routestoptrip, cb, fcb) {
    tran.query("CALL save_route_stop_trip(?,?,?,?); ", [routestoptrip.routeId, routestoptrip.stopId, routestoptrip.tripId, routestoptrip.time], function(results) {
        logger.debug('Saved RStrip record {0}', routestoptrip);
        cb(1); //ignore the RSTId
    }
	,function(err){	logger.error("Failed due to {0}", err); fcb();	}
	);

};

/*
app.get('/api/route/:route_id', function(req, res) {
    var route_id = parseInt(req.params.route_id);
    db.query("call get_route_detail(?);", [route_id], function(results) {
        var routeDetail = {
            routeId: route_id,
            stages: [],
            trips: [
                [],
                []
            ]
        };

        results[0].forEach(
            function(routeStop) {
                //Find the stage
                //console.log("Route stop %j", routeStop);
                var stage = _.find(routeDetail.stages, function(stage) {
                    return stage.stageId == routeStop.stage_id;
                });
                if (stage == undefined) {
                    //If not exists, add the stage
                    stage = {
                        title: routeStop.stage_name,
                        stageId: routeStop.stage_id,
                        stops: []
                    };
                    routeDetail.stages.push(stage);
                }

                var rs = {
                    onwardStop: {
                        id: routeStop.onward_stop_id,
                        distance: routeStop.onward_distance
                    },
                    returnStop: {
                        id: routeStop.return_stop_id,
                        distance: routeStop.return_distance
                    }
                };
                stage.stops.push(rs);

            });
			
		results[1].forEach(
			function(trip){
				var routeTrip = {
					tripId: trip.trip_id
					,fleetId: trip.fleet_id
					,serviceId: trip.service_id
					,direction: trip.direction
					,frequencyTrip: trip.frequency_trip
					,frequencyStartTime: trip.frequency_start_time
					,frequencyEndTime: trip.frequency_end_time
					,frequencyGap: trip.frequency_gap
					,stops: {}
				};
				
				routeDetail.trips[trip.direction].push(routeTrip);
			}
		);
		results[2].forEach(
			function(rst){
				rst.tripId = rst.trip_id;
				//Check if this is onward trip
				var idx = _.sortedIndex(routeDetail.trips[0], rst,'tripId');
				var trip = routeDetail.trips[0][idx];
				if(trip && trip.tripId == rst.trip_id){//If the trip really exists in the list
					trip.stops[''+rst.stop_id+''] = rst.time;					
				}
				else{ //Check in return trips
					idx = _.sortedIndex(routeDetail.trips[1], rst,'tripId');
					trip = routeDetail.trips[1][idx];
					if(trip && trip.tripId == rst.trip_id){//If the trip really exists in the list
						trip.stops[''+rst.stop_id+''] = rst.time;					
					}
				}
			}
		);

        res.json(routeDetail);
    });


});
*/

app.get('/api/route/:route_id', function(req, res) {
    var route_id = parseInt(req.params.route_id);
	admin.getRouteDetail(route_id, function(routeDetail){
        res.json(routeDetail);
	});	

});


//AUTH REGION
passport.serializeUser(authentication.serializeUser);
passport.deserializeUser(authentication.deserializeUser);


app.get('/', authentication.ensureLogin, function(req, res) {
    logger.info("Session is {0}", req.session);
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


app.post('/api/stops', authentication.ensureAPIRoles(['FLEETADMIN']) //TODO Add this to all api routes
    , function(req, res) {
        admin.saveStops([]);
    });

app.get('/api/kml/:fleet_id', function(req, res) {
    var fleetId = req.params.fleet_id;
    var host = req.headers.host;
    admin.generate_kml(fleetId, host, function(content) {
        //application/vnd.google-earth.kml+xml
        res.writeHead(200, {
            'Content-type': 'application/vnd.google-earth.kml+xml'
        });
        res.write(content);
        res.end();
    });
});
