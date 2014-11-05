'use strict';

var Q, logger, config, AWS, sqs, checkQueue, deleteMessage,
  run, processMessageBatch, processMessageRetrievalFailure,
  processMessage, publisher, elasticsearch;

logger = require('../../utils/logger.js').prefix('SUBSCRIBER.MOBILE');
Q = require('q');
publisher = require('./publisher.js');
config = require('../../utils/config.js');
elasticsearch = require('../elasticsearch/elasticsearch.js');

AWS = require('aws-sdk');
sqs = new AWS.SQS({
  region: 'us-west-2',
  params: {
    QueueUrl: config.MOBILEENDPOINT_QUEUE_URL
  },
  accessKeyId: config.AWS_ACCESSKEYID,
  secretAccessKey: config.AWS_SECRETACCESSKEY
});

checkQueue = function () {
  logger.debug.write('Polling queue.');
  return Q.nfcall(sqs.receiveMessage.bind(sqs), {
    MaxNumberOfMessages: 5
  });
};

deleteMessage = function (receiptHandle) {
  logger.debug.write('Removing message from queue: ' + receiptHandle);
  var params = {
    ReceiptHandle: receiptHandle
  };
  Q.nfcall(sqs.deleteMessage.bind(sqs), params).then(function () {
    logger.debug.write('Message removed. Receipt Handle: ' + receiptHandle);
  },
  function (err) {
    logger.error.write(err);
  });
};

processMessage = function (message) {
  logger.debug.write('Processing message.');
  var messageJSON;
  try {
    message.Body = JSON.parse(message.Body);
    messageJSON = JSON.parse(message.Body.Message);
  }
  catch (e) {
    logger.error.write(e.message);
  }
  var receipt;
  receipt = message.ReceiptHandle;
  elasticsearch.saveMobileMessage(messageJSON).
    then(function (result) {
      // TODO: Add filtering
      return publisher.publish(message.Body)
        .then( function () {
          logger.debug.write('Message processed: ' + JSON.stringify(result));
          deleteMessage(receipt);
        },
        function (err) {
          logger.error.write(err);
        }
      );
    });
};

processMessageBatch = function (data) {
  logger.debug.write('Processing message batch.');
  var i;
  if (data.Messages) { // Assure that we have multiple messages
    for (i = 0; i < data.Messages.length; i++) {
      // Process each message.
      processMessage(data.Messages[i]);
    }
  }
};

processMessageRetrievalFailure = function (error) {
  logger.error.write(error);
};

run = function () {
  checkQueue()
    .then(processMessageBatch, processMessageRetrievalFailure)
    .delay(config.POLL_DELAY)
    .finally(run);
};

exports.start = function (delay) {
  setTimeout(run, delay);
};

// var m = '{' +
//   '"Type" : "Notification",' +
//   '"MessageId" : "8f518505-2f38-53b5-9adf-c9d6870e0ba1",' +
//   '"TopicArn" : "arn:aws:sns:us-west-2:036845378506:Mobile_Publication",' +
//   '"Message" : "{\"message\":{\"id\":\"12345\",\"mobileId\":\"Test\",\"timestamp\":\"{{$timestamp}}\",\"position\":{\"timestamp\":\"{{$timestamp}}\",\"previousPosition\":{\"timestamp\":\"{{$timestamp}}\",\"latitude\":\"100\",\"longitude\":\"100\"},\"latitude\":\"101\",\"longitude\":\"101\"}}}",' +
//   '"Timestamp" : "2014-11-05T04:22:14.626Z",' +
//   '"SignatureVersion" : "1",' +
//   '"Signature" : "hxisgr36+0HLydvj7x4k7QiBCWdiixhbwI3toVGz1woxeYROlPWoeOXnFeoK0T/G6ioXVSRRx886BkrqEWnjXSenWZ3EKDMHVkvF9Vebr6LRTGEungpMx1Iy6aZHOQBSO/gA/s5fWIcQbspfZE3q5crsRLigPiPuo/jHzhwDGD1bfCwMIbWO/95lPV7i9Rgunsj1exkXXJSOkZJqrEl6Zr59i3syflYO8BlRnPj+F0M6e+yDCEwehMYO3KY6kwerpBwVAwvTaxOfNG9l2Ow7E2i/7TCZ8bHl62iMMBKcuLiGTBCE/Zjad9IvoXvNRPCXtS98KX3fFC/tpSEm/925Eg==",' +
//   '"SigningCertURL" : "https://sns.us-west-2.amazonaws.com/SimpleNotificationService-d6d679a1d18e95c2f9ffcf11f4f9e198.pem",' +
//   '"UnsubscribeURL" : "https://sns.us-west-2.amazonaws.com/?Action=Unsubscribe&SubscriptionArn=arn:aws:sns:us-west-2:036845378506:Mobile_Publication:eb7d34a5-413a-4efd-b851-61264417d550"' +
// '}';
// try{

// var x = JSON.parse(m);
// } catch (e) {
//   console.error(e.toString());
// }

// console.log(x);

// var s = '{"message": "{"message":{"id":"12345","mobileId":"Test","timestamp":"{{$timestamp}}","position":{"timestamp":"{{$timestamp}}","previousPosition":{"timestamp":"{{$timestamp}}","latitude":"100","longitude":"100"},"latitude":"101","longitude":"101"}}}}"';


// console.log(JSON.parse(s));
