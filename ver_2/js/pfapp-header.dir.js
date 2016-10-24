(function () {
    'use strict';
    
    angular.module('pfapp')
    
        .directive('pfappHeader', function () {
        
            return {
                restrict: 'AE',
                templateUrl: 'templates/header.tpl.html',
                controller: 'pfappController'
            };

        });
    
}());