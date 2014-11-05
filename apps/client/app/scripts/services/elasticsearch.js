'use strict';

angular.module('serviceBrokerApp').service('es', function (esFactory) {
  return esFactory({
    host: 'localhost:9200'
  });
});