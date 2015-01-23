'use strict';

describe('Filter: dateFormat', function () {

  // load the filter's module
  beforeEach(module('sampleAppApp'));

  // initialize a new instance of the filter before each test
  var dateFormat;
  beforeEach(inject(function ($filter) {
    dateFormat = $filter('dateFormat');
  }));

  it('should return the correct Format date"', function () {
    var date2=new Date('Aug 9, 1995');
    expect(dateFormat(date2)).toBe('09-08-1995');
  });

});
