'use strict'
/*
* File for communication with elastic search back end API.
*/
var elasticsearch, config;

elasticsearch = require('elasticsearch');
config = require('../utils/config');

// Create a client for elasticsearch using the configured APIs
var client = elasticsearch.Client({
  hosts: config.ELASTIC_SEARCH_APIS
});

module.exports = client;
