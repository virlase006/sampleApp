'use strict';

/**
 * @ngdoc function
 * @name sampleAppApp.controller:UserprofileCtrl
 * @description
 * # UserprofileCtrl
 * Controller of the sampleAppApp
 */
angular.module('sampleAppApp')
  .controller('UserprofileCtrl', function ($routeParams,$http) {
 var vm=this;
 vm.profile=[];
   $http.get('data/profile'+$routeParams.user+'.json').then(function(res){
    	vm.profile = res.data;
    }, 
      function(res){
    	console.log('an error has occured');
      });
  });
