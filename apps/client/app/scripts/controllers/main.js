'use strict';

angular.module('serviceBrokerApp')
.controller('MainCtrl',[ '$scope','config',
  function ($scope, config) {
    $scope.message = 'Broker Front End Application';
    console.log(config);
  }
]);