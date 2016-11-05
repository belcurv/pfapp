(function () {
    'use strict';

    angular.module('pfapp')

        .controller('commuteCalcController', ['gmapsDistanceAPI', 'commuteMath', function (gmapsDistanceAPI, commuteMath) {

            var vm = this;

            vm.myObj = {
                originA: "53207",
                originB: "53005",
                destination: "53154",
                mileageRate: 0.54,
                hourlyRate: 20,
                roundTripFlag: 2, // 1 = 1-way, 2 = round-trip
                commuteArr: [],
                responseObj: {}
            };

            // main exec block
            // Calls gmapsDistanceAPI factory, which returns a promise.
            // The promise calls anon function, which calls various
            // functions from commuteMath factory.
            // @params  [string] originA     [origin address A]
            // @params  [string] originB     [origin address B]
            // @params  [string] destination [destination address]
            vm.calcCommute = function (originA, originB, destination) {
                gmapsDistanceAPI(originA, originB, destination)
                    .then(function (response) {

                        // bind whole response to model
                        vm.myObj.responseObject = response;

                        // init local variables
                        var milesA, milesB, hoursA, hoursB,
                            totalCostCommuteA, totalCostCommuteB;

                        // capture converted distance & duration
                        milesA = commuteMath.metersToMiles(response.rows[0].elements[0].distance.value);
                        milesB = commuteMath.metersToMiles(response.rows[1].elements[0].distance.value);
                        hoursA = commuteMath.secondsToHours(response.rows[0].elements[0].duration.value);
                        hoursB = commuteMath.secondsToHours(response.rows[1].elements[0].duration.value);

                        // determine which commute is cheaper and bind to model
                        totalCostCommuteA = commuteMath.oneOriginTotalCost(milesA, hoursA, vm.myObj.mileageRate, vm.myObj.hourlyRate);
                        totalCostCommuteB = commuteMath.oneOriginTotalCost(milesB, hoursB, vm.myObj.mileageRate, vm.myObj.hourlyRate);
                        if (totalCostCommuteA < totalCostCommuteB) {
                            // A is cheaper
                            vm.myObj.closerOrigin = {
                                id: "Origin A",
                                address: response.originAddresses[0]
                            };
                        } else {
                            // B is cheaper
                            vm.myObj.closerOrigin = {
                                id: "Origin B",
                                address: response.originAddresses[1]
                            };
                        }

                        // calculate total monthly cost difference & bind to model
                        vm.myObj.costDiff = commuteMath.costDiff(totalCostCommuteA, totalCostCommuteB);

                        // build arrays for results tables and bind to model
                        vm.myObj.commuteArrA = commuteMath.buildArray(milesA, hoursA, vm.myObj.mileageRate, vm.myObj.roundTripFlag, vm.myObj.hourlyRate);
                        vm.myObj.commuteArrB = commuteMath.buildArray(milesB, hoursB, vm.myObj.mileageRate, vm.myObj.roundTripFlag, vm.myObj.hourlyRate);

                    });
            };
        }]);
}());