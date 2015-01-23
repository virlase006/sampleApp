

describe('Directive: addTrans', function () {

  // load the directive's module
  beforeEach(module('sampleAppApp'));
  var element,
    scope;

//beforeEach(module('app/views/addtrans.html'));
  
  beforeEach(inject(function ($rootScope,$compile) {

    scope = $rootScope.$new();
    $compile=$compile;
  }));

  it('should make hidden element visible', inject(function ($compile) {
    element = angular.element('<add-trans></add-trans>');
    element = $compile(element)(scope);
 //   scope.$digest();
    expect(element.text()).toBe('<add-trans></add-trans>');
  }));
});
