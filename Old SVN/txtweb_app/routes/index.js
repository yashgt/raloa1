
/*
 * GET home page.
 */
 
var TxtSearch = require('../lib/TxtSearch'); 
var TxtApp = require('../lib/TxtApp');

exports.index = function(req, res){
  try{
    var srchTxt = new TxtSearch(req.query['txtweb-message']);
    var trips = TxtApp.search(srchTxt, function(trips){
      if(trips.length == 0){
       res.render('notrips', { title: '@goatrans' });
      }
      else{
       res.render('schedule', { trips: trips });
      }   
    });
    
  }
  catch(err){
    console.log("Error %j", err);
    res.render('usage', { title: '@goatrans' });
  }
  
  
};

