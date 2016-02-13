var XLSX = require('xlsx');
var Excel = require("exceljs");
var db = require('db');
var admin = require('admin');
var readline = require('readline');
var nconf = require('nconf');
var async = require('async');
var http = require('http');
var express = require('express');
var app = express();
var util = require('util');
var moment = require('moment');
var _s = require('underscore.string');
var admin = require('admin');
var path = require('path');
var sheetLoc = "..//..//schedules//";
var rowsToAdd = 300;

var nameRowNum = 1;
var stationRowNum = 2;
var onStopIDRowNum = 3;
var reStopIDRowNum = 4;
var onDistRowNum = 5;
var reDistRowNum = 6;

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


var readWBNew = function(filename, cb){
	console.log(filename);
	var rawFileName = path.basename(filename);
	var fleetId = parseInt(_s.words(rawFileName)[0]) ;
	var wb = new Excel.Workbook();
	wb.xlsx.readFile(filename)
    .then(function() {
		console.log("Read");
		var routes = [] ;
		wb.eachSheet(function(worksheet, sheetId) {
			//var routeId = worksheet.
			//console.log(worksheet.name);
			var routeId = parseInt(_s.words(worksheet.name)[0]) ;
			var meta = { lastCellNum: 1};
			var route = {
				st: '',
				en: '',
				routeId: routeId,
				fleetId: fleetId,
				stages: [],
				trips: [
					[],
					[]
				]
			};
			
			worksheet.eachRow(function(row, rowNumber) {
				
				if(rowNumber==nameRowNum || rowNumber==stationRowNum || rowNumber==onDistRowNum || rowNumber==reDistRowNum){
					
				}	
				else if(rowNumber==onStopIDRowNum){ //Onward Stop ID
					
					row.eachCell(function(cell, colNumber) {
						//console.log("Cell " + colNumber + " = " + cell.value);
						meta[colNumber] = { onwardStopId : cell.value };
						meta.lastCellNum = colNumber;
					});
					
				}
				else if(rowNumber==reStopIDRowNum){ //Return Stop ID
					row.eachCell(function(cell, colNumber) {
						//console.log("Cell " + colNumber + " = " + cell.value);
						meta[colNumber].returnStopId = cell.value ;	
					});
					
				}
					
				else if(_s.isBlank(row.getCell(1).value) ){ //Its a new trip
					
					//console.log(row.getCell(3).value);
					var timeCellVal = row.getCell(3).value ;	
					console.log(timeCellVal);
					if(_s.isBlank(timeCellVal) || timeCellVal.formula != undefined && _s.isBlank(timeCellVal.result) ) { //Check if start time is given
						return;
					}
					else {
						console.log("Row %j", rowNumber);
						var dir = (row.getCell(2).value == "Onward") ? 0 : 1;
						
						var trip = {stops: {}, fleetId: fleetId, tripId: -1, direction: dir, serviceId: 1}; //TODO set service ID based on chosen service
						
						for(i=3; i<= meta.lastCellNum; i++){
							var time;
							console.log(typeof(row.getCell(i).value));
							if( row.getCell(i).value.formula != undefined ) {
								time = moment(row.getCell(i).value.result, 'hh:mm:ss a').format('HH:mm');
							}
							else {
								console.log(row.getCell(i).value);
								console.log(moment(row.getCell(i).value).utcOffset());
								time = moment(row.getCell(i).value).add( -moment(row.getCell(i).value).utcOffset(), 'minute').format('HH:mm') ;
							}
							console.log(time);
							
							
							var stopId = dir==0 ? meta[i].onwardStopId : meta[i].returnStopId ;
							trip.stops[ '' + stopId ] = time ;
							
						}
						
						//console.log(trip);
						route.trips[dir].push(trip);
					}
				}
				
			});
			//console.log(route);
			routes.push(route);
		});
		//console.log(routes);
		cb(routes);
        
    });
	
};
var writeWBNew = function(filename, routes){
	var wb = new Excel.Workbook();
	routes.forEach(function(route){
		//route = routes[0];
		
		var sheetName = route.routeId+"-"+route.st.substr(0,5)+" to "+route.en.substr(0,5) ; 
		
		var color = (route.serviced == 1) ? "F0000FF" : "" ;
		console.log("%j %j", sheetName, color);
		var worksheet = wb.addWorksheet(sheetName, color);
		//var worksheet = wb.addWorksheet(route.routeId+"-");
		
		worksheet.addRow({});
		var stopRow = worksheet.lastRow;
		stopRow.alignment = { textRotation: 80 };
		stopRow.font = {bold: true};
		stopRow.getCell(1).value = "Stop";
		
		worksheet.addRow({});
		var stationRow = worksheet.lastRow;
		stationRow.font = {bold: true};
		stationRow.getCell(1).value = "Bus station";
		
		worksheet.addRow({});
		var onStopIDRow = worksheet.lastRow;
		onStopIDRow.getCell(1).value = "Onward Stop ID";
		
		worksheet.addRow({});
		var reStopIDRow = worksheet.lastRow;
		reStopIDRow.getCell(1).value = "Return Stop ID";
		
		worksheet.addRow({});
		var onDistance = worksheet.lastRow;
		onDistance.getCell(1).value = "Onward Distance";
		
		
		worksheet.addRow({});
		var reDistance = worksheet.lastRow;
		reDistance.getCell(1).value = "Return Distance";
		
		var i = 3;
		var scnt = 0;
		 
		stopCellMap = [];
		[0,1].forEach(function(dir){
			stopCellMap[dir] = {};
		});
		var onStopCellMap = {};
		var reStopCellMap = {};
		
		route.stages.forEach(function(stage){
			stage.stops.forEach(function(stop){
				worksheet.getColumn(i).width = 7.8;
				stopRow.getCell(i).value = stop.onwardStop.name ;
				onStopIDRow.getCell(i).value = stop.onwardStop.id ;
				stopCellMap[0][stop.onwardStop.id] = i ;
				reStopIDRow.getCell(i).value = stop.returnStop.id ;
				stopCellMap[1][stop.returnStop.id] = i ;
				onDistance.getCell(i).value = stop.onwardStop.distance ;
				reDistance.getCell(i).value = stop.returnStop.distance ;
				stationRow.getCell(i).value = stop.isStation
				scnt++;
				i++;
			});
		});
		
		onStopIDRow.height = 0;
		reStopIDRow.height = 0;
		
		
		[0,1].forEach(function(dir){
			route.trips[dir].forEach(function(trip){
				//console.log(trip);
				worksheet.addRow({});
				tripRow = worksheet.lastRow;
				tripRow.getCell(1).value = trip.tripId;
				tripRow.getCell(2).value = dir==0 ? "Onward" : "Return" ;
				Object.keys(trip.stops).forEach(function(stopId){
					var cellId = stopCellMap[dir][stopId] ;
					
					var time = moment(trip.stops[''+ stopId], 'HH:mm').format('hh:mm:ss a');
										
					var cell = tripRow.getCell(cellId);
					cell.type = 3;
					cell.value = time;
				});
			});
		});
		
		//=IF(OR(ISBLANK(C7),LEN(C7)=0),"",TEXT(TIME(HOUR(C7), MINUTE(C7), SECOND(C7)+(D$4/(1000*30))*60*60),"hh:mm a/p"))
		//=IF(A15="Onward", IF(OR(ISBLANK(AL15),LEN(AL15)=0),"",TEXT(TIME(HOUR(AL15), MINUTE(AL15), SECOND(AL15)+(AM$4/(1000*30))*60*60),"hh:mm am/pm")), IF(OR(ISBLANK(AN15),LEN(AN15)=0),"",TEXT(TIME(HOUR(AN15), MINUTE(AN15), SECOND(AN15)+(AN$4/(1000*30))*60*60),"hh:mm am/pm")))
		
		for(cnt = 0 ; cnt<rowsToAdd; cnt++){
			worksheet.addRow({});
			newTripRow = worksheet.lastRow;
			for(i=3; i<scnt+3; i++){ //columns
				cell = newTripRow.getCell(i) ;
				pcell = newTripRow.getCell(i-1) ;
				ncell = newTripRow.getCell(i+1) ;
				
				cell.type = 6;
				var distCellCol = cell.address.replace(/[0-9\.]+/g, "");
				var distCellRow = cell.address.replace(/[A-Z\.]+/g, "");
				
				//var fml = util.format("IF(OR(ISBLANK(%s),LEN(%s)=0),\"\",TEXT(TIME(HOUR(%s), MINUTE(%s), SECOND(%s)+(%s$%d/(1000*30))*60*60),\"hh:mm am/pm\"))", pcell.address,pcell.address,pcell.address,pcell.address,pcell.address,distCellCol,onDistRowNum);
				var fml = util.format("IF(%s%d=\"Onward\", IF(OR(ISBLANK(%s),LEN(%s)=0),\"\",TEXT(TIME(HOUR(%s), MINUTE(%s), SECOND(%s)+(%s$%d/(1000*30))*60*60),\"hh:mm:ss am/pm\")), IF(OR(ISBLANK(%s),LEN(%s)=0),\"\",TEXT(TIME(HOUR(%s), MINUTE(%s), SECOND(%s)+(%s$%d/(1000*30))*60*60),\"hh:mm:ss am/pm\")))"
				, "B", distCellRow
, pcell.address,pcell.address,pcell.address,pcell.address,pcell.address,distCellCol,onDistRowNum
, ncell.address,ncell.address,ncell.address,ncell.address,ncell.address,distCellCol,onDistRowNum+1 
				)

				cell.value = { formula: fml };
			
			}
		}
		
		
		
		
	});
	
	var options = {
		dateFormat: "HH:mm:ss"
	};
	wb.xlsx.writeFile(filename, options)
		.then(function() {
			// done
	});
};



