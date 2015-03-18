var db = require('db');
var logger = require('logger').getLogger();
var async = require('async');
var gm = require('googlemaps');
var fs = require('fs');
var ejs = require('ejs');

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

exports.generateSegments = function()
{
	if(formingSegments)
		return;
	formingSegments = true ;	
	db.query("call get_missing_segments()", 
	function(results){
		var segSeries = [];
		results[0].forEach( function(seg){
			console.log("Segment %j", seg);
			segSeries.push(
				function(callback){
					logger.debug("Getting segment for {0} {1} to {2} {3}", seg.from_lat, seg.from_lon, seg.to_lat, seg.to_lon);
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
								var distance = data.rows[0].elements[0].status=="OK" ? data.rows[0].elements[0].distance.value : -1 ;
								db.query("call add_segment(?,?,?); ", [ seg.from_stop_id , seg.to_stop_id , distance]
								,function(results){
									logger.trace("Distance data {0}", data);
									callback(null, distance);									
								});								
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
			}
			formingSegments = false;
		});
	});
}; 