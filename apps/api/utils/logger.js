'use strict';

var config, winston, logFilename, BaseStream, LogStream, loggers, _;

config = require('./config');
winston = require('winston').cli();
logFilename = __dirname + '/../logs/' + config.MODE + '.log';
_ = require('lodash');

var winston = new (winston.Logger)({
  transports: [
    new (winston.transports.Console)({ level: 'debug', colorize: true }),
    new (winston.transports.File)({ filename: logFilename, level: 'debug', json: true })
  ]
});

if (config.MODE === 'development'){
  winston.level = 'debug';
}

BaseStream = require('stream').Writable;
LogStream = function (level, opts, prefix) {
  BaseStream.call(this, opts);
  this.level = level;
  this.prefix = prefix;
};
require('util').inherits(LogStream, BaseStream);

LogStream.prototype._write = function (chunk, encoding, next) {
  if (this.prefix){
    var prefix = this.prefix;
    _.forEach(winston.transports, function (transport) {
      transport.label = prefix;
    });
  }
  if (this.level === 'debug'){
    winston.log(this.level, JSON.stringify(chunk, null, 4));
  }
  else {
    winston.log(this.level, chunk);
  }
  next();
};

loggers = [
  'error', 'warn', 'info', 'debug', 'trace'
].reduce(function (acc, level) {
  acc[level] = new LogStream(level, {
    decodeStrings: false,
    objectMode: true
  });
  return acc;
}, {});

loggers.prefix = function (prefix) {
  loggers = [
    'error', 'warn', 'info', 'debug', 'trace'
  ].reduce(function (acc, level) {
    acc[level] = new LogStream(level, {
      decodeStrings: false,
      objectMode: true
    }, prefix);
    return acc;
  }, {});
  return loggers;
};

module.exports = loggers;
