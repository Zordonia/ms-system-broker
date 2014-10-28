'use strict';

var Q, logger, restler, url, config, querystring, _, AWS, sns;

Q = require('q');
logger = require('../../utils/logger').prefix('PUBLISHER.SYSTEM');
restler = require('restler-q');
url = require('url');
config = require('../../utils/config.js');
querystring = require('querystring');
_ = require('lodash');

AWS = require('aws-sdk');
sns = new AWS.SNS({
  region: 'us-west-2',
  params: {
    endpoint: config.NOTIFICATION_URL
  },
  accessKeyId: config.AWS_ACCESSKEYID,
  secretAccessKey: config.AWS_SECRETACCESSKEY
});

module.exports = {
  publish: function (content) {
    var deferred = Q.defer();
    deferred.resolve({
      message: content
    });
    return deferred.promise.then( function (result) {
      return Q.nfcall(sns.publish.bind(sns), {
        TopicArn: config.SNS_ARN,
        Message: JSON.stringify(result)
      });
    });
  }
};
