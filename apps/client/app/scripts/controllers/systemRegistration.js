'use strict';

angular.module('serviceBrokerApp')
.controller('SystemRegistrationCtrl',[ '$scope','config','brokerapi', 'lodash', '$timeout', 'moment',
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
      { title: 'SNS ARN', field: 'sns', visible: true, filter: { sns: 'text' } },
      { title: 'Device Latitude', field: 'position.latitude', visible: true, filter: { latitude: 'text' } },
      { title: 'Device Longitude', field: 'position.longitude', visible: true, filter: { longitude: 'text' } },
      { title: 'Timestamp', field: 'timestamp', visible: true, filter: { registeredDate: 'date' } },
      { title: 'Delete', visible: true, btn: true, btn_txt: 'Delete' }
    ];

    $scope.datas = [];

    function search () {
      $scope.prevData = $scope.datas;
      brokerapi.system.getList().then(function (response) {
        $scope.datas = response;
      });
      timeout(search, 10000);
    }

    $scope.submit = function () {
      var system = {
        id: $scope.inputIdentifier,
        name: $scope.inputName,
        position: {
          latitude: $scope.inputLatitude,
          longitude: $scope.inputLongitude
        },
        sns: $scope.inputSNS
      };
      brokerapi.system.post(system).then(function (response) {
        $scope.latest_response = response;
        $scope.datas.push(system);
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

    $scope.validatePosFloat = function (float, type) {
      var floatValue, valid = true;
      try {
        floatValue = parseFloat(float);
      } catch (e) {
        valid = false;
        $scope.error = type + ' must be a float between -180 and 180. Please revise.';
        timeout(function () {
          $scope.error = null;
        }, 5000);
      }
      if (floatValue > 180 || floatValue < -180) {
        valid = false;
        $scope.error = type + ' must be a float between -180 and 180. Please revise.';
        timeout(function () { $scope.error = null; }, 5000);
      }
      return { valid: valid, value: floatValue };
    };

    $scope.validate = function () {
      var valid = $scope.inputIdentifier !== undefined && $scope.inputIdentifier !== '';
      valid = valid && $scope.inputName !== undefined && $scope.inputName !== '';
      valid = valid && $scope.inputLatitude !== undefined && $scope.inputLatitude !== '';
      valid = valid && $scope.inputLongitude !== undefined  && $scope.inputLongitude !== '';
      valid = valid && $scope.inputSNS !== undefined && $scope.inputSNS !== '';
      valid = valid && $scope.validatePosFloat($scope.inputLongitude, 'Longitude').valid;
      valid = valid && $scope.validatePosFloat($scope.inputLatitude, 'Latitude').valid;
      return valid;
    };

    $scope.getFieldValue = function (data, field) {
      field = field || '';
      var properties = field.split('.');
      var result = data;
      _.forEach(properties, function (prop) {
        result = result[prop];
      });
      return result;
    };
    search();
  }
]);