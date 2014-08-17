
function Route(routeId)
{
	this.routeId = routeId;
	
	//Get this from DB
	this.stops = [ {stopId : 100, name:'Panaji'}, { stopId :101, name : 'Ribanda'}, { stopId:102, name : 'Old Goa'}];
	this.timings = {};
	
	
	
	/*
	this.timings[100] = {};
	this.timings[101] = {};
	this.timings[102] = {};
	//stopId = 100 ;

	//Set the timings of all stops for one trip
	this.timings[100][200] = '8:35' ;
	this.timings[101][200] = '8:40' ;
	this.timings[102][200] = '8:45' ;
	this.timings[100][201] = '8:35' ;
	this.timings[101][201] = '8:40' ;
	this.timings[102][201] = '8:45' ;
	*/
	this.timings[200] = { direction:0};
	this.timings[201] = { direction:1};
	
	//stopId = 100 ;

	//Set the timings of all stops for one trip
	this.timings[200][100] = '8:35' ;
	this.timings[200][101] = '8:40' ;
	this.timings[200][102] = '8:45' ;
	this.timings[201][100] = '8:35' ;
	this.timings[201][101] = '8:40' ;
	this.timings[201][102] = '8:45' ;
	console.log( Object.keys(this.timings));
}

module.exports = Route ;
