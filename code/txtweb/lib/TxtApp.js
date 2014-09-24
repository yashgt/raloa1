
var mysql = require('mysql');

var db = mysql.createConnection({
		host: 'localhost',
		user: 'root',
		password: '',
		database: '',
		multipleStatements: true
		});

 	db.connect(function(err){
	console.log('error = ' + err);
	});

exports.search = function(srchTxt, callback){

// Query the DB based on the srchTxt and return a list of trips
	

db.query("CALL Source(? );",[srchTxt.from ] , 
	function(err, results){
			if(err) {
					console.log("DB error %j", err);
					throw err;
					}
         var start = results[0].map(
				  function(trip){
				  	if(lat.length === 0)
				  		{
					console.log("source error %j", err);
					throw err;
					}	 
                             });

db.query("CALL Destination(? );",[srchTxt.to ] , 
	function(err, results){
			if(err) {
					console.log("DB error %j", err);
					throw err;
					}
         var end = results[0 ].map(
				  function(trip){
				  	 if(log.length === 0)
				  		{
					console.log("Destination error %j", err);
					throw err;
					}	 
                             });

         callback();
       });

}