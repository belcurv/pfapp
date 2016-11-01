/*
 * Google Maps Distance Matrix Service module
 *
 * API ref:
 * https://developers.google.com/maps/documentation/javascript/distancematrix
 *
 * To use:
 * 1) Include this javascript in a <script> tag in your html
 * 2) Include <script src="https://maps.googleapis.com/maps/api/js?key=__api_key__"></script>
 * 3) Inject 'gmapsDistanceModule' into your application
 * 4) call it:
 *    gmapsDistanceAPI(origin, destination)
 *        .then(function (response) {
 *            // do stuff
 *        });
 * 
 * Not all options/features are used - this is specifically for north-American
 * car drivers.
*/

(function () {
    'use strict';
    
    angular.module('gmapsDistanceModule', [])
    
        .factory('gmapsDistanceAPI', ['$rootScope', '$q', function ($rootScope, $q) {
            
            return function (o, d) {
                
                var deferred = $q.defer(),  // init promise!
                    service;
                
                // Request object for the gMaps Distance Matrix Service
                var request = {
                        origins: [o],
                        destinations: [d],
                        travelMode: google.maps.TravelMode.DRIVING,
                        avoidHighways: false,
                        avoidTolls: false,
                        unitSystem: google.maps.UnitSystem.IMPERIAL
                    };
                
                // Callback for the gMaps Distance Matrix Service
                function callback(results, status) {
                    if (status === google.maps.DistanceMatrixStatus.OK || status === google.maps.DistanceMatrixStatus.ZERO_RESULTS) {
                        $rootScope.$apply(function () {
                            return deferred.resolve(results);
                        });
                    } else {
                        $rootScope.$apply(function () {
                            return deferred.reject(status);
                        });
                    }
                }
                
                service = new google.maps.DistanceMatrixService();
                
                // call service, pass in request and callback from above
                service.getDistanceMatrix(request, callback);
                
                // return what service gives us
                return deferred.promise;
            };
            
        }]);
    
}());