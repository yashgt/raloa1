var admin = require('admin');
var db = require('db');

var logger = require('logger').getLogger();
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

db.createPool(dbConfig);


admin.generateSegments(null, function(){
	console.log("Done");
});