'use strict';

var passport = require('passport');
var localStrategy = require('passport-local').Strategy;
var logger = require('logger').getLogger();
var db = require('db');

module.exports = {
  localStrategy: new localStrategy(
  function(username, password, done) {
  	logger.info("Looking for " + username + " " + password);
	db.query("select user_id, username, fleet_id, get_root_fleet(fleet_id) as root_fleet_id, role_type  from user where username = ? and password=?", 
	[ username, password ]
	, function(results){
		if(results[0]){
				var user = //This object is saved to the session
					{userId: results[0].user_id			//User ID
					, username: results[0].username	//For display on the Admin page
					, rootFleetId: results[0].root_fleet_id
					, fleetId: results[0].fleet_id	//KTCL							
					, role: results[0].role_type
					}; //This object will be stored in the session
				logger.info("Found user %j",user);
				return done(null, user);
		}
		else {
				logger.info("Incorrect credentials");
				return done(null, false, {message: 'Incorrect credentials'});
		}
	}
	, function(error){
		return done(null, false, {message: 'Error encountered'});
	});
  }
),

  serializeUser: function(user, done) {
    done(null, user);
  },

  deserializeUser: function(user, done) {

      done(null, user);

  },

  login: function(req, res, next) {
    return passport.authenticate('local', function(err, user) {
      if (err) {
        return next(err);
      }
      if (!user) {
        return res.send(400, {message: 'Bad username or password'});
      }

      req.logIn(user, function(err) {
        if (err) {
          return next(err);
        }

        res.redirect('/');
      });
    })(req, res, next);
  },

  logout: function(req, res) {
    req.logout();
    return res.redirect('login.html');
  },

/*
  // NOTE: Need to protect all API calls (other than login/logout) with this check
  ensureAPIAuthenticated: function(req, res, next) {
    console.log('Calling: ensureAuthenticated.....');
    if (req.isAuthenticated()) {
      return next();
    } else {
      return res.send(401);
    }
  },

  ensureAPIAdmin: function(req, res, next) {
      // ensure authenticated user exists with admin role, otherwise send 401 response status
      console.log('Calling: ensureAdmin.....');
      if (req.user && req.user.role == 'FLEETADMIN') {
          return next();
      } else {
          return res.send(401);
      }
  },
  */
  
  ensureAPIRoles: function(roles) {
	return function(req, res, next){
		console.log('Checking for roles %j', roles);
		if (req.user && roles.indexOf(req.user.role) >= 0){
			return next();
		} else {
			return res.send(401);
		}
	};
  },
  ensureLogin: function (req, res, next) {
  if (req.user) {
	logger.debug('Pass');
    next();
  } else {
    req.session.error = 'Access denied!';
	logger.debug('Fail');
    res.redirect('/login.html');
  }
}




};
