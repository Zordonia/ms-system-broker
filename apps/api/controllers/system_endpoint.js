'use strict';

var Q, logger, restler, url, config, querystring, _;

Q = require('q');
logger = require('../utils/logger');
restler = require('restler-q');
url = require('url');
config = require('../utils/config.js');
querystring = require('querystring');
_ = require('lodash');

module.exports = function (req, res) {
  res.json({ message: 'Test' });
};
