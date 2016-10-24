(function () {
    'use strict';
    
    angular.module('pfapp')
    
        .directive('pfappFooter', function () {
        
            return {
                restrict: 'AE',
                templateUrl: 'templates/footer.tpl.html'
            };

        });
    
}());