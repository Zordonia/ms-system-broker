'use strict';

var Q, logger, restler, url, config, elasticsearch, moment, _;

Q = require('q');
logger = require('../../utils/logger').prefix('ELASTICSEARCH.CONTROLLER');
restler = require('restler-q');
url = require('url');
config = require('../../utils/config.js');
_ = require('lodash');
moment = require('moment');
elasticsearch = require('../../datastore/elasticsearch.js');

var validatePosition = function (position) {
  var message = {};
  message.error = !position ? 'Position is not defined.' : message.error;
  message.error = !message.error && !position.longitude ? 'Longitude is not defined.' : message.error;
  message.error = !message.error && !position.latitude ? 'Latitude is not defined.' : message.error;
  var longitude = parseFloat(position && position.longitude);
  message.error = !message.error && isNaN(longitude) ? 'Longitude must be a number.' : message.error;
  message.error = !message.error && (longitude > 180 || longitude < -180) ?
  'Longitude must be between 180 and -180 degrees. Longitude value: ' + longitude  : message.error;

  var latitude = parseFloat(position && position.latitude);
  message.error = !message.error && isNaN(latitude) ? 'Latitude must be a number.' : message.error;
  message.error = !message.error && (latitude > 180 || latitude < -180) ?
  'Latitude must be between 180 and -180 degrees. Latitude value: ' + latitude : message.error;
  return message;
};

var validateSystemEndpoint = function (endpoint) {
  var message = {};
  message.error = !endpoint ? 'Endpoint is not defined.' : message.error;
  message.error = !message.error && !endpoint.id ? 'Must provide identifier for endpoint.' : message.error;
  message.error = !message.error && !endpoint.name ? 'Must provide name for endpoint.' : message.error;
  var positionValid = validatePosition(endpoint && endpoint.position);
  message.error = !message.error && positionValid.error  ? positionValid.error : message.error;

  message.error = !message.error && !endpoint.sns ? 'Must provide SNS ARN for system endpoint.' : message.error;
  return message;
};

var errorHandler = function (error) {
  logger.error.write(error);
  return error;
};

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
    }, errorHandler);
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
    }, errorHandler);
  },
  saveMobileEndpoint: function (endpoint) {
    if (!endpoint || !endpoint.id || !endpoint.name || !endpoint.type || !endpoint.authentication) {
      var clarify = !endpoint ? 'Endpoint is not defined.' :
        !endpoint.id ? 'Must provide identifier for endpoint.' :
          !endpoint.name ? 'Must provide name for endpoint.' :
            !endpoint.type ? 'Must provide type for endpoint.' :
              !endpoint.authentication ? 'Must provide authentication for endpoint.' :
                'Unknown error occurred.';
      return Q({ error: 'Mobile endpoint is not well defined.', reason: clarify });
    }
    endpoint.timestamp = moment().format();
    return elasticsearch.index({
      index: 'mobile',
      type: 'registration',
      id: endpoint.id,
      body: endpoint
    }).then( function (resp) {
      logger.debug.write('Mobile endpoint registered.');
      return resp;
    }, errorHandler);
  },
  saveSystemEndpoint: function (endpoint) {
    var endpointValid = validateSystemEndpoint(endpoint);
    if (endpointValid.error) {
      return Q({ error: 'System endpoint is not well defined.', reason: endpointValid.error });
    }
    endpoint.timestamp = moment().format();
    return elasticsearch.index({
      index: 'system',
      type: 'registration',
      id: endpoint.id,
      body: endpoint
    }).then( function (resp) {
      logger.debug.write('System endpoint registered.');
      return resp;
    }, errorHandler);
  },
  mobileSubscription: function (mobileId, systemId, radius, save) {
    var body = {};
    body[systemId] = { subscribed: save, date: new Date() };
    if (save) {
      body[systemId].radius = radius;
    }
    return elasticsearch.update({
      index: 'mobile',
      type: 'subscription',
      id: mobileId,
      body: {
        doc: body,
        doc_as_upsert: true
      }
    }).then(function (resp) {
      logger.debug.write('Mobile subscription stored.');
      return resp;
    }, errorHandler);
  },
  deleteMobileEndpoint: function (id) {
    if (!id) {
      return Q({ error: 'Mobile id must be specified.' });
    }
    return elasticsearch.delete({
      index: 'mobile',
      type: 'registration',
      id: id
    }).then (function (resp) {
      logger.debug.write('Mobile endpoint deleted.');
      return { success: resp && resp.found };
    }, errorHandler);
  },
  deleteSystemEndpoint: function (id) {
    if (!id) {
      return Q({ error: 'System id must be specified.' });
    }
    return elasticsearch.delete({
      index: 'system',
      type: 'registration',
      id: id
    }).then (function (resp) {
      logger.debug.write('System endpoint deleted.');
      return { success: resp && resp.found };
    }, errorHandler);
  },
  getMobileEndpoint: function (id) {
    return elasticsearch.get({
      index: 'mobile',
      type: 'registration',
      id: id
    }).then (function (resp) {
      logger.debug.write('Mobile endpoint retrieved.');
      return resp && resp._source ? resp._source : resp;
    }, errorHandler);
  },
  getSystemEndpoint: function (id) {
    return elasticsearch.get({
      index: 'system',
      type: 'registration',
      id: id
    }).then (function (resp) {
      logger.debug.write('System endpoint retrieved.');
      return resp && resp._source ? resp._source : resp;
    }, errorHandler);
  },
  getMobileSubscriptions: function (mobileId) {
    return elasticsearch.get({
      index: 'mobile',
      type: 'subscription',
      id: mobileId
    }).then(function (resp) {
      logger.debug.write('Mobile subscriptions retrieved.');
      var subscriptions = [];
      var response = resp;
      if (resp && resp._source){
        response = resp._source;
      }
      for (var prop in response) {
        logger.debug.write(response[prop]);
        if (response.hasOwnProperty(prop) && response[prop] && response[prop].subscribed === true) {
          response[prop].systemId = prop;
          subscriptions.push( response[prop] );
        }
      }
      var systemEndpoints = _.map(subscriptions, function (sub) {
        return module.exports.getSystemEndpoint(sub.systemId).then(function (r) {
          sub.system_endpoint = r;
          return sub;
        }, _.identity);
      });
      return Q.all(systemEndpoints).then(function (resp) {
        return resp;
      }, _.identity);
    });
  },
  getMobileEndpoints: function (limit, offset) {
    return elasticsearch.search({
      index: 'mobile',
      type: 'registration',
      body: {
        query: {
          match_all: {}
        }
      },
      size: limit || 10,
      from: offset
    }).then( function (resp) {
      logger.debug.write('Mobile endpoints retrieved.');
      var response = resp;
      if (resp.hits && resp.hits.hits) {
        response = _.map(resp.hits.hits, function (hit) {
          return hit._source;
        });
      }
      return response;
    });
  },
  getSystemEndpoints: function (limit, offset) {
    return elasticsearch.search({
      index: 'system',
      type: 'registration',
      body: {
        query: {
          match_all: {}
        }
      },
      size: limit || 10,
      from: offset
    }).then (function (resp) {
      logger.debug.write('System endpoints retrieved.');
      var response = resp;
      if (resp.hits && resp.hits.hits) {
        response = _.map(resp.hits.hits, function (hit) {
          return hit._source;
        });
      }
      return response;
    });
  }
};
