(function () {
    'use strict';
    
    angular.module('pfapp')
    
        .factory('LS', ['$window', '$rootScope', function ($window, $rootScope) {
            
            function setData(val) {
                $window.localStorage && $window.localStorage.setItem('pfapp-storage', val);
                return this;
            }
            
            function getData() {
                console.log($window.localStorage);
                return $window.localStorage && $window.localStorage.getItem('pfapp-storage');
            }

            return {
                setData: setData,
                getData: getData
            };
            
        }]);
        
    
}());