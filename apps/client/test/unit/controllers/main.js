'use strict';

describe('Controller: MainCtrl', function () {

  // load the controller's module
  beforeEach(module('contentProxyApp'));

  var MainCtrl, scope, session;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    session = { name: 'test' };
    MainCtrl = $controller('MainCtrl', {
      $scope: scope,
      session: session
    });
  }));

  it('this is a just a test', function () {
    expect(0).toBe(0);
  });
});