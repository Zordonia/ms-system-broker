'use strict';

var Q, logger, config, elasticsearch, _, gpsDistance;

Q = require('q');
logger = require('../utils/logger').prefix('subscriptions');
config = require('../utils/config.js');
elasticsearch = require('../controllers/elasticsearch/elasticsearch.js');
_ = require('lodash');
gpsDistance = require('gps-distance');

var withinRadius = function (se_radius, se_position, me_position) {
  var dKM = gpsDistance(se_position.longitude, se_position.latitude, me_position.longitude, me_position.latitude);
  var distance_meters = dKM * 1000;
  // Distance must be within 10% of radius
  var valid = distance_meters < 0.9 * se_radius;
  var reason = ' Calculated distance: ' + distance_meters + ' meters. Configured radius: ' + se_radius;
  return { valid: valid, reason: reason };
};

module.exports.filterMobilePublication = function (message) {
  return elasticsearch.getMobileSubscriptions(message.mobileId)
    .then(function (subscriptions) {
      subscriptions = _.filter(subscriptions, function (sub) {
        var readyToSend = true && sub.system_endpoint.sns;
        var reason = readyToSend ? ' SNS Endpoint not defined on system endpoint.' : '';
        var calcDist = withinRadius(sub.radius, sub.system_endpoint.position, message.position);
        reason = reason + calcDist.reason;
        readyToSend = readyToSend && calcDist.valid;
        logger.debug.write('Mobile publication recieved. Publication will ' +
          (readyToSend ? '' : 'not ') + 'be sent to system id ' + sub.systemId + '.' +
            (readyToSend ? '' : ' Reason:' + reason ));
        return readyToSend;
      });
      return subscriptions;
    }, function (err) {
      logger.error.write(err);
      return [];
    });
};
