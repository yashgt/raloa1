'use strict';

var passport = require('passport');
var localStrategy = require('passport-local').Strategy;
var logger = require('logger').getLogger();
var db = require('db');

module.exports = {
  localStrategy: new localStrategy(
  function(username, password, done) {
  try{
  logger.info("Looking for " + username + " " + password);
  }catch(err){
  console.log("%j", err);
  }
  //console.log("Looking for %j %j", username, password);
	db.connect( function(conn){
		
		conn.query("select id, username from users where username = ? and password=?", [ username, password ]
			, function (err, results){
				if(!err){
					if(results[0]){
						var user = //This object is saved to the session
							{id: results[0].id			//User ID
							, name: 'Yash Ganthe'	//For display on the Admin page
							, fleetId: 1	//KTCL
							, fleetGroupId: 1	//Goa Public Transport
							, role: 'FLEETADMIN'
							}; //This object will be stored in the session
						console.log("User %j",user);
						return done(null, user);
					}
				}
				else{
					console.log("%j", err);
				}
				return done(null, false, {message: 'Incorrect credentials'});
			});
	});
	/*
	if (username === 'ktcladmin' && password === 'ktclpwd') {
		//TODO, get the right user
		return done(null, 
		//This object is saved to the session
		{id: 1			//User ID
		, name: 'Mr. Sanjay Ghate & Mr.Jeorge Fernandes'	//For display on the Admin page
		, fleetId: 1	//KTCL
		, fleetGroupId: 1	//Goa Public Transport
		, role: 'FLEETADMIN'
		} //This object will be stored in the session
		);
	}
	else {
		return done(null, false, {message: 'Incorrect credentials'});
		}
		*/
		
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