/* 
 * TO-DO: pack distance service into an Angular factory w/$q
 */

(function () {
    'use strict';

    angular.module('pfapp')

        .controller('pfappCommuteCalcController', [function () {
            
            /* Google Maps API - Distance Matrix Service:
             * https://developers.google.com/maps/documentation/javascript/distancematrix
            */

            var vm = this,
                service = new google.maps.DistanceMatrixService();

            vm.myObj = {
                origin: "Milwaukee, WI USA",
                destination: "Chicago, IL USA",
                mileageRate: .54,
                calcCommute: calcCommute,
                costCommute: costCommute
            };

            function calcCommute(origin, destination) {
                // method taks request object & callback
                return service.getDistanceMatrix({
                    origins: [origin],
                    destinations: [destination],
                    travelMode: google.maps.TravelMode.DRIVING,
                    avoidHighways: false,
                    avoidTolls: false,
                    unitSystem: google.maps.UnitSystem.IMPERIAL
                }, callback);
            }

            function callback(response, status) {
                if (status === "OK") {
                    vm.myObj.distance = response.rows[0].elements[0].distance.text;
                    vm.myObj.duration = response.rows[0].elements[0].duration.text;
                    vm.myObj.responseObject = JSON.stringify(response, null, '  ');
                } else {
                    console.log("Error: " + status);
                }
            }
            
            function costCommute(distance, rate) {
                return (parseInt(distance, 10) * rate);
            }
            
        }]);

}());