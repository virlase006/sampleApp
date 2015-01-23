'use strict';

/**
 * @ngdoc service
 * @name sampleAppApp.getUserDataSvc
 * @description
 * # getUserDataSvc
 * Service in the sampleAppApp.
 */
angular.module('sampleAppApp')
  .service('getUserDataSvc', ['$http',function ($http) {
  	return {
  		getUsers:getUsers
  	};
  	function  getUsers()
  	{
     
 return $http.get('data/users.json');
  	}
    // AngularJS will instantiate a singleton by calling "new" on this function
  }]);
