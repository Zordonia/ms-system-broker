'use strict';

angular.module('serviceBrokerApp')
.controller('SystemEndpointCtrl',[ '$scope','config', 'es', 'lodash', '$timeout', 'moment',
  function ($scope, config, es, _, timeout, moment) {
    $scope.message = 'System Endpoint';

    $scope.columns = [
      { title: 'Endpoint Identifier', field: 'endpointid', visible: true, filter: { endpointid: 'text' } },
      { title: 'Log Identifier', field: 'logid', visible: true, filter: { logid: 'text' } },
      { title: 'Message', field: 'message', visible: true, filter: { message: 'text' } },
      { title: 'Date', field: 'date', visible: true, filter: { date: 'date' } }
    ];

    $scope.epLogs = [];
    $scope.prevData = $scope.epLogs;

    $scope.newData = function (row) {
      return (!_.find($scope.prevData, function (data) {
        return data.logid === row.logid;
      }) && _.find($scope.epLogs, function (data) {
        return data.logid === row.logid;
      }));
    };

    var query = {
      query: {
        match_all: {}
      },
      sort: {
        timestamp: 'desc'
      },
      size: 10,
      from: 0
    };

    function searchES () {
      $scope.prevData = $scope.epLogs;
      console.log('Polling Elastic Search.');
      es.search({
        index: 'system',
        body: query
      }, function (error, response) {
        if (response) {
          $scope.epLogs = _.map(response.hits.hits, function (hit) {
            var mDate = moment(parseInt(hit._source.timestamp)).format();
            return {
              logid: hit._id,
              endpointid: hit._source.id,
              message: hit._source.message,
              date: mDate
            };
          });
        }
        timeout(searchES, 5000);
      });
    }
    searchES();
  }
]);