var moment = require('moment');
//Old Goa to Ribandar Ferry
//Old Goa to Ribandar Ferry after 8
//Old Goa to Ribandar Ferry before 9:00pm
//Old Goa to Ribandar Ferry after 8 before 9:00pm
var aftStr = "aft" ;
var befStr = "bef" ;
var placePatt = "[a-zA-Z\\s]+";
var timePatt = "\\d{1,2}(?::{0,1}\\d{0,2})" ;
var merPatt = "(?:[ap]m){0,1}" ;
//var aftTimePatt = 
//console.log(aftTimePatt);


//var pattAftTime = new RegExp(/aft (\d{1,2}:{0,1}\d{0,2}[\s]*[ap]m)/) ; //capture the time part
	
//var pattBefTime = new RegExp(/bef (\d{1,2}:{0,1}\d{0,2}[\s]*[ap]m)/) ;

function prepareTimePatt(str){
	return str +" (" + "(" + timePatt  + ")" +  "[\\s]*" + "(" + merPatt + ")" + ")" ;
}

/* Experimental
var textPattStr = "^" + "(" + placePatt + ") to (" + placePatt + ")" + "(?:\\s*(?:" +  prepareTimePatt(aftStr)  +  "|" +  prepareTimePatt(befStr)  + "|" + "$)){1,2}"; 
	//+ ".*"	;
	//+ "(?:" + prepareTimePatt(aftStr) + "\\s*" + prepareTimePatt(befStr) + ")" ;
console.log(textPattStr);
var textPatt = new RegExp(textPattStr) ;
*/

var pattSource = /^([a-zA-Z\s]+) to ([a-zA-Z\s]+)(?=$| aft| bef| on).*/g
//var pattSource = /([a-zA-Z\s]+) to ([a-zA-Z\s]+) (after ([\d:apm]+)|before ([\d:apm]+))/g
var pattAftTime = new RegExp(".*" + prepareTimePatt(aftStr) + ".*") ; //capture the time part
var pattBefTime = new RegExp(".*" + prepareTimePatt(befStr) + ".*") ; //capture the time part
 
function sanitizeTime(timestr){
	var dateTime = moment("2013-02-08 " + timestr) ;
	if (!dateTime.isValid()){
		throw "Time format incorrect" ;
	}
	return dateTime.format("HH:mm:ss");
}
function TxtSearch(text){
	if (typeof text === 'undefined') 
	{
		throw "Message not supplied" ;
	}
	else 
	{
	//this.from = pattSource.exec(text);
	
	var places = text.replace(pattSource, "$1-$2"); //returns "first place-second place"
	this.from = places.split("-")[0];
	this.to = places.split("-")[1];
		
	//console.log("s= " + this.from);
    //console.log("d= " + this.to);
    console.log(text);
	//var aftArr = text.match(pattAftTime);
	this.after = text.replace(pattAftTime,"$2 $3");
	this.before = text.replace(pattBefTime,"$2 $3");
	
	this.after = sanitizeTime(this.after) ; 
	this.before = sanitizeTime(this.before) ; 

	//this.to = text.replace(pattDest, "$1-$2-$3");
	
	console.log(this) ;
		//console.log(text.match(textPatt));
	}
};


module.exports = TxtSearch ;
