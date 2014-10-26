var jf = require('jsonfile');
var util = require('util');
var file = 'out1.json';
var http = require('http');
var path = require('path');
var mysql = require('mysql');
var db = mysql.createConnection({ 
host: 'localhost',
user: 'root',
password: 'goatrans',
database: 'goatrans'
	,multipleStatements: true
});
jf.readFile(file, function(err, obj) {
  for(var i =0;i<obj.length;i++) {
  db.query("CALL csvtodb(?,?,?,?);", [obj[i].stop_id],[obj[i].stop_lat],[obj[i].stop_lon],[obj[i].stop_name],function(err, results){
  if(err){

      console.log(err.message);
    }else{
      console.log(results);

    }
  });
  //console.log(util.inspect(obj[i].stop_id))
  //console.log(obj.length)
  }
})