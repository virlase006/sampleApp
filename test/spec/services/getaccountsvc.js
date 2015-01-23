'use strict';

describe('Service: getAccountSvc', function () {

  // load the service's module
  beforeEach(module('sampleAppApp'));

  // instantiate service
  var getAccountSvc;
  beforeEach(inject(function (_getAccountSvc_) {
    getAccountSvc = _getAccountSvc_;
  }));

  it('should do something', function () {
    expect(!!getAccountSvc).toBe(true);
  });

});
