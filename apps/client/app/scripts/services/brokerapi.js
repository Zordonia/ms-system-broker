'use strict';

angular.module('serviceBrokerApp').factory('brokerapi', [ 'Restangular', 'config', function (Restangular, CONFIG) {
  Restangular.setBaseUrl(CONFIG.brokerAPI);
  Restangular.setDefaultHeaders({
    token: '_token',
    'Content-Type': 'application/json'
  });
  var mobile_endpoints = Restangular.all('mobile');
  var system_endpoints = Restangular.all('system');

  return {
    mobile: mobile_endpoints,
    system: system_endpoints
  };
} ]);