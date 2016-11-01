(function () {
    'use strict';

    angular.module('pfapp')

        .controller('pfappCommuteCalcController', ['gmapsDistanceAPI', function (gmapsDistanceAPI) {

            var vm = this;

            vm.myObj = {
                origin: "Brooklyn, NY 11222 USA",
                destination: "Bryn Mawr, PA 19010 USA",
                mileageRate: 0.54,
                hourlyRate: 20,
                roundTripFlag: 2,  // 1 = 1-way, 2 = round-trip
                commuteArr: [],
                calcCommute: calcCommute
            };


            /* calcCommute calls Google Maps Distance Matrix Service
             * using injected gmapsDistanceAPI facory.
             * gmapsDistanceAPI returns a promise.
            */
            function calcCommute(origin, destination) {
                // call our gmapsDistanceAPI facory
                gmapsDistanceAPI(origin, destination)
                    .then(function (response) {
                        // response values come as meters and seconds
                        var meters  = response.rows[0].elements[0].distance.value,
                            seconds = response.rows[0].elements[0].duration.value;

                        // bind response data to model
                        vm.myObj.distance = meters  / 1609.344;
                        vm.myObj.duration = seconds / 3600;
                        vm.myObj.responseObject = JSON.stringify(response, null, '  ');
                        vm.myObj.commuteArr = commuteArray(meters, seconds);
                    });
            }
            

            /* calculate commute stats for various time periods,
             *
             * @params  [number]    meters  [distance between origin and dest]
             * @params  [number]    minutes [duration from origin to dest]
             * @returns [array]     arr     [array of commute cost stats]
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
                
                return arr;
            }
            
        }]);

}());
