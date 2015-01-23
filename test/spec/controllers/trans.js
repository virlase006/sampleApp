'use strict';

describe('Controller: TransCtrl', function () {
  //var MockTSvc={};
  // load the controller's module
  beforeEach(module('sampleAppApp') );

  var httpBackend,httpBackendMock,scope;
  var location,controller;
  var TransCtrl;
  var routeParams={};
  var sampletransaction=[{
    'tid':'t12',
    'type':"withdraw",
    'date':'12/13/2014'
  }];
  routeParams={'acc':'A3'};

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($injector ,TransactionSvc) {
    
    httpBackend = $injector.get('$httpBackend');
    controller=$injector.get('$controller');
    scope = $injector.get('$rootScope').$new();
    location=$injector.get('$location');
    TransactionSvc=TransactionSvc;

    httpBackendMock=httpBackend
    .when('GET','data/'+ routeParams.acc +'transactions.json')
    .respond(sampletransaction);
    httpBackendMock=httpBackend
    .when('GET','views/trans.html')
    .respond({},{},{},{},{},{});

    createController = function() {
    return controller('TransCtrl', {
      TransactionSvc:TransactionSvc,
      $routeParams:{'acc':'A3'},
      '$scope' : scope,
      'httpBackEnd':httpBackend 
    });
  
     };
    var initController = createController();
  }));
   it('should test initialization of account controller',
    function () {
       
        expect(scope.trans).toBeDefined();
        expect(angular.isFunction(scope.add))
        .toBe(true);
        expect(angular.isFunction(scope.delete))
        .toBe(true);
  });


  it('should show list of transactions',
   function () {
  
    httpBackend
    .expect('GET','data/'+routeParams.acc+'transactions.json');
    httpBackend.flush();
    expect(scope.trans.length).toBe(1);
  });
  it('should return transactions', function () {
    
    httpBackend
    .expect('GET','data/'+routeParams.acc+'transactions.json');
    httpBackend.flush();
    scope.add([{
      'tid':'t12',
      'type':"withdraw",
      'date':'12/13/2014'
    }]);
    expect(scope.trans.length).toBe(2);
  });
  it('should delete given transactions', function () {
    httpBackend
    .expect('GET','data/'+routeParams.acc+'transactions.json');
    httpBackend.flush();
    scope.delete([{
      'tid':'t12',
      'type':"withdraw",
      'date':'12/13/2014'
    }]);
    expect(scope.trans.length).toBe(0);



  });

  });
 /* inject(function($q){
MockTSvc.data=[{'tid':'t12','type':"withdraw",'date':'12/13/2014'}];
 MockTSvc.getTrans = function() {
      var defer = $q.defer();

      defer.resolve(this.data);

      return defer.promise;
    };
  MockTSvc.setTrans= function(t) {
      var defer = $q.defer();

      this.data.push(t);
      defer.resolve(t);

      return defer.promise;
    };




  });*/