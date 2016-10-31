(function () {
    'use strict';
    
    angular.module('pfapp')
    
        .factory('LS', ['$window', '$rootScope', function ($window, $rootScope) {
            
            /** 
             * localStorage feature detect & return local reference
             * @param       [none]
             * @returns     [BOOLEAN]   [returns true if stored string === uid]
             */
            var storage = (function () {
                var uid = new Date().toString(), // date must be a string
                    storage,
                    result;
                
                try {
                    storage = $window.localStorage;
                    storage.setItem(uid, uid);
                    result = storage.getItem(uid) === uid;
                    storage.removeItem(uid);
                    return result && storage;
                } catch (exception) {}
            }());
            
            /** 
             * Store item in local storage if storage exists
             * @param       [function]  storage     [localStorage feature detect & local ref]
             * @param       [string]    val         [string to be stored]
             */
            function setData(val) {
                if (storage) {
                    storage.setItem('pfapp-storage', JSON.stringify(val));
                }
            }
            
            /** 
             * Get local storage if storage exists
             * @param       [function]  storage     [localStorage feature detect & local ref]
             * @returns     [JSON string]           [fetch stored string, return JSON]
             */
            function getData() {
                if (storage) {
                    return JSON.parse(storage.getItem('pfapp-storage'));
                }
            }
            
            /** 
             * Delete local storage if pass
             * @param       [function]  storage     [localStorage feature detect & local ref]
             * @returns     [function]  .clear      [wipes local storage]
             */
            function deleteData() {
                if (storage) {
                    return storage.clear();
                }                
            }

            return {
                setData: setData,
                getData: getData,
                deleteData: deleteData
            };
            
        }]);
        
    
}());