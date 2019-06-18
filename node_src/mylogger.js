var log4js = require('log4js');
var logger = log4js.getLogger();
logger.level = 'all';

exports.LOG_DEBUG = function (filename, line, d) {
	logger.debug("[" + filename + "][" + line + "] " + d)
}

exports.LOG_ERROR = function (filename, line, d) {
	logger.debug("[" + filename + "][" + line + "] " + d)
}

exports.LOG_INFO = function (filename, line, d) {
	logger.all("[" + filename + "][" + line + "] " + d)
}