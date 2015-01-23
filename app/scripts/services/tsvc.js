'use strict';

/**
 * @ngdoc service
 * @name sampleAppApp.TSvc
 * @description
 * # TSvc
 * Service in the sampleAppApp.
 */
angular.module('sampleAppApp').service('TransactionSvc', function () {
  	
	var trans = [];

	return {
		getTrans : getTrans,
		setTrans: setTrans,
		
		addTrans: addTrans,
		deleteTrans: deleteTrans
		}
	function setTrans(t){
		trans = angular.copy(t);
	}
	function getTrans(){
		return trans;
	}
 	function addTrans(t){

	trans.push(angular.copy(t));

	}
	function deleteTrans(t){

	return	trans.splice(trans.indexOf(t),1);
	
	}

    // AngularJS will instantiate a singleton by calling "new" on this function
 });
