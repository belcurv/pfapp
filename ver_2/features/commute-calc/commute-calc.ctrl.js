(function () {
    'use strict';

    angular.module('pfapp')

        .controller('commuteCalcController', ['gmapsDistanceAPI', 'ccMath', function (gmapsDistanceAPI, ccMath) {

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
                advancedToggle: false,
                commuteArr: [],
                responseObj: {}
            };

            // main exec block
            // Calls gmapsDistanceAPI factory, which returns a promise.
            // The promise calls anon function, which calls various
            // functions from ccMath factory.
            // @params  [string] originA     [origin address A]
            // @params  [string] originB     [origin address B]
            // @params  [string] destination [destination address]
            vm.calcCommute = function (originA, originB, destination) {
                gmapsDistanceAPI(originA, originB, destination)
                    .then(function (response) {

                        // bind whole response to model
                        vm.myObj.responseObject = response;

                        // init local variables
                        var milesA, milesB,
                            hoursA, hoursB,
                            mileageRateA,
                            mileageRateB,
                            perMileOperatingCosts,
                            perMileOwnershipCostsA,
                            perMileOwnershipCostsB,
                            totalCostCommuteA,
                            totalCostCommuteB;
                            
                    
                        // converte response's distance & duration & capture
                        milesA = ccMath.metersToMiles(response.rows[0].elements[0].distance.value);
                        milesB = ccMath.metersToMiles(response.rows[1].elements[0].distance.value);
                        hoursA = ccMath.secondsToHours(response.rows[0].elements[0].duration.value);
                        hoursB = ccMath.secondsToHours(response.rows[1].elements[0].duration.value);
                    

                        /* ========== BASIC vs ADVANCED paths ========== */
                        /*  mileageRateA and mileageRateA depend on which path the user picks:
                        /  1. Basic path mileageRates = the federal mileage rate 
                        /  2. Advanced path mileageRates have to be calulated  */
                        if (vm.myObj.advancedToggle === false) {
                            /* ===== BASIC PATH ===== //
                            /  mileageRateA = mileageRateB = vm.myObj.mileageRate */
                            mileageRateA = vm.myObj.mileageRate;
                            mileageRateB = vm.myObj.mileageRate;
                            // bind above per-mile rates to model. Used in table output
                            vm.myObj.mileageRateA = mileageRateA;
                            vm.myObj.mileageRateB = mileageRateB;
                        } else {
                            /* ===== ADVANCED PATH ===== //
                            /  mileage rate depends on operating costs, ownership costs
                            /  and miles driven  */
                            
                            // per-mile OPERATING costs are the same for both commutes
                            perMileOperatingCosts = ccMath.perMileOperatingCosts(vm.myObj.gasPrice, vm.myObj.milesPerGallon, vm.myObj.maintenance, vm.myObj.tires);

                            // per-mile OWNERSHIP costs depend on variable miles driven
                            perMileOwnershipCostsA = ccMath.perMileOwnershipCosts(vm.myObj.insurance, vm.myObj.licenseRegTaxes, vm.myObj.depreciation, vm.myObj.finance, milesA);
                            perMileOwnershipCostsB = ccMath.perMileOwnershipCosts(vm.myObj.insurance, vm.myObj.licenseRegTaxes, vm.myObj.depreciation, vm.myObj.finance, milesB);

                            // total per-mile rate = sum of operating + ownership costs
                            mileageRateA = perMileOperatingCosts + perMileOwnershipCostsA;
                            mileageRateB = perMileOperatingCosts + perMileOwnershipCostsB;
                            
                            // bind above per-mile rates to model
                            vm.myObj.mileageRateA = mileageRateA;
                            vm.myObj.mileageRateB = mileageRateB;
                        }
                        /* ========== END BASIC vs ADVANCED paths ========== */
                    
                        
                        // calculate total cost for each commute
                        totalCostCommuteA = ccMath.oneOriginTotalCost(milesA, hoursA, mileageRateA, vm.myObj.hourlyRate);
                        totalCostCommuteB = ccMath.oneOriginTotalCost(milesB, hoursB, mileageRateB, vm.myObj.hourlyRate);
                    
                        // determine which commute is cheaper and bind to model
                        if (totalCostCommuteA < totalCostCommuteB) {
                            // then A is cheaper
                            vm.myObj.closerOrigin = {
                                id: "Origin A",
                                address: response.originAddresses[0]
                            };
                        } else {
                            // then B is cheaper
                            vm.myObj.closerOrigin = {
                                id: "Origin B",
                                address: response.originAddresses[1]
                            };
                        }

                        // calculate total monthly cost difference & bind to model
                        vm.myObj.costDiff = ccMath.costDiff(totalCostCommuteA, totalCostCommuteB);

                        // build arrays for results tables and bind to model
                        vm.myObj.commuteArrA = ccMath.buildArray(milesA, hoursA, mileageRateA, vm.myObj.roundTripFlag, vm.myObj.hourlyRate);
                        vm.myObj.commuteArrB = ccMath.buildArray(milesB, hoursB, mileageRateB, vm.myObj.roundTripFlag, vm.myObj.hourlyRate);

                    });
            };
        }]);
}());