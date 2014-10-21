'use strict';

angular.module('serviceBrokerApp')
.controller('MobileRegistrationCtrl',[ '$scope','config',
  function ($scope, config) {
    $scope.options = {
      types: [ { name: 'Android', id: 1 }, { name: 'iOS', id: 2 } ]
    };

    $scope.columns = [
      { title: 'Device Identifier', field: 'endpointid', visible: true, filter: { endpointid: 'text' } },
      { title: 'Device Name', field: 'name', visible: true, filter: { name: 'text' } },
      { title: 'Device Type', field: 'type', visible: true, filter: { type: 'text' } },
      { title: 'Authentication Identification', field: 'authentication', visible: true, filter: { authentication: 'text' } },
      { title: 'Device Position', field: 'position', visible: true, filter: { position: 'text' } },
      { title: 'Registered Date', field: 'registeredDate', visible: true, filter: { registeredDate: 'date' } }
    ];

    $scope.datas = [];

    for (var i = 0; i < 100; i++ ){
      var longitude = Math.random() * 180 * 2;
      var latitude = Math.random() * 180 * 2;
      var north = Math.random() > 0.5;
      var east = Math.random() > 0.5;
      $scope.datas.push({
        endpointid: i,
        name: 'Test Device ' + i,
        type: Math.random() > 0.5 ? 'Android' : 'iOS',
        authentication: '?',
        position: '( ' + longitude + (north ? ' N ,' : ' S ,') + latitude + (east ? ' E )' : ' W )'),
        registeredDate: new Date()
      });
    }

    console.log(config);
  }
]);