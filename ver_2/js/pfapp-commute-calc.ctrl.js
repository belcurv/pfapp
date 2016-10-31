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
                origin: "Milwaukee, WI 53207 USA",
                destination: "New Berlin, WI 53146 USA",
                mileageRate: 0.54,
                hourlyRate: 20,
                roundTripFlag: 1,        // 1 = 1-way, 2 = round-trip
                commuteArr: [],
                calcCommute: calcCommute,
                costCommute: costCommute
            };
            

            /* array structure:
             * hours per ...
            
            //        |      time      |   distance     |      cost
            // ------------------------------------------------------------
            // day    |  minutes/60    |     miles      |   miles*rate
            // week   |  minutes/12    |    miles*5     |  5*miles*rate
            // month  |  minutes/3     |    miles*20    |  20*miles*rate
            // year   |  (mins/12)*52  |   miles*260    |  260*miles*rate
            // 5 yrs  |  (mins/12)*260 |   miles*1300   | 1300*miles*rate
            // 10 yrs |  (mins/12)*520 |   miles*2600   | 2600*miles*rate
            
            */
            function commuteArray(meters, seconds) {
                var arr = [],
                    rate = vm.myObj.mileageRate,      // mileage rate
                    rtMult = vm.myObj.roundTripFlag,  // round-trip multiplier
                    wage = vm.myObj.hourlyRate,
                    minutes = seconds / 60,
                    miles = meters / 1609.344;
                
                arr = [
                    {
                        per: "Day",
                        time: rtMult * minutes / 60,
                        dist: rtMult * miles,
                        carCost: rtMult * miles * rate,
                        timeCost: (rtMult * minutes / 60) * wage
                    },
                    {
                        per: "Week",
                        time: rtMult * minutes / 12,
                        dist: rtMult * miles * 5,
                        carCost: rtMult * miles * rate * 5,
                        timeCost: (rtMult * minutes / 12) * wage
                    },
                    {
                        per: "Month",
                        time: rtMult * minutes / 3,
                        dist: rtMult * miles * 20,
                        carCost: rtMult * miles * rate * 20,
                        timeCost: (rtMult * minutes / 3) * wage
                    },
                    {
                        per: "Year",
                        time: rtMult * (minutes / 12) * 52,
                        dist: rtMult * miles * 260,
                        carCost: rtMult * miles * rate * 260,
                        timeCost: (rtMult * (minutes / 12) * 52) * wage
                    },
                    {
                        per: "5 Years",
                        time: rtMult * (minutes / 12) * 260,
                        dist: rtMult * miles * 1300,
                        carCost: rtMult * miles * rate * 1300,
                        timeCost: (rtMult * (minutes / 12) * 260) * wage
                    },
                    {
                        per: "10 Years",
                        time: rtMult * (minutes / 12) * 520,
                        dist: rtMult * miles * 2600,
                        carCost: rtMult * miles * rate * 2600,
                        timeCost: (rtMult * (minutes / 12) * 520) * wage
                    }
                ];
                
                console.log(arr);
                return arr;
            }

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
                    var meters  = response.rows[0].elements[0].distance.value,
                        seconds = response.rows[0].elements[0].duration.value;
                    
                    vm.myObj.distance = meters  / 1609.344;
                    vm.myObj.duration = seconds / 3600;
                    vm.myObj.responseObject = JSON.stringify(response, null, '  ');
//                    console.log(JSON.stringify(response, null, '  '));
                    vm.myObj.commuteArr = commuteArray(meters, seconds);
                    
                } else {
                    console.log("Error: " + status);
                }
            }
            
            function costCommute(distance, rate) {
                return (parseInt(distance, 10) * rate);
            }
            
        }]);

}());