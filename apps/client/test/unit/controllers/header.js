'use strict';

describe('Controller: HeaderCtrl', function () {

  // load the controller's module
  beforeEach(module('contentProxyApp'));

  var HeaderCtrl, scope, session, company;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    session = { name: 'test' };
    company = { name: 'test' };
    HeaderCtrl = $controller('HeaderCtrl', {
      $scope: scope,
      company: company,
      session: session
    });
  }));

  it('this is a just a test', function () {
    expect(0).toBe(0);
  });
});