'use strict';

/**
 * @ngdoc overview
 * @name sampleAppApp
 * @description
 * # sampleAppApp
 *
 * Main module of the application.
 */
angular
  .module('sampleAppApp', [
    'ngRoute'
  ])
  .config(function ($routeProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'views/homepage.html',
        controller: 'UserCtrl'
      }) .when('/accounts', {
        templateUrl: 'views/accounts.html',
        controller: 'AccountCtrl'
      }) .when('/Profile', {
        templateUrl: 'views/profile.html'
      }).when('/transactions', {
        templateUrl: 'views/trans.html',
        controller: 'TransCtrl'
      }) .otherwise({
        redirectTo: '/'
      });
  });
