var db = require('db');
var logger = require('logger').getLogger();
var async = require('async');
var gm = require('googlemaps');
var fs = require('fs');
var ejs = require('ejs');
var _ = require('lodash');
var spawn = require('child_process').spawn;
//var googleTransliterate = require('google-transliterate');

//gm.setProxy("http://yash_ganthe:(0pspl1)@goaproxy.persistent.co.in:8080");

var formingSegments = false;

exports.makegtfs = function(fleetId, cb){
	var makegtfs = spawn('sh', [ '../database/makegtfs.sh', ''+fleetId ], {});
	makegtfs.on('exit', (code) => {
		cb(code);
	});
}

exports.saveStops = function saveStops(stops)
{
	db.connect( function(conn){
		//conn.query ....
	});
};

exports.generate_kml = function(fleetId, host, cb){
	fs.readFile('views/kml.ejs', 'utf8', function(err, template){
		db.query("call get_stops(?);", [fleetId], function(results){
			stops = results[0];			
			var content = ejs.render(template, {stops: stops, fleetId: fleetId, root:host});
			cb(content);
		});

	})
	
};

exports.generateFleetTranslits = function(fleetId) {
	this.getFleetDetail(fleetId, function(fleet){
		//console.log(fleet);
		fleet.allstops.forEach(function(stop){
			//console.log(stop);
			fleet.langs.forEach(function(lang){
				(function(stop, lang) {
				exports.translit(stop.name,lang, function(tr){
					logger.info("Translit {0} {1} {2} {3}",fleetId, stop.name, tr, lang);
					
					//db.query("call add_translit(?,?,?,?);", [fleetId, stop.name, tr, lang], function(results){ });
				});
				})(stop, lang);
			});
		});
	});
};

exports.translit = function(name, lang, cb){
	googleTransliterate.transliterate(name,'en',lang, function(err,tr){
		cb(tr);
		console.log(tr);
	});
	
};

exports.getFleetDetail = function(fleetId, callback){
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
                    peerStopId: stop.peer_stop_id,
                    location_status: stop.location_status
                };
            }),
            
            routes: results[2].map(function(route) {
                //console.log(_.isEmpty(route.internal_route_cd) ? [] : route.internal_route_cd.split(','));
                return {
                    routeId: route.route_id,
                    routeName: route.route_name,
                    routeNum: route.internal_route_cd, 
                    st: route.start_stop_name,
                    en: route.end_stop_name,
					status: route.status

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
			langs: ['mr']
           
        };
		
		callback(fleetDetail);
        
    });
}

exports.getRouteDetail = function(route_id, callback){
    db.query("call get_route_detail(?);", [route_id], function(results) {
        var routeDetail = {
			st: '',
			en: '',
            routeId: route_id,
            stages: [],
            trips: [
                [],
                []
            ]
        };
	logger.trace("Results {0}",JSON.stringify(results));

        results[0].forEach(
            function(route) {
				routeDetail.st = route.start_stop_name;
				routeDetail.en = route.end_stop_name;
                routeDetail.internalRouteCode = _.isEmpty(route.internal_route_cd) ? [] : route.internal_route_cd.split(','),
				routeDetail.serviced = route.serviced;
			
			}
		);/*
        results[1].forEach(
            function(routeStage) {

                    stage = {
                        title: routeStage.stage_name,
                        stageId: routeStage.stage_id,
                        isVia: routeStage.is_via,
                        stops: []
                    };
                    routeDetail.stages.push(stage);
            });    
            */
        results[1].forEach(
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
                        isVia: routeStop.is_via,
                        stops: []
                    };
                    routeDetail.stages.push(stage);
                }

                if(routeStop.onward_stop_id != undefined){
                    var rs = {
                        onwardStop: {
                            id: routeStop.onward_stop_id,
                            name: routeStop.onward_stop_name,
                            distance: routeStop.onward_distance
                        },
                        returnStop: {
                            id: routeStop.return_stop_id,
                            name: routeStop.return_stop_name,
                            distance: routeStop.return_distance
                        },
                        isStation: routeStop.is_station
                    };
                    stage.stops.push(rs);
                }

            });
			
		results[2].forEach(
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
		results[3].forEach(
			function(rst){
				[0,1].forEach( function(dir) {
					var trip = _.find(routeDetail.trips[dir], function(tr){ return tr.tripId==rst.trip_id; })
					if(trip) {
						trip.stops[''+rst.stop_id+''] = rst.time;
					}
				});
/*
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
*/
			}
		);
		
        if(routeDetail.stages[0].stops.length >0 ){
		var firstFilledStage = _.find(routeDetail.stages,function(sg){
			return !(_.isEmpty(sg.stops)) ;
		});
            var onStop1Id = _.first(firstFilledStage.stops).onwardStop.id ;

		var lastFilledStage = _.findLast(routeDetail.stages,function(sg){
			return !(_.isEmpty(sg.stops)) ;
		});
            var reStop1Id = (_.last(lastFilledStage.stops)).returnStop.id;
            
            [0,1].forEach(function(dir){
                routeDetail.trips[dir] = _.sortBy( routeDetail.trips[dir] , function(trip){
                    return (dir==0) ? trip.stops[''+onStop1Id] : trip.stops[''+reStop1Id] ;
                });
            });
        }
        

		

		callback(routeDetail);
    });


};
exports.generateSegments = function(routeId, segCallback)
{
/*
	if(formingSegments)
		return;
	formingSegments = true ;	
	*/
	db.query("call get_missing_segments(?);", [routeId], 
	function(results){
		var segSeries = [];
		results[0].forEach( function(seg){ //This itself is acting like a closure
			console.log("Segment %j", seg);
			segSeries.push(
				function(callback){
					logger.debug("Getting segment for {0} [{1},{2}] to {3} [{4},{5}]", seg.from_stop_id, seg.from_lat, seg.from_lon, seg.to_stop_id, seg.to_lat, seg.to_lon);
					var origins = seg.from_lat + "," + seg.from_lon;
					var destinations = seg.to_lat + "," + seg.to_lon;
					var sensor = true;
					var mode = 'driving';
					var units = 'metric';
					var alternatives = '' ;
					var avoid = '';
					var language = 'en';
					var dcb = function(err, data){
						if(!err ){
							if(data.status == 'OK'){								
								logger.trace("Distance data {0}", data);
								var distance = data.rows[0].elements[0].status=="OK" ? data.rows[0].elements[0].distance.value : -1 ;
								db.query("call add_segment(?,?,?); ", [ seg.from_stop_id , seg.to_stop_id , distance]
								,function(results){
									logger.trace("Distance data {0} saved as segment", data);
									if(routeId==null){
										setTimeout(function() {
									    	console.log('Blah blah blah blah extra-blah');
											callback(null, distance);									
										}, 3000);
									}
									else{
										callback(null, distance);									
									}
								});								
							}
							else{
								logger.error("Segment data received with status {0} for {1} {2}", data.status,origins, destinations);
								callback(data.status, 1);
							}
						}
						else{
							logger.error("Error {0} for {1} {2}", err,origins, destinations);
							callback(err, 1);
						}
					};
					gm.distance(origins, destinations, dcb, sensor, mode, alternatives, avoid, units, language)
				}
			);	
			
		});
		async.series(segSeries, function(err,results){
			if(err){
				logger.error("Error encountered while generating segments {0}", err);
			}
			else{
				logger.trace("Completed generation of segments");
				segCallback();
			}
			formingSegments = false;
		});
	});
}; 

