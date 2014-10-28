'use strict';

var env, config;

// When deployed, retreive configurations from environment variables.
env = process.env;
/**
 * Config object for the entire application.
 */
config = {
  MODE: env.MODE || 'development',
  TOKEN: env.TOKEN || 'token',
  ELASTIC_SEARCH_APIS: env.ELASTIC_SEARCH_APIS || [ 'http://localhost:9200' ],
  PORT: env.PORT || 3000,
  MOBILEENDPOINT_QUEUE_URL: env.MOBILEENDPOINT_QUEUE_URL || 'https://sqs.us-west-2.amazonaws.com/036845378506/Mobile_Endpoint_Publication_Unfiltered',
  SYSTEMENDPOINT_QUEUE_URL: env.SYSTEMENDPOINT_QUEUE_URL || 'https://sqs.us-west-2.amazonaws.com/036845378506/System_Broker_Endpoint_Notifications',
  NOTIFICATION_URL: env.NOTIFICATION_URL || 'https://sqs.us-west-2.amazonaws.com/036845378506/Mobile_Endpoint_Publication_Filtered',
  AWS_ACCESSKEYID: '',
  AWS_SECRETACCESSKEY: '',
  SNS_ARN: env.SNS_ARN || 'arn:aws:sns:us-west-2:036845378506:Mobile_Publication_Filtered'
};

// Freeze the object that it cannot be modified during runtime.
module.exports = Object.freeze(config);
