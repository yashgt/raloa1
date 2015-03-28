/*
var log4js = require('log4js');

log4js.configure('log4js.json', {});
var logger = log4js.getLogger();

exports.getLogger = function getLogger(){
	return logger;
};
*/

var slf4j = require('binford-slf4j');
var binfordLogger = require('binford-logger');
slf4j.setLoggerFactory(binfordLogger.loggerFactory);
slf4j.loadConfig({
    level: 4,
    appenders:
        [{
            appender: binfordLogger.getDefaultAppender()
        }]
});
var logger = slf4j.getLogger('app.js');

exports.getLogger = function getLogger(){
	return logger;
};
