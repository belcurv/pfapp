(function () {
    'use strict';

    angular.module('pfapp')

    .config(function ($routeProvider) {

        $routeProvider

            .when('/', {
                templateUrl: 'features/home/home.tpl.html',
                controller: 'fireCalcCtrl as vm'
            })
        
            .when('/fire-calc', {
                templateUrl: 'features/fire-calc/fire-calc.tpl.html',
                controller: 'fireCalcCtrl as vm'
            })
        
            .when('/commute-calc', {
                templateUrl: 'features/commute-calc/commute-calc.tpl.html',
                controller : 'commuteCalcController as vm'
            })

            .when('/net-worth', {
                templateUrl: 'features/net-worth/net-worth.tpl.html',
                controller: 'netWorthController as vm'
            })

            .when('/portfolio', {
                templateUrl: 'features/portfolio/portfolio.tpl.html',
                controller: 'portfolioController as vm'
            });

    });

}());