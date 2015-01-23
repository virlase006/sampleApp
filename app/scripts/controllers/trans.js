'use strict';

/**
 * @ngdoc function
 * @name sampleAppApp.controller:TransCtrl
 * @description
 * # TransCtrl
 * Controller of the sampleAppApp
 */
angular.module('sampleAppApp')
  .controller('TransCtrl', function (TransactionSvc,$scope,$http,$routeParams,$location) {
     $scope.trans=[];
  	 $http.get('data/'+$routeParams.acc+'transactions'+'.json').then(function(res1){
      
      $scope.trans= res1.data;
      $scope.trans.date=Date.parse($scope.trans.date)
      TransactionSvc.setTrans($scope.trans);
      //$scope.T= TransactionSvc.getTrans();

      }, 

      function(res1){
        console.log('an error has occured');
      });


    $scope.delete=(function(t){
      TransactionSvc.deleteTrans(t);
      $scope.trans=TransactionSvc.getTrans();
      });

    $scope.add=(function(t){ 
    
     TransactionSvc.addTrans(t);
     $scope.trans=TransactionSvc.getTrans();
    
      t.date='';
      t.type='';
      t.tid='';
    });

  
  });
