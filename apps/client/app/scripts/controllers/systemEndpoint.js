'use strict';

angular.module('serviceBrokerApp')
.controller('SystemEndpointCtrl',[ '$scope','config',
  function ($scope, config) {
    $scope.message = 'System Endpoint';

    $scope.columns = [
      { title: 'Endpoint Identifier', field: 'endpointid', visible: true, filter: { endpointid: 'text' } },
      { title: 'Log Identifier', field: 'logid', visible: true, filter: { logid: 'text' } },
      { title: 'Message', field: 'message', visible: true, filter: { message: 'text' } },
      { title: 'Status', field: 'status', visible: true, filter: { status: 'text' } },
      { title: 'Date', field: 'date', visible: true, filter: { date: 'date' } }
    ];

    $scope.epLogs = [
      { endpointid: 1, logid: 1, message: 'This is a test message.', status: 'Started', datetime: new Date() },
      { endpointid: 1, logid: 1, message: 'This is a test message.', status: 'Performing Task', datetime: new Date() },
      { endpointid: 1, logid: 2, message: 'This is a test message.', status: 'Started', datetime: new Date() },
      { endpointid: 1, logid: 1, message: 'This is a test message.', status: 'Ended', datetime: new Date() },
      { endpointid: 2, logid: 3, message: 'This is a test message.', status: 'Started', datetime: new Date() },
      { endpointid: 3, logid: 2, message: 'This is a test message.', status: 'Ended', datetime: new Date() },
      { endpointid: 4, logid: 3, message: 'This is a test message.', status: 'Started', datetime: new Date() },
      { endpointid: 2, logid: 3, message: 'This is a test message.', status: 'Ended', datetime: new Date() },
      { endpointid: 3, logid: 3, message: 'This is a test message.', status: 'Ended', datetime: new Date() },
      { endpointid: 2, logid: 3, message: 'This is a test message.', status: 'Ended', datetime: new Date() },
      { endpointid: 2, logid: 3, message: 'This is a test message.', status: 'Ended', datetime: new Date() },
      { endpointid: 4, logid: 3, message: 'This is a test message.', status: 'Ended', datetime: new Date() },
    ];

    console.log(config);
  }
]);