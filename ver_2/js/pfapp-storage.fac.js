(function () {
    'use strict';
    
    angular.module('pfapp')
    
        .factory('LS', ['$window', '$rootScope', function ($window, $rootScope) {
            
            function setData(val) {
                $window.localStorage && $window.localStorage.setItem('pfapp-storage', JSON.stringify(val));
                return this;
            }
            
            function getData() {
                return $window.localStorage && JSON.parse($window.localStorage.getItem('pfapp-storage'));
            }
            
            function deleteData() {
                return $window.localStorage && $window.localStorage.clear();
            }

            return {
                setData: setData,
                getData: getData,
                deleteData: deleteData
            };
            
        }]);
        
    
}());