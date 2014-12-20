var db = require('db');
var logger = require('logger');


exports.saveStops = function saveStops(stops)
{
	db.connect( function(conn){
		//conn.query ....
	});
}

exports.generateSegments = function()
{
	db.query("call get_missing_segments()", []
	, function(results){
		results[0].forEach( function(segment){
			logger.debug("Segment {0} to {1}", segment.from_stop_id, segment.to_stop_id);
		});
	});
}; 