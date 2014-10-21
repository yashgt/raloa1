var csv2json = require('csv2json');
var Converter=require("csv2json").core;
var csvConverter=new csv2json({constructResult:false}); // The parameter false will turn off final result construction. It can avoid huge memory consumption while parsing. The trade off is final result will not be populated to end_parsed event.

var readStream=require("fs").createReadStream("stops.csv");

var writeStream=require("fs").createWriteStream("out1.json");

readStream.pipe(csvConverter).pipe(writeStream);