var generateTripSheet = function(fleetId){
	console.log("Gen");
	admin.getFleetDetail(fleetId, function(fleetDetail){
		//console.log("%j",fleetDetail);
		var wsSeries = [];
		fleetDetail.routes.forEach(function(route){
			console.log(route);
			wsSeries.push( function(cb){
				admin.getRouteDetail(route.routeId, function(routeDetail){
					//Add route to workbook
					//console.log("Route %j processed as %j", route.routeId, routeDetail);
					cb(null, routeDetail);
				});	
			});
			
		});
		
		async.series(wsSeries, function(err,routeDetails){
			
			writeWBNew(sheetLoc + fleetId+ "-TimeTable.xlsx", routeDetails);			
		});
		
		
		
		
	});
	console.log("Generated routes of fleet");

};

var updateTrips = function(fleetId){
	
	var routes = readWBNew(sheetLoc + fleetId + "-TimeTable.xlsx", function(routes){
		routes.forEach(function(route){
			admin.saveRoute(route
				,function(){
					console.log("Saved route %j", route);
				}
				,function(){
					console.log("Could not save route %j", route);
				}
			)
		});
	});
	
};

exports.generateTripSheet = generateTripSheet;
exports.updateTrips = updateTrips;

/*
var rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.question("What do you think of Node.js? ", function(answer) {
  // TODO: Log the answer in a database
  console.log("Thank you for your valuable feedback:", answer);

  rl.close();
});


var readWB = function(file){
	var wb = XLSX.readFile('KTCL-TT.xlsx');
	
	wb.SheetNames.forEach(function(sheetName){
		console.log(sheetName);
		var ws = wb.Sheets[sheetName];
		console.log(ws);
		console.log(ws["C2"]);
	});
	XLSX.writeFile(wb,"TT1.xlsx");
};

var writeWB= function(routes){
	var wopts = { bookType:'xlsx', bookSST:false, type:'binary' };
	//var wb = XLSX.readFile('test.xlsx');
	var wb = {};
	var i = 1;
	wb.SheetNames = [];
	wb.Sheets = {};
	//wb.Sheets["Sheet2"
	//routes.forEach(function(route){
		route = routes[0];
		var ws = {};
		
		var cell_ref = XLSX.utils.encode_cell({c:0,r:0});
		console.log(cell_ref);
		ws["A1"] = {v:"Stop", w: "Stop", t: "s"};
		ws["A2"] = {v:"Stop ID", w: "Stop ID", t: "s"};
		
		var sheetName = "A"+route.routeId+"B";
		wb.SheetNames.push(sheetName);
		console.log("Worksheet %j", ws);
		wb.Sheets[sheetName] = ws;
		
	//});
	console.log("Work book %j", wb);
	XLSX.writeFile(wb,"trips.xlsx", wopts);

};

//writeWBNew([{routeId:1}]);
//readWBNew("KTCL-TT.xlsx");
*/
