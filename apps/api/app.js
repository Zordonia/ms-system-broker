'use strict';

var express, app, logger, compression,
  methodOverride, config, auth, allowCrossOrigin, url, bodyParser;

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

// API endpoints
var system_endpoint;
system_endpoint = require('./controllers/system_endpoint.js');

// Set up API calls
app.all('/system*', system_endpoint);

app.use(function errorHandler (err, req, res, next) {
  var e = { error: err };
  logger.error.write(e);
  res.json(500, e);
  next = next;
});

app.listen(config.PORT);

logger.info.write({
  message: 'api server instance started.',
  config: require('./utils/config')
} );
