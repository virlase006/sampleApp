'use strict';

/**
 * @ngdoc directive
 * @name sampleAppApp.directive:addTrans
 * @description
 * # addTrans
 */
angular.module('sampleAppApp')
  .directive('addTrans', function () {
  	return {
    	restrict: 'E',
    	templateUrl:'views/addtrans.html',
    	controller:'TransCtrl'
  	};
  });
