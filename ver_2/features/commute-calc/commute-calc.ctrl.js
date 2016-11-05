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
                milesPerGallon: 30,
                gasPrice: 2.139,
                maintenance: 0.0481,
                tires: 0.007,
                insurance: 1169,
                licenseRegTaxes: 502,
                depreciation: 2368,
                finance: 481,
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
                            totalCostCommuteA, totalCostCommuteB,
                            
                            // per mile operating costs
                            operatingCosts = (vm.myObj.gasPrice / vm.myObj.milesPerGallon) + vm.myObj.maintenance + vm.myObj.tires,
                            
                            // annual operating costs
                            annualOwnershipCosts = vm.myObj.insurance + vm.myObj.licenseRegTaxes + vm.myObj.depreciation + vm.myObj.finance,
                            
                            // placeholder for calculated rate
                            mileageRateA,
                            mileageRateB;
                    
                        // capture converted distance & duration
                        milesA = commuteMath.metersToMiles(response.rows[0].elements[0].distance.value);
                        milesB = commuteMath.metersToMiles(response.rows[1].elements[0].distance.value);
                        hoursA = commuteMath.secondsToHours(response.rows[0].elements[0].duration.value);
                        hoursB = commuteMath.secondsToHours(response.rows[1].elements[0].duration.value);
                    
                        // calculate per mile rates
                        // = oper cost per mile + (annual ownership costs / annual miles)
                        // annual miles = commute miles * 2 ways * 260 work-days per year
                        mileageRateA = operatingCosts + (annualOwnershipCosts / (milesA * 520));
                        mileageRateB = operatingCosts + (annualOwnershipCosts / (milesB * 520));
                    
                        // bind above per-mile rates to model
                        vm.myObj.mileageRateA = mileageRateA;
                        vm.myObj.mileageRateB = mileageRateB;
                            
                        // determine which commute is cheaper and bind to model
                        totalCostCommuteA = commuteMath.oneOriginTotalCost(milesA, hoursA, mileageRateA, vm.myObj.hourlyRate);
                        totalCostCommuteB = commuteMath.oneOriginTotalCost(milesB, hoursB, mileageRateB, vm.myObj.hourlyRate);
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