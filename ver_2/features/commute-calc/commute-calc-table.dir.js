(function () {
    'use strict';
    
    angular.module('pfapp')
        
        .directive('commuteCalcTable', function () {
    
            return {
                restrict: 'AE',
                scope: {
                    origin: '@',
                    destination: '@',
                    mileagerate: '=',
                    array: '='
                },
                templateUrl: 'features/commute-calc/commute-calc-table.tpl.html'
            };
    
        });
    
}());