'use strict';

var Q, logger, config, AWS, sqs, checkQueue, deleteMessage,
  run, processMessageBatch, processMessageRetrievalFailure,
  processMessage, publisher;

logger = require('../../utils/logger.js').prefix('SUBSCRIBER.SYSTEM');
Q = require('q');
publisher = require('./publisher.js');
config = require('../../utils/config.js');
AWS = require('aws-sdk');
sqs = new AWS.SQS({
  region: 'us-west-2',
  params: {
    QueueUrl: config.SYSTEMENDPOINT_QUEUE_URL
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
  logger.debug.write('Processing message: ' + message.Body);
  var receipt;
  receipt = message.ReceiptHandle;
  // TODO: Process message
  Q(message)
    .then( function () {
      logger.debug.write('Message processed: ' + message.Body);
      deleteMessage(receipt);
    },
    function (err) {
      logger.error.write(err);
    }
  );
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
    .delay(5000)
    .finally(run);
};

exports.start = function (delay) {
  setTimeout(run, delay);
};
