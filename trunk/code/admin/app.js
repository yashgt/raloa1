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
var gm = require('googlemaps');


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

var server = http.createServer(app).listen(app.get('port'), function() {
    logger.info('Express server listening on port {0}', app.get('port'));
    //console.log('Express server listening on port ' + app.get('port'));
});

console.log('Server address %j', server.address());

setInterval(function() {
    admin.generateSegments();
}, 10000);

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
    stopDetail.fleetId = req.session.passport.user.rootFleetId;
    logger.info("Saving stop {0}", stopDetail);
    db.query("set @id := ? ; call save_stop(@id,?,?,?,?,?) ; select @id; ", [stopDetail.id, stopDetail.name, stopDetail.latitude, stopDetail.longitude, stopDetail.fleetId, stopDetail.peerStopId], function(results) {
        var id = results[2][0]["@id"];
        logger.info("Stop {0} created with ID {1}", stopDetail.name, id);
        res.json({
            id: id
        });
    }, function(error) {
        res.send(500, 'Failed to create stop: ' + error);
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
    var fleetId = req.params.fleet_id;
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
            allstops: results[1].map(function(stop) {
                return {
                    id: stop.stop_id,
                    latitude: stop.latitude,
                    longitude: stop.longitude,
                    name: stop.name,
                    peerStopId: stop.peer_stop_id
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

            routes: results[2].map(function(route) {
                return {
                    routeId: route.route_id,
                    routeNum: route.route_name,
                    st: route.start_stop_name,
                    en: route.end_stop_name

                };
            })
            /*
            routes: [{
                routeId: 1,
                routeNum: 100,
                st: 'Panaji',
                en: 'Mapusa'
            }, {
                routeId: 2,
                routeNum: 101,
                st: 'Panaji',
                en: 'Margao'
            }, {
                routeId: 3,
                routeNum: 102,
                st: 'Panaji',
                en: 'Ponda'
            }] //TODO
			*/
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
    logger.info("Route:", route);
    route.fleetId = req.session.passport.user.rootFleetId; // Routes and stops belong to Root fleet

    route.startStopId = route.stages[0].stops[0].onwardStop.id;
    var stageLength = route.stages.length - 1
    var stopLength = route.stages[stageLength].stops.length - 1
    route.endStopId = route.stages[stageLength].stops[stopLength].onwardStop.id;

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
							trip.routeId = route.routeId;
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
                    route.routeNum = "";
                    route.st = route.stages[0].stops[0].onwardStop.name;
                    route.en = route.stages[stageLength].stops[stopLength].onwardStop.name;
                    res.json(route);
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
    tran.query("set @id := ? ; call save_trip(@id,?,?,?,?,?) ; select @id; ", [trip.tripId, trip.direction, trip.routeId,  trip.frequency_trip, trip.frequency_start_time, trip.frequency_end_time], function(results) {
        trip_id = results[2][0]["@id"];
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


app.get('/api/route/:route_id', function(req, res) {
    var route_id = req.params.route_id;
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
				trip.stops = {};
				routeDetail.trips[trip.direction].push(trip);
			}
		);
		results[2].forEach(
			function(rst){
				//Check if this is onward trip
				var idx = _.sortedIndex(routeDetail.trips[0], rst,'trip_id');
				var trip = routeDetail.trips[0][idx];
				if(trip && trip.trip_id == rst.trip_id){//If the trip really exists in the list
					trip.stops[''+rst.stop_id+''] = rst.time;					
				}
				else{ //Check in return trips
					idx = _.sortedIndex(routeDetail.trips[1], rst,'trip_id');
					trip = routeDetail.trips[1][idx];
					if(trip && trip.trip_id == rst.trip_id){//If the trip really exists in the list
						trip.stops[''+rst.stop_id+''] = rst.time;					
					}
				}
			}
		);
        /*
		{
			routeId: 1
			, stages: [
				{
					title: 'Stage1'
					, stageId: 1
					, stops: [
						{
							onwardStop: { id: 1, distance: 2000} //distance from previous stop in that direction to this stop
							, returnStop: { id: 2, distance: 1000}
						}
					]
				}
			]
		}
		*/
        res.json(routeDetail);
    });

    /*
    //TODO get from DB
    res.json({
        routeId: 1,
        stages: [{
            title: 'Stage1',
			stageId: 1,
            direction: 0,
            stops: [{
                id: 1
            }, {
                id: 2
            }],
			stages: {
				'1' : 5.0
				, '2' : 10.0
			}
        }, {
            title: 'Stage2',
			stageId: 2,
            direction: 0,
            stops: [{
                id: 3
            }, {
                id: 4
            }]
			,stages: {
				'1' : 10.0
				, '2' : 5.0
			}
        }]

        ,
        trips: [{
            tripId: 1,
            direction: 0,
            serviceId: 1,
            frequency_trip: true,
            frequency_start_time: '09:00',
            frequency_end_time: '10:00',
			stops: {
            '1': '09:00',
            '2': '09:10',
            '3': '09:20',
            '4': '09:25'
			}
        }, {
            tripId: 2,
            direction: 0,
            serviceId: 1,
            frequency_trip: true,
            frequency_start_time: '09:00',
            frequency_end_time: '10:00',
			stops: {
            '1': '09:00',
            '2': '09:10',
            '3': '09:20',
            '4': '09:25'
			}
        }]
		, fares: []
    });
	*/
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


app.post('/api/stops', authentication.ensureAPIRoles(['FLEETADMIN']) //TODO Add this to all api routes
    , function(req, res) {
        admin.saveStops([]);
    });

app.get('/api/kml/:fleet_id', function(req, res) {
    var fleetId = req.params.fleet_id;
    var host = req.headers.host;
    console.log("KML");
    admin.generate_kml(fleetId, host, function(content) {
        //application/vnd.google-earth.kml+xml
        res.writeHead(200, {
            'Content-type': 'application/vnd.google-earth.kml+xml'
        });
        res.write(content);
        res.end();
    });
});
