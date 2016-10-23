(function () {

    'use strict';
    
    angular.module('pfapp', [])
    
        .factory('pfactory', function () {
        
            // Required savings
            function calcReqSavings(annualExpenses, withdrawalRate) {
                return annualExpenses / (withdrawalRate / 100);
            }
        
            // Age
            function calcAge(birthDate) {
                var today = new Date();
                
                // dates are in milliseconds; have to convert to years
                return (Math.floor((today - birthDate) / 31536000000));
            }
        
            // Future Value
            function calcFV(rate, pmt, pv, nper) {
                
                var fv = ((pmt * (Math.pow(1 + rate, nper) - 1) / rate) + (pv * Math.pow(1 + rate, nper)));
                
                return Math.abs(fv);
            }

            // Rate solver
            // credit: http://stackoverflow.com/questions/12064793/simple-financial-rate-function-in-javascript
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
        
            // return the thing
            return {
                calcReqSavings: calcReqSavings,
                calcAge: calcAge,
                calcFV: calcFV,
                solveRate: solveRate
            };
        
        })
    
        .controller('pfappController', ['pfactory', function (pfactory) {
        
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