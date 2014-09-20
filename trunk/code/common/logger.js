var log4js = require('log4js');

log4js.configure('log4js.json', {});
var logger = log4js.getLogger();

exports.getLogger = function getLogger(){
	return logger;
};