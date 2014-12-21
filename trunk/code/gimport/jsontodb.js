
var express = require('express');
var jf = require('jsonfile');
var util = require('util');
var file = 'out1.json';
var http = require('http');
var url = require("url");
var path = require('path');
var mysql = require('mysql');
var logger = require('logger');

var db = mysql.createConnection({ 
host: 'localhost',
user: 'root',
password: 'goatrans',
database: 'avishkar',
multipleStatements: true
});

db.connect(function(err) {
  if (err) {
    console.error('error connecting: ' + err.stack);
    return;
  }

  console.log('connected as id ' + db.threadId);
});

var app = express();


app.configure(function() {
    app.use(express.cookieParser());
    app.use(express.bodyParser());
    app.use(express.logger('dev'));
    app.use(express.json());
    app.use(express.urlencoded());
    app.use(express.methodOverride());
    app.use(app.router);
    app.use(express.static(path.join(__dirname, 'public')));
}); //configure ends


jf.readFile(file, function(err, obj) {
if(err){
//console.log("cannot read file");
console.log(err.message);
}
else{
for(var i =0;i<obj.length;i++) {
console.log("inserting stop ", obj[i]);
console.log("-------------------------");
  db.query("call csvtodb(?,?,?,?);", [obj[i].stop_id , obj[i].stop_lat , obj[i].stop_lon , obj[i].stop_name], function(err, results){
  if(err){
  console.log(err.message);

   }else{
      console.log(results);
	  logger.info("Name of the stop : ", obj[i].stop_name);

    }
	})
  }
}
  
  });