exports.saveRoute = function(route, sCB, fCB){
	var i = 1;
	route.stages.forEach(function(stg){
		stg.sequence = i++;
	});
        logger.trace("Saving route {0}", JSON.stringify(route));
	    db.getTransaction(

        //(function(route) {
        //return 
        function(tran) {
            var routesWF = [

                function(callback) {
					if(route.stages.length == 0){
						callback(null, tran, route);
					}
					else{
						saveRouteEntity(tran, route, function(routeId) {
							route.routeId = routeId;
							route.stages.forEach(function(stage) {
								stage.routeId = routeId;
							});
							callback(null, tran, route);
						}
						, function(){callback("Unable to save route", null); }
						);
					}
                },

                function(tran, route, callback) {
                    //console.log("Saving stages for route %j", route);
                    logger.debug("Saving stages");

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
                    logger.debug("Saving trips for route {0}", route);

                    var tripSeries = [];
					//TODO add thi part to admin version
					if(route.deletedTrips){
						route.deletedTrips.forEach( function(trip){
							console.log("%j",trip);
							tripSeries.push( function(cb){
								delTripEntity(tran, trip, function() {
									cb(null, trip);
								}
								, function(){cb("Unable to delete trip", null); }
								);
							});
						});
					}
					
                    route.trips.forEach(function(tripList) {
                        tripList.forEach(function(trip) {
							if(trip.tripId<0 || _.isEmpty(trip.tripId) || trip.isDirty){
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
				//sCB();
					exports.generateSegments(
						route.routeId, 
						function(){
							sCB();	
						}
					);

                			}, function() {
                    				fCB();
                			});
		}
		else{
			tran.rollback();
			fCB();
		}
            });
        }
        //;		
        //})(route);

    );

};

saveRouteEntity = function(tran, route, cb, fcb) {
    tran.query("set @id := ? ; call save_route(@id,?,?,?,?,?,?,?) ; select @id; ", [route.routeId, route.fleetId, 'ABC', route.internalRouteCode==undefined ? "" : route.internalRouteCode.join(), route.startStopId, route.endStopId, 0,route.stop_cnt], function(results) {
        //console.log(results);
        route_id = results[2][0]["@id"];
        logger.debug('Saved route record. ID is {0}', route_id);
        cb(route_id);
    }
	,function(err){	logger.error("Failed due to {0}", err); fcb();	}
	);
};

saveStageEntity = function(tran, stage, cb, fcb) {
    tran.query("set @id := ? ; call save_stage(@id,?,?,?,?) ; select @id; ", [stage.stageId, stage.routeId, stage.title, stage.isVia, stage.sequence], function(results) {
        stage_id = results[2][0]["@id"];
        logger.debug('Saved stage record {0}', stage);
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

delTripEntity = function(tran, trip, cb, fcb) {
	tran.query("call delete_trips(?);" , [ trip.tripId]
		, function(results) { 
        	logger.debug('Deleted trip record {0}', trip);
			cb();
		} 
		, function(err){	logger.error("Failed due to {0}", err); fcb();	}
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
