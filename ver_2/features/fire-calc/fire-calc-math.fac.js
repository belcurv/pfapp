(function () {

    'use strict';
    
    angular.module('pfapp')
        
        .factory('fireMath', function () {
        
            /* Required savings
             *
             * @params  [number]  annualExpenses  [annual retirement expenses]
             * @params  [number]  withdrawalRate  [safe withdrawal rate]
             * @returns [number]                  [total required savings]
            */
            function calcReqSavings(annualExpenses, withdrawalRate) {
                return annualExpenses / (withdrawalRate / 100);
            }
        
            
            /* Calculate Age
             *
             * @params  [object]    birthdate   [date object]
             * @returns [number]                [age in years]
            */
            function calcAge(birthDate) {
                var today = new Date();
                
                // dates are in milliseconds; have to convert to years
                return (Math.floor((today - birthDate) / 31536000000));
            }
        
            
            /* Future Value
             *
             * @params  [number]    rate    [annual interest rate]
             * @params  [number]    pmt     [annual contribution]
             * @params  [number]    pv      [present account value]
             * @params  [number]    nper    [number of periods in years]
             * @returns [number]            [account value at time nper]
            */
            function calcFV(rate, pmt, pv, nper) {
                
                // if rate is whole percent, convert to decimal
                if (rate > 1) {
                    rate = rate / 100;
                }
                
                var fv = ((pmt * (Math.pow(1 + rate, nper) - 1) / rate) + (pv * Math.pow(1 + rate, nper)));
                
                return Math.abs(fv);
            }


            /* Rate solver
             *
             * @params  [number]    nper    [number of periods in years]
             * @params  [number]    pmt     [annual contribution]
             * @params  [number]    pv      [present account value]
             * @params  [number]    fv      [target future value]
             * @params  [number]    type    [TVM FV type]
             * @params  [number]    guess   [rate launch point]
             * @returns [number]            [interest rate required to meet goal]
             *
             * credit: http://stackoverflow.com/questions/12064793/simple-financial-rate-function-in-javascript
             * 
            */
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
                // return rate as whole percent (ie. 7 ... not .07)
                return 100 * rate;
            }
        

            // return the thing
            return {
                calcReqSavings: calcReqSavings,
                calcAge: calcAge,
                calcFV: calcFV,
                solveRate: solveRate
            };
        
        });
}());