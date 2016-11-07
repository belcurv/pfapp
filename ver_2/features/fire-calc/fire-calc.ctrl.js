(function () {
    'use strict';
    
    angular.module('pfapp')
    
        .controller('fireCalcCtrl', ['pfactory', 'LS', function (pfactory, LS) {

            var vm = this,
                arr = [],
                defaults = [
                    new Date('01/23/1978'),  // birthdate
                    65,     // FIRE age
                    30000,  // annual expenses
                    4.00,   // withdrawal rate
                    50000,  // existing savings
                    6,      // rate of return
                    10000   // annual savings
                ];
            
            
            // fetch input data from either localStorage or defaults
            function loadState() {
                if (LS.getData('fire-calc-storage')) {
                    // when true;
                    vm.fireCalcDataSource = 'Using locally-stored input values';
                    return LS.getData('fire-calc-storage');
                } else {
                    // when false;
                    vm.fireCalcDataSource = 'Using default input values';
                    return defaults;
                }
            }
            
            
            // bind input data to model
            function setState() {
                // call loadState, which returns array
                var arr = loadState();
                // bind
                vm.state = {
                    birthDate: new Date(arr[0]),
                    retirementAge: arr[1],
                    annualExpenses: arr[2],
                    withdrawalRate: arr[3],
                    FVpv: arr[4],
                    FVrate: arr[5],
                    FVpmt: arr[6],
                    requiredSavings: 0,
                    FVnper: 0
                };
            }
            
            // call on first hit
            setState();

            
            // fcMethods object collects FireCalc utility methods
            vm.fcMethods = {
                calcReqSavings: pfactory.calcReqSavings,
                calcFutureValue: pfactory.calcFV,
                calcAge: pfactory.calcAge,
                calcRate: calcRATE,
                saveState: saveState,
                deleteData: deleteData
            };

            // RATE calculator
            function calcRATE(pmt, pv, nper, fv) {
                return (100 * pfactory.solveRate(nper, -pmt, -pv, fv, null, null));
            }
            
            // Save current state to local storage
            function saveState() {
                LS.setData('fire-calc-storage', [
                    vm.state.birthDate,
                    vm.state.retirementAge,
                    vm.state.annualExpenses,
                    vm.state.withdrawalRate,
                    vm.state.FVpv,
                    vm.state.FVrate,
                    vm.state.FVpmt
                ]);
                // reset state; will use local storage data
                setState();
            }
            
            // delete personal FIRE calc info from local storage
            function deleteData() {
                // delete personal fire calc data
                LS.deleteData('fire-calc-storage');
                // reset state; will use defaults
                setState();
            };
            
        }]);
    
}());
