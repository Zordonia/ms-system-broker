'use strict';

var Q, logger, restler, url, config, elasticsearch, _;

Q = require('q');
logger = require('../../utils/logger').prefix('ELASTICSEARCH.CONTROLLER');
restler = require('restler-q');
url = require('url');
config = require('../../utils/config.js');
_ = require('lodash');
elasticsearch = require('../../datastore/elasticsearch.js');

module.exports = {
  saveMobileMessage: function (message) {
    logger.info.write('Storing mobile message: ' + message.id + '_' + message.timestamp);
    return elasticsearch.index({
      index: 'mobile',
      type: 'message',
      id: message.id + '_' + message.timestamp,
      body: message
    }).then( function (resp) {
      logger.info.write('Mobile message stored.');
      return resp;
    });
  },
  saveSystemMessage: function (message) {
    logger.info.write('Storing system message: ' + message.id + '_' + message.timestamp);
    return elasticsearch.index({
      index: 'system',
      type: 'message',
      id: message.id + '_' + message.timestamp,
      body: message
    }).then( function (resp) {
      logger.info.write('System message stored.');
      return resp;
    });
  }
};
