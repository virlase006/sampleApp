'user strict'

describe('Controller: UserCtrl', function () {

  // load the controller's module
  beforeEach(module('sampleAppApp'));
  var httpBackend, UserCtrl,httpBackendMock,  scope,location;



  // Initialize the controller and a mock scope
  beforeEach(inject(function ($injector) {
      httpBackend = $injector.get('$httpBackend');
      scope =  $injector.get('$rootScope').$new();
      location=$injector.get('$location');

      httpBackendMock=httpBackend.when('GET','data/users.json').respond([{},{},{},{},{},{}]);
      httpBackendMock=httpBackend.when('GET','views/homepage.html').respond({},{},{},{},{},{});

    var Ctrl = $injector.get('$controller');

    createController = function() {
       return Ctrl('UserCtrl', {'$scope' : scope,'httpBackEnd':httpBackend });
       };   

    var controller = createController();
  
  }));

  it('should test initialization of user controller', function () {
       
        expect(scope.users).toBeDefined();
        expect(angular.isFunction(scope.getAcc)).toBe(true);
  });
  it('should attach a list users', function () {
    
        httpBackend.expect('GET','data/users.json');
    
  
        httpBackend.flush();
        expect(scope.users.length).toBe(6);

 
  });
   it('should add id to route params', function () {   
        
        var user={'name':'virlla','id':'u1','accountid':'A1'};
        scope.getAcc(user);
        expect(location.path()).toBe('/accounts');

 
  });
    
});


