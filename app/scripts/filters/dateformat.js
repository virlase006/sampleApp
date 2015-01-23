'use strict';

/**
 * @ngdoc filter
 * @name sampleAppApp.filter:dateFormat
 * @function
 * @description
 * # dateFormat
 * Filter in the sampleAppApp.
 */
angular.module('sampleAppApp')
  .filter('dateFormat', function (dateFilter) {
    return function (input) {
		var _date;
     	return _date =dateFilter(input, 'dd-MM-yyyy');
     
    };
});
