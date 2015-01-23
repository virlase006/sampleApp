'use strict';

describe('Service: getUserDataSvc', function () {

  // load the service's module
  beforeEach(module('sampleAppApp'));

  // instantiate service
  var getUserDataSvc;
  beforeEach(inject(function (_getUserDataSvc_) {
    getUserDataSvc = _getUserDataSvc_;
  }));

  it('should do something', function () {
    expect(!!getUserDataSvc).toBe(true);
  });

});
