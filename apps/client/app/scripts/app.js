'use strict';

angular
  .module( 'serviceBrokerApp', [
    'ngCookies',
    'ngSanitize',
    'ngRoute',
    'ui.router',
    'ngTable',
    'elasticsearch',
    'ngLodash',
    'angularMoment'
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
    $stateProvider
      .state('se', {
        url: '/system-endpoint',
        views: {
          '@': {
            templateUrl: 'views/systemEndpoint.html',
            controller: 'SystemEndpointCtrl'
          }
        }
      });
    $stateProvider
      .state('mr', {
        url: '/mobile-registration',
        views: {
          '@': {
            templateUrl: 'views/mobileRegistration.html',
            controller: 'MobileRegistrationCtrl'
          }
        }
      });
  });