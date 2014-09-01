
var placePatt = "[a-zA-Z\\s]+";
var pattSource = /^([a-zA-Z\s]+) to ([a-zA-Z\s]+)/g

function TxtSearch(text){
	if (typeof text === 'undefined') 
	{
		throw "Message not supplied" ;
	}
	else 
	{
	console.log(text);

	var places = text.replace(pattSource, "$1-$2"); //returns "first place-second place"
	this.from = places.split("-")[0];
	this.to = places.split("-")[1];
	
    console.log(this) ;

};


module.exports = TxtSearch ;
