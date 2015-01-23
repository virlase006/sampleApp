

describe('Controller: AccountCtrl', function () {
var httpBackend, AccountCtrl,httpBackendMock;
var scope ,location,Ctrl, routeParams={};
routeParams={'acc':'A3'};

  // load the controller's module
  beforeEach(module('sampleAppApp'));

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($injector) {
     httpBackend = $injector.get('$httpBackend');
     scope =$injector.get('$rootScope').$new();
     Ctrl = $injector.get('$controller');

     location=$injector.get('$location');
    //routeParams.acc=3;
     httpBackendMock=httpBackend.
     when('GET','../data/'+ routeParams.acc +'.json')
     .respond([{
      'accountid':'A3', 
      'Bank':'Alhabib',
      'transactions':['t31','t32','t33'
      ]}]);
     httpBackendmock=httpBackend
     .when('GET','views/accounts.html')
     .respond({},{},{},{},{},{});

   
    createController = function() {
       return Ctrl('AccountCtrl', {
        $routeParams:{'acc':'A3'},
        '$scope' : scope,
        'httpBackEnd':httpBackend 
      });
     };
     var controller = createController(); 
  }));
 it('should test initialization of account controller', 
    function () {
       
        expect(scope.accounts).toBeDefined();
        expect(angular.isFunction(scope.getdetail)
          ).toBe(true);
  });
  it('should attach accountDetail', function () {

    httpBackend
    .expect('GET','../data/'+ routeParams.acc +'.json');
    expect(scope.accounts).toBeDefined();
    httpBackend.flush();
  });


    it('should return correct path for account',
     function () {
  scope.getdetail(3);
    expect(location.path()).toBe('/transactions');

  });
});
