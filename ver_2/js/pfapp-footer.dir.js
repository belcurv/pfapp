(function () {
    'use strict';
    
    angular.module('pfapp')
    
        .directive('pfappFooter', function () {
        
            return {
                restrict: 'E',
                templateUrl: 'templates/footer.tpl.html'
            };

        });
    
}());