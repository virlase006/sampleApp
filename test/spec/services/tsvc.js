'use strict';

describe('Service: TransactionSvc', function () {
  var TransactionSvc ,result;
  // load the service's module
  beforeEach(module('sampleAppApp'));

  // instantiate service

  beforeEach(inject(function (_TransactionSvc_) {
    TransactionSvc = _TransactionSvc_;
     TransactionSvc.setTrans([{'tid':'t12'},{'tid':'t12'}]);
  }));

  it('should do get Transactions', function () {
    result=TransactionSvc.getTrans();
    expect(result).toBeDefined();
  });

  it('should set transactions', function () {
    TransactionSvc.setTrans([{'tid':'t12'},{'tid':'t12'},{'tid':'t12'}]);
    result=TransactionSvc.getTrans();
    expect(result.length).toBe(3);
  });

  it('should add transactions', function () {
   
    TransactionSvc.addTrans({'tid':'t12'});
    result=TransactionSvc.getTrans();
    expect(result.length).toBe(3);
  });

  it('should delete transactions', function () {
   
    TransactionSvc.deleteTrans({'tid':'t12'});
    result=TransactionSvc.getTrans();
    expect(result.length).toBe(1);
  });

});
