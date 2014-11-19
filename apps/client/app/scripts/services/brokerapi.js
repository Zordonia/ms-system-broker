'use strict';

angular.module('serviceBrokerApp').factory('brokerapi', [ 'Restangular', 'config', '$http', function (Restangular, CONFIG, $http) {
  $http.defaults.headers.common.token = '_token';
  Restangular.setBaseUrl(CONFIG.brokerAPI);
  Restangular.setDefaultHeaders({
    token: '_token',
    'Content-Type': 'application/json'
  });
  var mobile_endpoints = Restangular.all('mobile');
  var system_endpoints = Restangular.all('system');
  var subscriptions = Restangular.all('subscriptions');

  return {
    mobile: mobile_endpoints,
    system: system_endpoints,
    subscriptions: subscriptions,
    create_subscription: function (mobileId, systemId, radius) {
      return $http.post(CONFIG.brokerAPI + '/mobile/' + mobileId + '/subscriptions/' + systemId, { radius: radius });
    }
  };
} ]);