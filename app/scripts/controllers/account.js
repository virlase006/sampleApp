'use strict';

/**
 * @ngdoc function
 * @name sampleAppApp.controller:AccountCtrl
 * @description
 * # AccountCtrl
 * Controller of the sampleAppApp
 */
angular.module('sampleAppApp')
  .controller('AccountCtrl', function ($scope,$http,$routeParams,$location) {
    $scope.accounts=[];
    $scope.ts=[{'tid':'145'}];
    $http.get('../data/'+ $routeParams.acc +'.json').then(function(res){	
		  $scope.accounts = res.data;
       
      
        //  $scope.trans=accounts.transactions;
      }, 

    function(res){
    	console.log('an error has occured');
      });

    $scope.getdetail=(function(acc)
    {
      $location.search('acc',acc.accountid).path('/transactions');

    });

  });
