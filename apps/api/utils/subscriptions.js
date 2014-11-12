'use strict';

var Q, logger, restler, url, config, querystring, elasticsearch, _;

Q = require('q');
logger = require('../utils/logger').prefix('subscriptions');
restler = require('restler-q');
url = require('url');
config = require('../utils/config.js');
querystring = require('querystring');
elasticsearch = require('../controllers/elasticsearch/elasticsearch.js');
_ = require('lodash');

module.exports.subscribe = function (mobileId, systemId, radius, save) {
  var promises = [
      elasticsearch.getMobileEndpoint(mobileId)
    .then(function (res) { return { mobile: !!(res.id) }; }, _.identity),
      elasticsearch.getSystemEndpoint(systemId)
    .then(function (res) { return { system: !!(res.id) }; }, _.identity) ];
  return Q.all(promises).then(function (results) {
    var hasSystemResults = !_.isEmpty(_.find(results, function (res) {
      return res.system;
    }));
    var hasMobileResults = !_.isEmpty(_.find(results, function (res) {
      return res.mobile;
    }));
    if (!hasSystemResults) {
      var sErrMessage = 'No system endpoint matches the given id.';
      logger.error.write(sErrMessage);
      results = Q({ error: sErrMessage });
    }
    if (!hasMobileResults) {
      var mErrMessage = 'No mobile endpoint matches the given id.';
      logger.error.write(mErrMessage);
      results = Q({ error: mErrMessage });
    }
    if (hasSystemResults && hasMobileResults) {
      results = elasticsearch.mobileSubscription(mobileId, systemId, radius, save);
    }
    return results;
  });
};

module.exports.getMobileSubscriptions = function (mobileId) {
  return elasticsearch.getMobileSubscriptions(mobileId);
};

module.exports.getSystemSubscriptions = function (systemId) {
  return elasticsearch.getSystemSubscriptions(systemId);
};
