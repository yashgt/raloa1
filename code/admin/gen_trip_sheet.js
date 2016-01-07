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

var readWBNew = function(filename){
	var wb = new Excel.Workbook();
	wb.xlsx.readFile(filename)
    .then(function() {
        wb.xlsx.writeFile("TT1.xlsx")
		.then(function() {
			// done
		});
    });

};
var writeWBNew = function(routes){
	var wb = new Excel.Workbook();
	routes.forEach(function(route){
		//route = routes[0];
		
		var sheetName = route.routeId+"-"+route.st.substr(0,5)+" to "+route.en.substr(0,5) ; 
		console.log("%j", sheetName);
		var worksheet = wb.addWorksheet(sheetName);
		//var worksheet = wb.addWorksheet(route.routeId+"-");
		
		worksheet.addRow({});
		var stopRow = worksheet.lastRow;
		stopRow.alignment = { textRotation: 90 };
		stopRow.font = {bold: true};
		stopRow.getCell(1).value = "Stop";
		
		worksheet.addRow({});
		var onStopIDRow = worksheet.lastRow;
		onStopIDRow.getCell(1).value = "Onward Stop ID";
		
		worksheet.addRow({});
		var reStopIDRow = worksheet.lastRow;
		reStopIDRow.getCell(1).value = "Return Stop ID";
		
		worksheet.addRow({});
		var onDistance = worksheet.lastRow;
		onDistance.getCell(1).value = "Onward Distance";
		var onDistRowNum = 4;
		
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
					
					var time = moment(trip.stops[''+ stopId], 'HH:mm').format('hh:mm a');
										
					var cell = tripRow.getCell(cellId);
					cell.type = 3;
					cell.value = time;
				});
			});
		});
		
		//=IF(OR(ISBLANK(C7),LEN(C7)=0),"",TEXT(TIME(HOUR(C7), MINUTE(C7), SECOND(C7)+(D$4/(1000*30))*60*60),"hh:mm a/p"))
		var rowsToAdd = 50;
		for(cnt = 0 ; cnt<rowsToAdd; cnt++){
			worksheet.addRow({});
			newTripRow = worksheet.lastRow;
			for(i=4; i<scnt+3; i++){ //columns
				cell = newTripRow.getCell(i) ;
				pcell = newTripRow.getCell(i-1) ;
				
				cell.type = 6;
				var distCellCol = cell.address.replace(/[0-9\.]+/g, "");
				
				var fml = util.format("IF(OR(ISBLANK(%s),LEN(%s)=0),\"\",TEXT(TIME(HOUR(%s), MINUTE(%s), SECOND(%s)+(%s$%d/(1000*30))*60*60),\"hh:mm a/p\"))", pcell.address,pcell.address,pcell.address,pcell.address,pcell.address,distCellCol,onDistRowNum);

				cell.value = { formula: fml };
			
			}
		}
		
		
		
		
	});
	
	var options = {
		dateFormat: "HH:mm:ss"
	};
	wb.xlsx.writeFile("TT1.xlsx", options)
		.then(function() {
			// done
	});
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

var generateTripSheet = function(){
	console.log("Gen");
	admin.getFleetDetail(3, function(fleetDetail){
		//console.log("%j",fleetDetail);
		var wsSeries = [];
		fleetDetail.routes.forEach(function(route){
			wsSeries.push( function(cb){
				admin.getRouteDetail(route.routeId, function(routeDetail){
					//Add route to workbook
					//console.log("Route %j processed as %j", route.routeId, routeDetail);
					cb(null, routeDetail);
				});	
			});
			
		});
		
		async.series(wsSeries, function(err,routeDetails){
			writeWBNew(routeDetails);			
		});
		
		
		
		
	});
	console.log("Generated routes of fleet");

};

exports.generateTripSheet = generateTripSheet;




//app.listen(5000);
generateTripSheet();
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
*/