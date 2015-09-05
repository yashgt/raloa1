var db = require('db');
var logger = require('logger').getLogger();
var async = require('async');
var gm = require('googlemaps');
var fs = require('fs');
var ejs = require('ejs');
var _ = require('underscore');

//gm.setProxy("http://yash_ganthe:(0pspl1)@goaproxy.persistent.co.in:8080");

var formingSegments = false;

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

        results[0].forEach(
            function(route) {
				routeDetail.st = route.start_stop_name;
				routeDetail.en = route.end_stop_name;
				routeDetail.serviced = route.serviced;
			
			}
		);
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
		results[0].forEach( function(seg){
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
									callback(null, distance);									
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
