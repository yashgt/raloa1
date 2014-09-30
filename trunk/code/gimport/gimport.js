//Converter Class
var Converter=require("csvtojson").core.Converter;
//var fs=require("fs");

var db=require('db');

//Amey to continue from here

var csvConverter=new Converter(false); 

var readStream=require("fs").createReadStream("inputData.csv"); 

var writeStream=require("fs").createWriteStream("outpuData.json");

var started=false;
csvConverter.on("record_parsed",function(rowJSON){
    if (started){
        writeStream.write(",\n");
    }
    writeStream.write(JSON.stringify(rowJSON));  
    if (started==false){
        started=true;
    }
});

writeStream.write("[\n"); 

csvConverter.on("end_parsed",function(){
    writeStream.write("\n]"); 
});

csvConverter.from(readStream);