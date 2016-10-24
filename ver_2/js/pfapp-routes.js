(function () {
    'use strict';
    
    angular.module('pfapp')
    
        .config(function ($routeProvider) {
        
            $routeProvider

                .when('/', {
                    templateUrl: 'templates/fire-calc.tpl.html',
                    controller : 'pfappController'
                })

                .when('/net-worth', {
                    templateUrl: 'templates/net-worth.tpl.html',
                    controller : 'pfappController'
                })

                .when('/portfolio', {
                    templateUrl: 'templates/portfolio.tpl.html',
                    controller : 'pfappController'
                });

        });
    
}());