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
  PORT: env.PORT || 3000
};

// Freeze the object that it cannot be modified during runtime.
module.exports = Object.freeze(config);
