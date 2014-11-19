'use strict';

var Q, logger, restler, url, config, querystring, elasticsearch, subscriptions, _;

Q = require('q');
logger = require('../utils/logger').prefix('BROKER');
restler = require('restler-q');
url = require('url');
config = require('../utils/config.js');
querystring = require('querystring');
elasticsearch = require('./elasticsearch/elasticsearch.js');
subscriptions = require('../utils/subscriptions.js');
_ = require('lodash');

var messageHandler = function (res) {
  return function (result) {
    logger.info.write(result);
    res.json(result.error ? result.status || 400 : result.status || 200, result);
    return result;
  };
};

var errorHandler = function (res) {
  return function (error) {
    logger.error.write(error);
    res.json(error && error.error ? error.status || 400 : error.status || 500, error);
    return error;
  };
};

module.exports.base = function (req, res) {
  res.json({
    mobile: '/broker/mobile/',
    system: '/broker/system/'
  });
};

/*
 * Registering mobile endpoint with system.
 * /broker/mobile/
 */
module.exports.register_mobile_endpoint = function (req, res) {
  switch (req.method.toLowerCase()){
    case 'put':
    case 'post':
      logger.debug.write('Registering mobile endpoint.');
      elasticsearch.saveMobileEndpoint(req.body).then(messageHandler(res), errorHandler(res));
      break;
    case 'delete':
      var error = 'Deleting from this endpoint is not available.';
      logger.error.write(error);
      error = error + ' Use /broker/mobile/:id instead.';
      res.json({ error: error });
      break;
    default:
    case 'get':
      logger.debug.write('Retrieving mobile endpoint registrations.');
      elasticsearch.getMobileEndpoints(req.query.limit, req.query.offset)
        .then(function (endpoints) { return _.map(endpoints, function (ep) { ep.endpoint = '/broker/mobile/' + ep.id; return ep; }); })
        .then(messageHandler(res), errorHandler(res));
      break;
  }
};

/*
 *  Endpoint for retrieving mobile endpoint information from broker.
 *  Also used for deleting the mobile endpoint registration.
 */
module.exports.mobile_endpoint = function (req, res) {
  switch (req.method.toLowerCase()){
    case 'put':
    case 'post':
      var error = 'Posting to this endpoint is not available.';
      logger.error.write(error);
      error = error + ' Use /broker/mobile instead.';
      Q({ error: error }).then(messageHandler(res), errorHandler(res));
      break;
    case 'delete':
      logger.debug.write('Removing mobile endpoint from broker.');
      elasticsearch.deleteMobileEndpoint(req.params.id).then(messageHandler(res), errorHandler(res));
      break;
    default:
    case 'get':
      logger.debug.write('Getting mobile endpoint from broker.');
      elasticsearch.getMobileEndpoint(req.params.id).then(messageHandler(res), errorHandler(res));
      break;
  }
};

/*
 * Endpoint for subscribing the mobile endpoint to a system endpoint.
 */
module.exports.subscribe_mobile_to_system = function (req, res) {
  // TODO: Information needed:
  // 1. Mobile ID
  // 2. [ { SystemID, Radius }]
  switch (req.method.toLowerCase()){
    case 'put':
    case 'post':
      logger.debug.write('Adding mobile endpoint subscriptions.');
      if (!req.params.mobileId || !req.params.systemId) {
        errorHandler(res)({ error: 'You must specify both a system and mobile id.' });
      }
      else if (!req.body.radius) {
        errorHandler(res)({ error: 'You must specify a radius (in meters) when subscribing to an endpoint.' });
      }
      else {
        subscriptions.subscribe(req.params.mobileId, req.params.systemId, req.body.radius, true)
          .then(messageHandler(res), errorHandler(res));
      }
      break;
    case 'delete':
      logger.debug.write('Removing mobile endpoint subscriptions.');
      if (!req.params.mobileId || !req.params.systemId) {
        errorHandler(res)({ error: 'You must specify both a system and mobile id.' });
      }
      else {
        subscriptions.subscribe(req.params.mobileId, req.params.systemId, null, false)
          .then(messageHandler(res), errorHandler(res));
      }
      break;
    default:
    case 'get':
      logger.debug.write('Retrieving endpoint subscriptions.');
      // Get one subscription
      if (req.params.systemId && req.params.mobileId) {
        logger.debug.write('Verifying mobile subscription to system.');
        subscriptions.getMobileSubscriptions(req.params.mobileId)
          .then(function (systemEndpoints) {
            logger.debug.write(systemEndpoints);
            return systemEndpoints && systemEndpoints[0];
          }).then(messageHandler(res), errorHandler(res));
      }
      // Get all mobile endpoints subscribed to the specified system.
      if (req.params.systemId && !req.params.mobileId){
        logger.debug.write('Retrieving system subscriptions.');
        subscriptions.getSystemSubscriptions(req.params.systemId)
          .then(function (subscriptions) {
            logger.debug.write(subscriptions);
            return subscriptions;
          })
          .then(messageHandler(res), errorHandler(res));
      }
      // Get all system endpoints subscribed to the specified mobile.
      if (req.params.mobileId && !req.params.systemId){
        logger.debug.write('Retrieving mobile subscriptions.');
        subscriptions.getMobileSubscriptions(req.params.mobileId)
          .then(messageHandler(res), errorHandler(res));
      }
      if (!req.params.systemId && !req.params.mobileId){
        var error = 'A system or mobile id must be specified.';
        logger.error.write(error);
        errorHandler(res)({ error: error });
      }
      break;
  }
};

/*
 * Registering system endpoint with system broker.
 * /broker/system/
 */
module.exports.register_system_endpoint = function (req, res) {
  switch (req.method.toLowerCase()){
    case 'put':
    case 'post':
      logger.debug.write('Registering system endpoint.');
      elasticsearch.saveSystemEndpoint(req.body).then(messageHandler(res), errorHandler(res));
      break;
    case 'delete':
      var error = 'Deleting from this endpoint is not available.';
      logger.error.write(error);
      error = error + ' Use /broker/system/:id instead.';
      res.json({ error: error });
      break;
    default:
    case 'get':
      logger.debug.write('Retrieving system endpoint registrations.');
      elasticsearch.getSystemEndpoints(req.query.limit, req.query.offset)
        .then(function (endpoints) { return _.map(endpoints, function (ep) { ep.endpoint = '/broker/system/' + ep.id; return ep; }); })
        .then(messageHandler(res), errorHandler(res));
      break;
  }
};

/*
 * Endpoint for retrieving, and deleting a specific system endpoint from the datastore.
 */
module.exports.system_endpoint = function (req, res) {
  switch (req.method.toLowerCase()){
    case 'put':
    case 'post':
      var error = 'Posting to this endpoint is not available.';
      logger.error.write(error);
      error = error + ' Use /broker/system instead.';
      Q({ error: error }).then(messageHandler(res), errorHandler(res));
      break;
    case 'delete':
      logger.debug.write('Removing system endpoint from broker.');
      elasticsearch.deleteSystemEndpoint(req.params.id).then(messageHandler(res), errorHandler(res));
      break;
    default:
    case 'get':
      logger.debug.write('Getting system endpoint from broker.');
      elasticsearch.getSystemEndpoint(req.params.id).then(messageHandler(res), errorHandler(res));
      break;
  }
};
