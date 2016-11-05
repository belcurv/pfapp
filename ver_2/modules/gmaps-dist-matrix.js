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

            // fetch distance matrix from google.maps
            // @params  [string] oA    [Origin A address]
            // @params  [string] oB    [Origin B address]
            // @params  [string] d     [Destination address]
            // @returns [object]       [Returns deferred promise]
            return function (oA, oB, d) {

                // init variables and deferred promise
                var deferred = $q.defer(),
                    service,

                    // google maps request object
                    request = {
                        origins: [oA, oB],
                        destinations: [d],
                        travelMode: google.maps.TravelMode.DRIVING,
                        avoidHighways: false,
                        avoidTolls: false,
                        unitSystem: google.maps.UnitSystem.IMPERIAL
                    };

                // Distance Matrix Service callback
                // @params  [object]   results   [gMaps distance matrix object]
                // @params  [string]   status    [gMaps response status code]
                // @returns [object]   deferred.resolve()
                function callback(results, status) {
                    if (status === 'OK') {
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
                service.getDistanceMatrix(request, callback);
                return deferred.promise;
            };
        }]);

}());