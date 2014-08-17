

exports.login = function(req, res){

    res.render('login', { });  
  
};

exports.admin = function(req, res){
	console.log("%j", req.session);
    res.render('admin', { user: req.session.passport.user });  
  
};

