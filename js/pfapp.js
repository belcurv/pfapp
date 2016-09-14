(function () {

    'use strict';
    
    angular.module('pfapp', [])
    
        .controller('pfappController', [function () {
        
            var vm = this;
            
    
            // main object
            // initialized with some placeholder data,
            // and collects our utility methods.
            vm.napkin = {
                birthDate: new Date('01/23/1978'),
                retirementAge: 65,
                annualExpenses: 30000,
                withdrawalRate: 0.04,
                requiredSavings: 0,
                FVrate: 0.06,
                FVnper: 0,
                FVpmt: 10000,
                FVpv: 50000,
                calculatedFV: 0,
                calcReqSavings: calcReqSavings,
                calcFutureValue: calcFV,
                calcRate: calcRATE
            };
            
            
            
            // ====================== UTILITY METHODS ======================
            
            // savings goal calculator
            function calcReqSavings() {
                
                var birthDate = vm.napkin.birthDate,
                    today = new Date(),
                    annualExpenses = vm.napkin.annualExpenses,
                    withdrawalRate = vm.napkin.withdrawalRate;
                
                // calculate & display required nest egg
                vm.napkin.requiredSavings = annualExpenses / withdrawalRate;
                
                // calculate & display age in years
                // note: dates are in milliseconds; have to convert to years
                vm.napkin.calculatedAge = (Math.floor((today - birthDate) / 31536000000));
            }
            

            // FV calculator
            function calcFV() {
                
                var rate = vm.napkin.FVrate,
                    pmt  = vm.napkin.FVpmt,
                    pv   = vm.napkin.FVpv,
                    nper = vm.napkin.retirementAge - vm.napkin.calculatedAge,
                    fv;
                
                // bind number of years until retirement to main object
                vm.napkin.FVnper = nper;
                
                // // using traditional negative PMT and PV inputs
                // var fv = -((pmt * (Math.pow(1 + rate, nper) - 1) / rate) + (pv * Math.pow(1 + rate, nper))); 

                // using positive PMT and PV inputs
                fv = ((pmt * (Math.pow(1 + rate, nper) - 1) / rate) + (pv * Math.pow(1 + rate, nper)));
                
                // bind calculated FV to main object
                vm.napkin.calculatedFV = Math.abs(fv);
            }

            
            // RATE calculator
            function solveRate(nper, pmt, pv, fv, type, guess) {
                
                if (guess === null) {
                    guess = 0.01;
                }
                if (fv === null) {
                    fv = 0;
                }
                if (type === null) {
                    type = 0;
                }
                
                var FINANCIAL_MAX_ITERATIONS = 128, //Bet accuracy with 128
                    FINANCIAL_PRECISION = 0.0000001; //1.0e-8

                var y, y0, y1, x0, x1 = 0,
                    f = 0,
                    i = 0;
                var rate = guess;
                if (Math.abs(rate) < FINANCIAL_PRECISION) {
                    y = pv * (1 + nper * rate) + pmt * (1 + rate * type) * nper + fv;
                } else {
                    f = Math.exp(nper * Math.log(1 + rate));
                    y = pv * f + pmt * (1 / rate + type) * (f - 1) + fv;
                }
                y0 = pv + pmt * nper + fv;
                y1 = pv * f + pmt * (1 / rate + type) * (f - 1) + fv;

                // find root by Newton secant method
                i = x0 = 0.0;
                x1 = rate;
                while ((Math.abs(y0 - y1) > FINANCIAL_PRECISION) && (i < FINANCIAL_MAX_ITERATIONS)) {
                    rate = (y1 * x0 - y0 * x1) / (y1 - y0);
                    x0 = x1;
                    x1 = rate;

                    if (Math.abs(rate) < FINANCIAL_PRECISION) {
                        y = pv * (1 + nper * rate) + pmt * (1 + rate * type) * nper + fv;
                    } else {
                        f = Math.exp(nper * Math.log(1 + rate));
                        y = pv * f + pmt * (1 / rate + type) * (f - 1) + fv;
                    }

                    y0 = y1;
                    y1 = y;
                    i += 1;
                }
                return rate;
            }

            // RATE calculator
            function calcRATE() {
                
                var pmt  = vm.napkin.FVpmt,
                    pv   = vm.napkin.FVpv,
                    nper = vm.napkin.retirementAge - vm.napkin.calculatedAge,
                    fv   = vm.napkin.requiredSavings,
                    rate = (100 * solveRate(nper, -pmt, -pv, fv, null, null));
                
                vm.napkin.requiredRate = rate;
            }

            document.getElementById("RATE-button")
                .addEventListener("click", calcRATE);
        
        }]);

}());