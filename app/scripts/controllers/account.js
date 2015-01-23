'use strict';

/**
 * @ngdoc function
 * @name sampleAppApp.controller:AccountCtrl
 * @description
 * # AccountCtrl
 * Controller of the sampleAppApp
 */
angular.module('sampleAppApp')
  .controller('AccountCtrl', function (getAccountSvc,$scope,$http,$routeParams,$location) {
    $scope.accounts=[];
    $scope.ts=[{'tid':'145'}];
    getAccountSvc.getAccount($routeParams.acc).then(function(res){	
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
