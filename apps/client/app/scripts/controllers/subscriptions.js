'use strict';
/*jshint -W055 */
angular.module('serviceBrokerApp')
.controller('SubscriptionCtrl',[ '$scope','config','brokerapi', 'lodash', '$timeout', 'moment', '$q',
  function ($scope, config, brokerapi, _, timeout, moment, $q) {
    $scope._ = _;
    $scope.timeout = timeout;
    $scope.moment = moment;
    $scope.$q = $q;

    function retrieveEndpoints () {
      brokerapi.mobile.getList().then(function (response) {
        $scope.mobile_endpoints = response;
      });

      brokerapi.system.getList().then(function (response) {
        $scope.system_endpoints = response;
      });

      timeout(retrieveEndpoints, 30000);
    }

    $scope.selectME = function (index) {
      if (index === $scope.selected_mobile_index) {
        $scope.selected_mobile_index = undefined;
      }
      else {
        $scope.selected_mobile_index = index;
      }
    };

    $scope.selectedME = function (index) {
      return $scope.selected_mobile_index === index;
    };

    $scope.selectSE = function (index) {
      if (index === $scope.selected_system_index) {
        $scope.selected_system_index = undefined;
      }
      else {
        $scope.selected_system_index = index;
      }
    };

    $scope.selectedSE = function (index) {
      return $scope.selected_system_index === index;
    };

    $scope.validate = function () {
      var valid = $scope.selected_system_index !== undefined &&
        $scope.selected_mobile_index !== undefined &&
        $scope.inputRadius !== undefined;
      var floatValue;
      try {
        floatValue = parseFloat($scope.inputRadius);
      }
      catch (e) {
        valid = false;
      }
      return valid && floatValue < 1000000000;
    };

    $scope.submit = function () {
      var system_id = $scope.system_endpoints[$scope.selected_system_index].id;
      var mobile_id = $scope.mobile_endpoints[$scope.selected_mobile_index].id;
      brokerapi.create_subscription(mobile_id, system_id, parseFloat($scope.inputRadius)).then(function (response) {
        console.log(response);
      }, function (error) {
        $scope.error = error;
        timeout(function () {
          $scope.error = undefined;
        }, 5000);
      });
    };

    retrieveEndpoints();
  }
]);