'use strict';

var Q, config, logger;

Q = require('q');
config = require('../utils/config.js');
logger = require('../utils/logger');

var request_token = config.TOKEN;

// Exract a token from the request.
var extractToken = function (req) {
  var token = req.get(request_token);
  if (token && token != null && token !== 'null') {
    return token;
  }
  else {
    throw {
      message: 'There is no token in the current request.'
    };
  }
};

// Parses the token from the request, and adds it to the session if valid.
// (For now, all tokens are valid, they just must be provided.)
var sessionParser = function (req, res, next) {
  Q.fcall(extractToken, req)
  .then(function (token) {
    return Q({ valid: true, token: token })
    .then(function (session) {
      req.session = session;
      return session;
    }, logger.warn.write);
  }, logger.debug.write)
  .finally(next);
};

// Verifies that the session has been set, and is valid.
var ensureSession = function (req, res, next) {
  var warning;
  if (req.session && req.session.valid) {
    logger.info.write('Token accepted, session is valid.');
    next();
  }
  else {
    warning = {
      message: 'There must be a valid session to access this content.',
      url: req.url,
      method: req.method,
      body: req.body
    };
    res.json(401, warning);
  }
};

module.exports = {
  sessionParser: function () {
    return sessionParser;
  },
  ensureSession: function () {
    return ensureSession;
  }
};
