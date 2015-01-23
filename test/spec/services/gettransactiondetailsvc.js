'use strict';

describe('Service: getTransactionDetailSvc', function () {

  // load the service's module
  beforeEach(module('sampleAppApp'));

  // instantiate service
  var getTransactionDetailSvc;
  beforeEach(inject(function (_getTransactionDetailSvc_) {
    getTransactionDetailSvc = _getTransactionDetailSvc_;
  }));

  it('should do something', function () {
    expect(!!getTransactionDetailSvc).toBe(true);
  });

});
