(function () {
    'use strict';
    
    angular.module('pfapp')
    
        .directive('pfappFooter', function () {
        
            return {
                restrict: 'E',
                templateUrl: 'features/footer/footer.tpl.html'
            };

        });
    
}());