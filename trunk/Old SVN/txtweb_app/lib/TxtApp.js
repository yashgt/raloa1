
var mysql = require('mysql');

var db = mysql.createConnection({
		host: 'localhost',
		user: 'root',
		password: 'goatrans',
		database: 'goatrans',
		multipleStatements: true
		});

 	db.connect(function(err){
	console.log('error = ' + err);
	});

exports.search = function(srchTxt, callback){

// Query the DB based on the srchTxt and return a list of trips
	

db.query("CALL list_trips(?, ?, ?, ?);",[srchTxt.from , srchTxt.to , srchTxt.after , srchTxt.before ] , 
	function(err, results){
			if(err) {
					console.log("DB error %j", err);
					throw err;
					}
         var trips = results[0].map(
				  function(trip){
						return{start_name: trip.start_name, 
						       end_name: trip.end_name, 
						       location: trip.location, 
						       location_time: trip.location_time, 
						       target: trip.target, 
						       target_time: trip.target_time};	 
                             });

         callback(trips);
       });

}