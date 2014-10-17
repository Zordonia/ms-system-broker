'use strict';

angular
  .module( 'serviceBrokerApp', [
    'ngCookies',
    'ngSanitize',
    'ngRoute',
    'ui.router'
  ])
  .config(function ($urlRouterProvider, $stateProvider) {
    $urlRouterProvider.otherwise('/main');

    $stateProvider
      .state('base', {
        url: '/main',
        views: {
          '@': {
            templateUrl: 'views/main.html',
            controller: 'MainCtrl'
          }
        }
      });
  });