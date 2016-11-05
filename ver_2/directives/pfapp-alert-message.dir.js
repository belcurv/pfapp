(function () {
    'use strict';
    
    angular.module('pfapp')
    
        .directive('alertMessage', function () {

            return {
                restrict: 'E',
                scope: {
                    message: '@'
                },
                template: '{{ message }}'
            };
        });
    
}());