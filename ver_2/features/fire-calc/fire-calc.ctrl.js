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
                    50000,
                    10000   // annual savings
                ];
            
            
            // determine data source and bind alert to model
            function obtainDataSource() {
                if (LS.getData('fire-calc-storage') && LS.getData('pf-storage-global')) {
                    return 'Using locally-stored inputs + portfolio rate of return & savings';
                } else if (LS.getData('fire-calc-storage') && !LS.getData('pf-storage-global')) {
                    return 'Using locally-stored inputs';
                } else if (!LS.getData('fire-calc-storage') && LS.getData('pf-storage-global')) {
                    return 'Using default inputs + portfolio rate of return & savings';
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
                if (LS.getData('pf-storage-global')) {
                    var RoR = 100 * parseFloat(LS.getData('pf-storage-global')[0]);
                    return Math.round(RoR * 100) / 100;
                } else {
                    return 6;
                }
            }
            
            
            // check local storage for portfolio sumInvestments.
            // if present, use it instead of default existing savings.
            function loadExistingSavings() {
                if (LS.getData('pf-storage-global')) {
                    var existingSavings = parseFloat(LS.getData('pf-storage-global')[1]);
                    return Math.round(existingSavings * 100) / 100;
                } else {
                    return 50000;
                }
            }

            
            // bind input data to model
            function setState() {
                // determine the source of our data and bind to model
                vm.fireCalcDataSource = obtainDataSource();
                
                // loadState returns our array of values
                var arr = loadState();
                
                // bind array values to model
                vm.state = {
                    birthDate: new Date(arr[0]),
                    retirementAge: arr[1],
                    annualExpenses: arr[2],
                    withdrawalRate: arr[3],
                    FVpv: loadExistingSavings(),
                    FVrate: loadRoR(),
                    FVpmt: arr[5],
                    requiredSavings: 0,
                    FVnper: 10
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
                
                var reqRate = fireMath.solveRate(vm.state.retirementAge - vm.fcMethods.calcAge(vm.state.birthDate), -vm.state.FVpmt, -vm.state.FVpv, vm.fcMethods.calcReqSavings(vm.state.annualExpenses, vm.state.withdrawalRate), null, null);
                
                LS.setData('fire-calc-storage', [
                    vm.state.birthDate,
                    vm.state.retirementAge,
                    vm.state.annualExpenses,
                    vm.state.withdrawalRate,
                    vm.state.FVpv,
                    vm.state.FVpmt
                ]);
                
                // save required rate to 'global' local storage,
                // for use in Portfolio allocation ratio calculations
                LS.setData('fc-storage-global', [
                    reqRate
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
