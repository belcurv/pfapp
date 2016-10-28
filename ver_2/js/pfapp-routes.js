(function () {
    'use strict';

    angular.module('pfapp')

    .config(function ($routeProvider) {

        $routeProvider

            .when('/', {
                templateUrl: 'templates/home.tpl.html',
                controller: 'pfappController as vm'
            })
        
            .when('/fire-calc', {
                templateUrl: 'templates/fire-calc.tpl.html',
                controller: 'pfappController as vm'
            })
        
            .when('/commute-calc', {
                templateUrl: 'templates/commute-calc.tpl.html',
                controller : 'pfappCommuteCalcController as vm'
            })

            .when('/net-worth', {
                templateUrl: 'templates/net-worth.tpl.html',
                controller: 'pfappStorageController as vm'
            })

            .when('/portfolio', {
                templateUrl: 'templates/portfolio.tpl.html',
                controller: 'pfappController as vm'
            });

    });

}());