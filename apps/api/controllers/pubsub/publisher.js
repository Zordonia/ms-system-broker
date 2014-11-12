'use strict';

var Q, logger, restler, url, config, querystring, _, AWS, sns;

Q = require('q');
logger = require('../../utils/logger').prefix('PUBLISHER.SYSTEM');
restler = require('restler-q');
url = require('url');
config = require('../../utils/config.js');
querystring = require('querystring');
_ = require('lodash');
var _sns = config.SNS_ARN;

module.exports = function (sns_topic_arn) {
  _sns = sns_topic_arn;
  AWS = require('aws-sdk');
  sns = new AWS.SNS({
    region: 'us-west-2',
    params: {
      endpoint: config.NOTIFICATION_URL
    },
    accessKeyId: config.AWS_ACCESSKEYID,
    secretAccessKey: config.AWS_SECRETACCESSKEY
  });
  return {
    publish: function (content) {
      var deferred = Q.defer();
      deferred.resolve({
        message: content
      });
      return deferred.promise.then( function (result) {
        logger.error.write(_sns);
        return Q.nfcall(sns.publish.bind(sns), {
          TopicArn: _sns,
          Message: JSON.stringify(result)
        });
      });
    }
  };
};
