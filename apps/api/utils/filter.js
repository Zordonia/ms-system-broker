'use strict';

var Q, logger, config, elasticsearch, _, gpsDistance;

Q = require('q');
logger = require('../utils/logger').prefix('subscriptions');
config = require('../utils/config.js');
elasticsearch = require('../controllers/elasticsearch/elasticsearch.js');
_ = require('lodash');
gpsDistance = require('gps-distance');

var withinRadius = function (se_radius, se_position, me_position) {
  se_position.longitude = parseFloat(se_position.longitude);
  se_position.latitude = parseFloat(se_position.latitude);

  me_position.longitude = parseFloat(me_position.longitude);
  me_position.latitude = parseFloat(me_position.latitude);
  var dKM = gpsDistance(se_position.longitude, se_position.latitude, me_position.longitude, me_position.latitude);
  var distance_meters = dKM * 1000;
  // Distance must be within 10% of radius
  var valid = distance_meters < 0.9 * se_radius;
  var reason = ' Calculated distance: ' + distance_meters + ' meters. Configured radius: ' + se_radius;
  return { valid: valid, reason: reason };
};

module.exports.filterMobilePublication = function (message, prev_message) {
  return elasticsearch.getMobileSubscriptions(message.mobileId)
    .then(function (subscriptions) {
      subscriptions = _.filter(subscriptions, function (sub) {
        var readyToSend = true && sub.system_endpoint.sns;
        var reason = !readyToSend ? ' SNS Endpoint not defined on system endpoint.' : '';
        var calcDist = withinRadius(sub.radius, sub.system_endpoint.position, message.position);
        reason = reason + calcDist.reason;
        readyToSend = readyToSend && calcDist.valid;
        /*
        * We're able to send to the system endpoint if the previous position was outside the radius,
        * and the current position is inside the radius.
        */
        var calcPreviousDist = withinRadius(sub.radius, sub.system_endpoint.position, prev_message.position);
        reason = reason + calcPreviousDist.reason;
        readyToSend = readyToSend && !calcPreviousDist.valid;
        logger.debug.write('Mobile publication recieved.\r\nPublication will ' +
          (readyToSend ? '' : 'not ') + 'be sent to system id ' + (sub.system_endpoint && sub.system_endpoint.id) + '.' +
            (readyToSend ? '' : '\r\nReason:' + reason ));
        return readyToSend;
      });
      return subscriptions;
    }, function (err) {
      logger.error.write(err);
      return [];
    });
};
