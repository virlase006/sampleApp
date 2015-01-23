'use strict';

/**
 * @ngdoc service
 * @name sampleAppApp.getTransactionDetailSvc
 * @description
 * # getTransactionDetailSvc
 * Service in the sampleAppApp.
 */
angular.module('sampleAppApp')
  .service('getTransactionDetailSvc',['$http', function ($http) {

  	return{getTransactions:getTransactions};
  	function getTransactions(accountId)
  	{
return  $http.get('data/'+accountId+'transactions'+'.json');

  	}
    // AngularJS will instantiate a singleton by calling "new" on this function
  }]);
