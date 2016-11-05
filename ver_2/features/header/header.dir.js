(function () {
    'use strict';
    
    angular.module('pfapp')
    
        .directive('pfappHeader', function () {
        
            return {
                restrict: 'AE',
                templateUrl: 'features/header/header.tpl.html',
                controller: 'fireCalcCtrl'
            };

        });
    
}());