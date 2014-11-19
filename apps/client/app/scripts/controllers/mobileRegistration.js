'use strict';

angular.module('serviceBrokerApp')
.controller('MobileRegistrationCtrl',[ '$scope','config','brokerapi', 'lodash', '$timeout', 'moment',
  function ($scope, config, brokerapi, _, timeout, moment) {
    $scope._ = _;
    $scope.timeout = timeout;
    $scope.moment = moment;

    $scope.options = {
      types: [ { name: 'Android', id: 1 }, { name: 'iOS', id: 2 } ]
    };

    $scope.columns = [
      { title: 'Device Identifier', field: 'id', visible: true, filter: { id: 'text' } },
      { title: 'Device Name', field: 'name', visible: true, filter: { name: 'text' } },
      { title: 'Device Type', field: 'type', visible: true, filter: { type: 'text' } },
      { title: 'Authentication Identification', field: 'authentication', visible: true, filter: { authentication: 'text' } },
      { title: 'Timestamp', field: 'timestamp', visible: true, filter: { registeredDate: 'date' } },
      { title: 'Delete', visible: true, btn: true, btn_txt: 'Delete' }
    ];

    $scope.datas = [];

    function searchMobile () {
      $scope.prevData = $scope.datas;
      console.log('Polling Mobile Registrations...' + moment().format());
      brokerapi.mobile.getList().then(function (response) {
        $scope.datas = response;
      });
      timeout(searchMobile, 10000);
    }

    $scope.submit = function () {
      var mobile = {
        id: $scope.inputIdentifier,
        name: $scope.inputName,
        authentication: $scope.inputAuthentication,
        type: $scope.inputType
      };
      brokerapi.mobile.post(mobile).then(function (response) {
        $scope.latest_response = response;
        $scope.datas.push(mobile);
      }, function (error) {
        $scope.error = error;
        timeout(function () {
          $scope.error = null;
        }, 5000);
      });
    };

    $scope.delete = function (index) {
      $scope.datas[index].remove().then(function (response) {
        $scope.latest_response = response;
        $scope.datas.splice(index, 1);
      }, function (error) {
        $scope.error = error;
        timeout(function () {
          $scope.error = null;
        }, 5000);
      });
    };

    $scope.validate = function () {
      var valid = $scope.inputIdentifier && $scope.inputIdentifier !== '';
      valid = valid && $scope.inputName && $scope.inputName !== '';
      valid = valid && $scope.inputAuthentication && $scope.inputAuthentication !== '';
      valid = valid && $scope.inputType && $scope.inputType !== '';
      return valid;
    };

    searchMobile();
  }
]);