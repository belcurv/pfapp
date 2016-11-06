(function () {
    'use strict';

    angular.module('pfapp')

        .controller('commuteCalcController', ['gmapsDistanceAPI', 'LS', 'ccMath', function (gmapsDistanceAPI, LS, ccMath) {

            var vm = this,
                arr = [],
                ccDefaults = [
                    "53207",   // originA
                    "53005",   // originB
                    "53154",   // destination
                    0.54,      // mileageRate
                    20,        // hourlyRate
                    30,        // milesPerGallon
                    2.139,     // gasPrice
                    0.0481,    // maintenance
                    0.007,     // tires
                    1169,      // insurance
                    502,       // licenseRegTaxes
                    2368,      // depreciation
                    481,       // finance
                    false      // advancedToggle
                ];

            
            // Load input data from either localStorage or defaults
            function loadState() {
                if (LS.getData('commute-storage')) {
                    // when vtrue;
                    vm.commuteCalcDataSource = 'Using locally-stored input values';
                    return LS.getData('commute-storage');
                } else {
                    // when false;
                    vm.commuteCalcDataSource = 'Using default input values';
                    return ccDefaults;
                }
            }
            
            // call loadState, returns array
            arr = loadState();
            
            // state object represents the Commute Calc inputs
            // populate state values using 'arr' index
            vm.state = {
                originA: arr[0],
                originB: arr[1],
                destination: arr[2],
                mileageRate: arr[3],
                hourlyRate: arr[4],
                milesPerGallon: arr[5],
                gasPrice: arr[6],
                maintenance: arr[7],
                tires: arr[8],
                insurance: arr[9],
                licenseRegTaxes: arr[10],
                depreciation: arr[11],
                finance: arr[12],
                advancedToggle: arr[13],
                roundTripFlag: 2
            };
            
            vm.ccMethods = {
                saveState: saveState,
                deleteData: deleteData,
                reset: reset,
                calcCommute: calcCommute
            }
            
            // placeholder for results calculated below
            vm.results = {};
            
            // Save current state to local storage
            function saveState() {
                LS.setData('commute-storage', [
                    vm.state.originA,
                    vm.state.originB,
                    vm.state.destination,
                    vm.state.mileageRate,
                    vm.state.hourlyRate,
                    vm.state.milesPerGallon,
                    vm.state.gasPrice,
                    vm.state.maintenance,
                    vm.state.tires,
                    vm.state.insurance,
                    vm.state.licenseRegTaxes,
                    vm.state.depreciation,
                    vm.state.finance,
                    vm.state.advancedToggle
                ]);
            }
            
            // wipe personal commute calc info from local storage
            function deleteData() {
                 LS.deleteData('commute-storage');
            };
            
            // Reset app
            function reset() {
                vm.results.responseObject = '';
            }

            // main exec block
            // Calls gmapsDistanceAPI factory, which returns a promise.
            // The promise calls anon function, which calls various
            // functions from ccMath factory.
            // @params  [string] originA     [origin address A]
            // @params  [string] originB     [origin address B]
            // @params  [string] destination [destination address]
            function calcCommute(originA, originB, destination) {
                gmapsDistanceAPI(originA, originB, destination)
                    .then(function (response) {

                        // bind whole response to model
                        vm.results.responseObject = response;

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
                        if (vm.state.advancedToggle === false) {
                            /* ===== BASIC PATH ===== //
                            /  mileageRateA = mileageRateB = vm.myObj.mileageRate */
                            mileageRateA = vm.state.mileageRate;
                            mileageRateB = vm.state.mileageRate;
                            // bind above per-mile rates to model. Used in table output
                            vm.results.mileageRateA = mileageRateA;
                            vm.results.mileageRateB = mileageRateB;
                        } else {
                            /* ===== ADVANCED PATH ===== //
                            /  mileage rate depends on operating costs, ownership costs
                            /  and miles driven  */
                            
                            // per-mile OPERATING costs are the same for both commutes
                            perMileOperatingCosts = ccMath.perMileOperatingCosts(vm.state.gasPrice, vm.state.milesPerGallon, vm.state.maintenance, vm.state.tires);

                            // per-mile OWNERSHIP costs depend on variable miles driven
                            perMileOwnershipCostsA = ccMath.perMileOwnershipCosts(vm.state.insurance, vm.state.licenseRegTaxes, vm.state.depreciation, vm.state.finance, milesA);
                            perMileOwnershipCostsB = ccMath.perMileOwnershipCosts(vm.state.insurance, vm.state.licenseRegTaxes, vm.state.depreciation, vm.state.finance, milesB);

                            // total per-mile rate = sum of operating + ownership costs
                            mileageRateA = perMileOperatingCosts + perMileOwnershipCostsA;
                            mileageRateB = perMileOperatingCosts + perMileOwnershipCostsB;
                            
                            // bind above per-mile rates to model
                            vm.results.mileageRateA = mileageRateA;
                            vm.results.mileageRateB = mileageRateB;
                        }
                        /* ========== END BASIC vs ADVANCED paths ========== */
                    
                        
                        // calculate total cost for each commute
                        totalCostCommuteA = ccMath.oneOriginTotalCost(milesA, hoursA, mileageRateA, vm.state.hourlyRate);
                        totalCostCommuteB = ccMath.oneOriginTotalCost(milesB, hoursB, mileageRateB, vm.state.hourlyRate);
                    
                        // determine which commute is cheaper and bind to model
                        if (totalCostCommuteA < totalCostCommuteB) {
                            // then A is cheaper
                            vm.results.closerOrigin = {
                                id: "Origin A",
                                address: response.originAddresses[0]
                            };
                        } else {
                            // then B is cheaper
                            vm.results.closerOrigin = {
                                id: "Origin B",
                                address: response.originAddresses[1]
                            };
                        }

                        // calculate total monthly cost difference & bind to model
                        vm.results.costDiff = ccMath.costDiff(totalCostCommuteA, totalCostCommuteB);

                        // build arrays for results tables and bind to model
                        vm.results.commuteArrA = ccMath.buildArray(milesA, hoursA, mileageRateA, vm.state.roundTripFlag, vm.state.hourlyRate);
                        vm.results.commuteArrB = ccMath.buildArray(milesB, hoursB, mileageRateB, vm.state.roundTripFlag, vm.state.hourlyRate);

                    });
            }
            
        }]);
}());