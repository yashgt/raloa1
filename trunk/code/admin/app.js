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

var app = express();

var nconf = require('nconf');
nconf.argv().env() ;
nconf.file({ //Search for this file in this directory and use it as my config file
	file: 'config.json',
	dir: '..',
	search : true
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
	secret: 'supersecretkeygoeshere'
	, store: new MySQLStore(options)
	}
	));
 app.use(passport.initialize());
  app.use(passport.session());
  
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
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

http.createServer(app).listen(app.get('port'), function(){
	logger.info('Express server listening on port ' + app.get('port'));
  //console.log('Express server listening on port ' + app.get('port'));
});

//AUTH REGION
passport.serializeUser(authentication.serializeUser);
passport.deserializeUser(authentication.deserializeUser);

app.get('/', authentication.ensureLogin, function(req, res){
	console.log("%j", req.session);
    res.render('index', { user: req.session.passport.user });  
  
});	//Unless logged in, user should be restricted from using this path

app.post('/login',
  passport.authenticate('local', { successRedirect: '/',
                                   failureRedirect: '/login.html',
                                   failureFlash: false })
);
app.get('/logout', authentication.logout);
//AUTH REGION ends

app.post('/api/segments', function(req,res) {

});

app.post('/api/routes', function(req, res) {

});

app.get('/api/routes', function(req, res) {

});

app.post('/api/stops'
, authentication.ensureAPIRoles(['FLEETADMIN']) //TODO Add this to all api routes
, function(req, res) {
	admin.saveStops([]);
});

app.get('/api/stops', function(req, res) {

});

app.get('/api/routes/:route_id', function(req, res) {

});