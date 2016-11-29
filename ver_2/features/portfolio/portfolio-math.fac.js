(function () {
    'use strict';

    angular.module('pfapp')
    
    .factory('pfMath', [function () {

        
        /* Sum the whole portfolio
         *
         * @params  [array]     investments     [all investments]
         * @returns [number]                    [sum of all holdings]
        */
        function sumPortfolioValue(investments) {
            var i,
                totalValue = 0;
            
            for (i = 0; i < investments.length; i += 1) {
                totalValue += investments[i].value;
            }
            
            return totalValue;
        }
        
        
        /* Sum holdings of a single asset class
         *
         * @params  [array]     investments     [all investments]
         * @params  [string]    type            [asset flass to sum]
         * @returns [number]                    [sum of single asset class]
        */
        function sumInvestmentValue(investments, type) {
            var sum = 0,
                i;
            
            for (i = 0; i < investments.length; i += 1) {
                if (investments[i].type === type) {
                    sum += investments[i].value;
                }
            }
            
            return sum;
        }

        
        /* Calculate the percentage of Stocks held in portfolio
         *
         * @params  [array]     investments     [all investments]
         * @returns [number]                    [percentage of stocks held]
        */
        function ratioStocks(investments) {
            var sumStocks = sumInvestmentValue(investments, "Stock"),
                sumBonds  = sumInvestmentValue(investments, "Bond"),
                sumTotal  = sumStocks + sumBonds;
                
                return (sumStocks / sumTotal);
        }

        
        /* Calculate aggregate average portfolio returns
         *
         * @params  [array]     investments     [all investments]
         * @returns [number]                    [average portfolio return]
        */
        function avgPortfolioReturn(investments) {
            var totalPortfolioValue = sumPortfolioValue(investments),
                averageReturn = 0,
                i;
            
            // multiply each holding's value by its 10-yr return
            for (i = 0; i < investments.length; i += 1) {
                
                // ratio of holding value to total value
                var ratio = investments[i].value / totalPortfolioValue,
                    decmialReturn;
                
                // if avgReturn > 1, make it a decimal
                if (investments[i].avgReturn > 1) {
                    decmialReturn = investments[i].avgReturn / 100;
                } else {
                    decmialReturn = investments[i].avgReturn;
                }
                
                averageReturn += (ratio * decmialReturn);
            }
            return averageReturn;
        }

        
        // export the thing
        return {
            sumPortfolioValue: sumPortfolioValue,
            sumInvestmentValue: sumInvestmentValue,
            ratioStocks: ratioStocks,
            avgPortfolioReturn: avgPortfolioReturn
        };
        
    }]);
    
}());