'use strict';

angular.module('sampleAppApp')
  .controller('UserCtrl', function ($scope,$route,$http,$location,getUserDataSvc) {
    $scope.users=[];
    getUserDataSvc.getUsers().then(function(res){
    	$scope.users = res.data;
    }, 
      function(res){
    	console.log('an error has occured');
      });

    $scope.getAcc=(function(user)
	 {
	 $location.search({'user':user.id ,'acc':user.accountid}).path('/accounts');

	 });
    $scope.getProfile=(function(user)
   {
   $location.search('user',user.id ).path('/Profile');

   });

  });
