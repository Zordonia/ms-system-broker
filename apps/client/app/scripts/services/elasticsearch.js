'use strict';

angular.module('serviceBrokerApp').service('es', function (esFactory) {
  return esFactory({
    host: '54.68.156.164:9200'
  });
});