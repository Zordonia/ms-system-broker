'use strict';

var express, app, logger, compression,
  methodOverride, config, auth, allowCrossOrigin, url, bodyParser,
  sqsMobile, sqsSystem, _, config;

// Create express application
express = require('express');
app = express();

// Utilities
url = require('url');

compression = require('compression');
methodOverride = require('method-override');
config = require('./utils/config.js');
auth = require('./middleware/auth.js');
bodyParser = require('body-parser');
_ = require('lodash');
var debug = false;

// CORS
allowCrossOrigin = require('./middleware/cors');
app.use(allowCrossOrigin());

// logging setup
logger = require('./utils/logger.js');
app.use(require('morgan')({
  format: ':remote-addr - :response-time ms - [:date] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent"',
  stream: logger.info
}));

// Express Base app
app.use(compression());
app.use(methodOverride());
// Ensure session information (authorization)
app.use(auth.sessionParser());
app.use(auth.ensureSession());
// Body Parser will be used to view JSON request bodies.
app.use(bodyParser.json());

// SQS Mobile Endpoint Consumer
if (_.find(process.argv, function (arg) {
  return arg === 'd';
})){
  debug = true;
}

if (!debug){
  sqsMobile = require('./controllers/pubsub/mobile_subscriber.js');
  sqsMobile.start(0);

  // SQS Mobile Endpoint Consumer
  sqsSystem = require('./controllers/pubsub/system_endpoint_subscriber.js');
  sqsSystem.start(10000);
}

// API endpoints
var broker;
broker = require('./controllers/broker.js');

// Set up API calls
app.get('/broker/', broker.base);
app.get('/broker/mobile', broker.register_mobile_endpoint);
app.get('/broker/mobile/:id', broker.mobile_endpoint);
app.get('/broker/mobile/:mobileId/subscriptions', broker.subscribe_mobile_to_system);
app.get('/broker/mobile/:mobileId/subscriptions/:systemId', broker.subscribe_mobile_to_system);
app.get('/broker/system/:systemId/subscriptions', broker.subscribe_mobile_to_system);
app.get('/broker/system/:systemId/subscriptions/:mobileId', broker.subscribe_mobile_to_system);
app.get('/broker/system', broker.register_system_endpoint);
app.get('/broker/system/:id', broker.system_endpoint);

app.post('/broker/', broker.base);
app.post('/broker/mobile', broker.register_mobile_endpoint);
app.post('/broker/mobile/:id', broker.mobile_endpoint);
app.post('/broker/mobile/:mobileId/subscriptions', broker.subscribe_mobile_to_system);
app.post('/broker/mobile/:mobileId/subscriptions/:systemId', broker.subscribe_mobile_to_system);
app.post('/broker/system/:systemId/subscriptions', broker.subscribe_mobile_to_system);
app.post('/broker/system/:systemId/subscriptions/:mobileId', broker.subscribe_mobile_to_system);
app.post('/broker/system', broker.register_system_endpoint);
app.post('/broker/system/:id', broker.system_endpoint);

app.del('/broker/', broker.base);
app.del('/broker/mobile', broker.register_mobile_endpoint);
app.del('/broker/mobile/:id', broker.mobile_endpoint);
app.del('/broker/mobile/:mobileId/subscriptions', broker.subscribe_mobile_to_system);
app.del('/broker/mobile/:mobileId/subscriptions/:systemId', broker.subscribe_mobile_to_system);
app.del('/broker/system/:systemId/subscriptions', broker.subscribe_mobile_to_system);
app.del('/broker/system/:systemId/subscriptions/:mobileId', broker.subscribe_mobile_to_system);
app.del('/broker/system', broker.register_system_endpoint);
app.del('/broker/system/:id', broker.system_endpoint);

app.all('/', function (req, res) {
  res.json({
    broker: '/broker/'
  });
});

app.use(function errorHandler (err, req, res, next) {
  var e = { error: err };
  logger.error.write(e);
  res.json(500, e);
  next = next;
});

app.listen(config.PORT);

logger.info.write(JSON.stringify({
  message: 'api server instance started.',
  config: require('./utils/config')
}, null, 2));
