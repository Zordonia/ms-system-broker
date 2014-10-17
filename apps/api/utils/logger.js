'use strict';

var config, winston, logFilename, BaseStream, LogStream, loggers;

config = require('./config');
winston = require('winston').cli();
logFilename = __dirname + '/../logs/' + config.MODE + '.log';

// Configure winston to save to file.
winston.add(winston.transports.File, {
  level: 'debug',
  filename: logFilename,
  json: true
});

BaseStream = require('stream').Writable;
LogStream = function (level, opts) {
  BaseStream.call(this, opts);
  this.level = level;
};
require('util').inherits(LogStream, BaseStream);

LogStream.prototype._write = function (chunk, encoding, next) {
  winston.log(this.level, chunk);
  next();
};

// These are the particular logger types available.
loggers = [
  'error', 'warn', 'info', 'debug', 'trace'
].reduce(function (acc, level) {
  acc[level] = new LogStream(level, {
    decodeStrings: false,
    objectMode: true
  });
  return acc;
}, {});

module.exports = loggers;
