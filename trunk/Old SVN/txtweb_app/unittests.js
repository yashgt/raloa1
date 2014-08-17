var TxtSearch = require('./lib/TxtSearch');
var http = require('http');
var jsdom = require("jsdom"); //.jsdom;
//var htmlToText = require('html-to-text');
//var cheerio = require("cheerio");

var txtURL = "http://localhost:8000/?txtweb-message=MESG";
var newLine = "\n    " ;
var usage =     newLine + "Send @goatrans <Source> to <Destination> [aft <time>] [bef <time>]"
+ newLine + "E.g. @goatrans Old Goa to Ponda aft 8:00pm bef 8:30pm "
+"\n  ";

			
//See details of this testing technique at https://github.com/caolan/nodeunit		
var checks = {
			"Teen Building to KTC mapusa aft 08:00am bef 08:30am" : {'response': usage, 'tested': false},
			"Vadakade to Mapusa" : {'response': "No trip found", 'tested': false}, 
			"Teen Building to KTC mapusa aft 08:00am bef 08:30pm" : {'response': usage, 'tested': false}, 
			"Teen Building to KTC mapusa aft 08:00pm bef 08:30am" : {'response': usage, 'tested': false}, 
			"Teen Building to KTC mapusa aft 08:00pm" : {'response': usage, 'tested': false},
			"Teen Building to KTC mapusa bef 08:30am" : {'response': usage, 'tested': false},
			"Teen Building aft 08:00pm bef 08:30am" : {'response': usage, 'tested': false},
			"Teen Building to KTC aft 08:00pm bef 08:30am" : {'response': usage, 'tested': false},
			"Teen Building to aft 08:00pm bef 08:30am" : {'response': "Destination not defined", 'tested': false},
			"to Teen Building aft 08:00pm bef 08:30am" : {'response': "Source not defined", 'tested': false},
			"KTC Mapusa to KTC Margao aft 08:00am bef 08:30am" : {'response': "No direct route", 'tested': false},
			"Teen Building to KTC mapusa aft 09:00am bef 09:30am" : {'response': "success", 'tested': true},
			
			
			

			//TODO Leslie add more conditions, failure as well as success
		};	

module.exports = {
    setUp: function (callback) {
		callback();
    },
    tearDown: function (callback) {
        // clean up
		//console.log("Tearing down");
        callback();
    }
	
	
};

var i = 0 ;
Object.keys(checks).forEach( function(textmsg) {
	i = i + 1 ;
	module.exports["test"+i.toString()] = function(test){ 
		console.log("testing  for %j", textmsg);
		jsdom.env(
  txtURL.replace("MESG", textmsg),
  ["http://code.jquery.com/jquery.js"],
  function (errors, window) {
    var resp = window.$("body").text();
    console.log( "%j", resp);
	//TODO Leslie put a check here. Follow the guide for nodeunit
	test.equal(resp,checks[textmsg]['response'], "Unexpected reponse");
		test.done();
		});
				

	};
	
});



