'use strict';

/**
 * @ngdoc service
 * @name sampleAppApp.getAccountSvc
 * @description
 * # getAccountSvc
 * Service in the sampleAppApp.
 */
angular.module('sampleAppApp')
  .service('getAccountSvc', ['$http',function ($http) {

  	return{

  		getAccount: getAccount
  	};
  	function getAccount(accountId)
  	{

  	return	$http.get('../data/'+ accountId +'.json');	
		
  	}
    // AngularJS will instantiate a singleton by calling "new" on this function
  }]);
