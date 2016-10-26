(function () {
    'use strict';

    angular.module('pfapp')

    .config(function ($routeProvider) {

        $routeProvider

            .when('/', {
                templateUrl: 'templates/fire-calc.tpl.html',
                controller: 'pfappController as vm'
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