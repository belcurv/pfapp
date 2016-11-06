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
             * @param       [string]    val         [string to be stored]
             * @param       [string]    loc         [local storage sub-location]
             * @param       [function]  storage     [localStorage feature detect & local ref]
             */
            function setData(loc, val) {
                if (storage) {
                    storage.setItem(loc, JSON.stringify(val));
                }
            }
            
            /** 
             * Get local storage if storage exists
             * @param       [string]    loc         [local storage sub-location]
             * @param       [function]  storage     [localStorage feature detect & local ref]
             * @returns     [JSON string]           [fetch stored string, return JSON]
             */
            function getData(loc) {
                if (storage) {
                    return JSON.parse(storage.getItem(loc));
                }
            }
            
            /** 
             * Delete ALL keys from local storage if pass
             * @param       [function]  storage     [localStorage feature detect & local ref]
             * @returns     [function]  .clear      [wipes local storage]
             */
            function clearData() {
                if (storage) {
                    return storage.clear();
                }
            }
            
            /** 
             * Delete ONE key from local storage if pass
             * @param       [string]    loc         [the key to delete from localStorage]
             * @param       [function]  storage     [localStorage feature detect & local ref]
             * @returns     [function]  .clear      [wipes local storage]
             */
            function deleteData(loc) {
                if (storage) {
                    return storage.removeItem(loc);
                }
            }
            

            return {
                setData: setData,
                getData: getData,
                deleteData: deleteData,
                clearData: clearData
            };
            
        }]);
        
    
}());