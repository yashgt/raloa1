/*
var log4js = require('log4js');

log4js.configure('log4js.json', {});
var logger = log4js.getLogger();

exports.getLogger = function getLogger(){
	return logger;
};
*/

var slf4j = require('binford-slf4j');
//var slf4j-adapter = require('binford-slf4j-adapter');
//var logprovider = slf4j-adapter.log4js();

var binfordLogger = require('binford-logger');
slf4j.setLoggerFactory(binfordLogger.loggerFactory);

//slf4j.setLoggerFactory(logprovider.loggerFactory);
slf4j.loadConfig({
    level: 5,
    appenders:
        [{
            appender: binfordLogger.getDefaultAppender()
        }]
});
var logger = slf4j.getLogger('app.js',{useLocalTime:true});

exports.getLogger = function getLogger(){
	return logger;
};
