(function () {
    'use strict';
    
    angular.module('pfapp')
    
        .controller('fireCalcCtrl', ['fireMath', 'LS', function (fireMath, LS) {

            var vm = this,
                arr = [],
                portfolioRateOfReturn = loadRoR(),
                defaults = [
                    new Date('01/23/1978'),  // birthdate
                    65,     // FIRE age
                    30000,  // annual expenses
                    4.00,   // withdrawal rate
                    50000,  // existing savings
                    10000   // annual savings
                ];
            
            
            // determine data source and bind alert to model
            function obtainDataSource() {
                if (LS.getData('fire-calc-storage') && LS.getData('pfapp-storage')) {
                    return 'Using locally-stored inputs & portfolio rate of return';
                } else if (LS.getData('fire-calc-storage') && !LS.getData('pfapp-storage')) {
                    return 'Using locally-stored inputs';
                } else if (!LS.getData('fire-calc-storage') && LS.getData('pfapp-storage')) {
                    return 'Using default inputs & portfolio rate of return';
                } else {
                    return 'Using default input values';
                }
            }
            
            
            // fetch input data from either localStorage or defaults
            function loadState() {
                if (LS.getData('fire-calc-storage')) {
                    return LS.getData('fire-calc-storage');
                } else {
                    return defaults;
                }
            }
            
            // check local storage for portfolio avg rate of return.
            // if present, use it instead of default rate of return.
            function loadRoR() {
                if (LS.getData('pfapp-storage')) {
                    var numb = 100 * parseFloat(LS.getData('pfapp-storage'));
                    return Math.round(numb * 100) / 100;
                } else {
                    return 6;
                }
            }
            
            
            // bind input data to model
            function setState() {
                // determine the source of our data and bind to model
                vm.fireCalcDataSource = obtainDataSource();
                
                // loadState returns our array of values
                var arr = loadState(),
                    
                    // loadRor() returns aggregate portfolio return or default return
                    rateOfReturn = loadRoR();
                
                // bind array values to model
                vm.state = {
                    birthDate: new Date(arr[0]),
                    retirementAge: arr[1],
                    annualExpenses: arr[2],
                    withdrawalRate: arr[3],
                    FVpv: arr[4],
                    FVrate: loadRoR(),
                    FVpmt: arr[5],
                    requiredSavings: 0,
                    FVnper: 0
                };
            }
            
            // call on first hit
            setState();

            
            // fcMethods object collects FireCalc utility methods
            vm.fcMethods = {
                calcReqSavings: fireMath.calcReqSavings,
                calcFutureValue: fireMath.calcFV,
                calcAge: fireMath.calcAge,
                calcRate: fireMath.solveRate,
                saveState: saveState,
                deleteData: deleteData
            };

            
            // Save current state to local storage
            function saveState() {
                LS.setData('fire-calc-storage', [
                    vm.state.birthDate,
                    vm.state.retirementAge,
                    vm.state.annualExpenses,
                    vm.state.withdrawalRate,
                    vm.state.FVpv,
//                    vm.state.FVrate,
                    vm.state.FVpmt
                ]);
                // re-set state using newly-loaded values from local storage
                setState();
            }
            
            // delete FIRE calc data from local storage
            function deleteData() {
                LS.deleteData('fire-calc-storage');
                // re-set state using default values
                setState();
            };
            
        }]);
    
}());
