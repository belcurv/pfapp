(function () {
    'use strict';
    
    angular.module('pfapp')
    
        .controller('pfappController', ['pfactory', 'LS', function (pfactory, LS) {

            var vm = this;

            // main object
            // initialized with some placeholder data,
            // and collects our utility methods.
            vm.napkin = {
                birthDate: new Date('01/23/1978'),
                retirementAge: 65,
                annualExpenses: 30000,
                withdrawalRate: 4.00,
                requiredSavings: 0,
                FVrate: 6,
                FVnper: 0,
                FVpmt: 10000,
                FVpv: 50000,
                calcReqSavings: pfactory.calcReqSavings,
                calcFutureValue: pfactory.calcFV,
                calcAge: pfactory.calcAge,
                calcRate: calcRATE
            };            

            // RATE calculator
            function calcRATE(pmt, pv, nper, fv) {
                return (100 * pfactory.solveRate(nper, -pmt, -pv, fv, null, null));
            }

        }]);
    
}());