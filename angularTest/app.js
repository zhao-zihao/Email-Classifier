
var app = angular.module('myemail', ['ngRoute']);

app.config(function ($routeProvider) {
    $routeProvider
      .when('/inbox', {
         templateUrl: 'views/inbox.html',
         controller: 'InboxCtrl',
         controllerAs: 'inbox'
      })
      .when('/inbox/email/:id', {
         templateUrl: 'views/email.html',
         controller: 'EmailCtrl',
         controllerAs: 'email'
      })
      .otherwise({
         redirectTo: '/inbox'
      });
});

function TestCtrl($scope) {
        $scope.title = 'Write a title here...';
      };