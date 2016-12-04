(function () {
    'use strict';

    angular.module('pfapp')
    
    .factory('pfMath', [function () {

        
        /* SUM THE WHOLE PORTFOLIO
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
        
        
        /* SUM HOLDINGS OF A SINGLE ASSET CLASS
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

        
        /* CALCULATE PERCENTAGE OF STOCKS IN PORTFOLIO
         *
         * @params  [array]     investments     [all investments]
         * @returns [number]                    [percentage of stocks held]
        */
        function getPercentStocks(investments) {
            var sumStocks = sumInvestmentValue(investments, "Stock"),
                sumBonds  = sumInvestmentValue(investments, "Bond"),
                sumTotal  = sumStocks + sumBonds;
                
                return (sumStocks / sumTotal);
        }
        
        
        /* CALCULATE TARGET PERCENTAGE OF STOCKS TO HOLD IN PORTFOLIO
         *
         * @params  [number]    requiredRate    [rate required to meet FIRE Calc savings goal]
         * @params  [array]     investments     [all investments]
         * @returns [number]                    [percentage of stocks to hold given required rate]
        */
        function getTargetPercentStocks(requiredRate, investments) {
            var sumStocks = sumInvestmentValue(investments, "Stock"),
                sumBonds  = sumInvestmentValue(investments, "Bond"),
                sumTotal  = (sumStocks + sumBonds),
                weightedInvestments,
                sumStocksRoR = 0,
                sumBondsRoR = 0,
                greaterRoR,
                lesserRoR,
                percentStocks;
            
            // calculate weighted return for each holding in portfolio
            weightedInvestments = investments.map(function (holding) {
                if (holding.type === "Stock") {
                    return {
                        ticker: holding.ticker,
                        value: holding.value,
                        type: holding.type,
                        avgReturn: holding.avgReturn,
                        weightedReturn: holding.avgReturn * holding.value / sumStocks
                    };
                } else {
                    return {
                        ticker: holding.ticker,
                        value: holding.value,
                        type: holding.type,
                        avgReturn: holding.avgReturn,
                        weightedReturn: holding.avgReturn * holding.value / sumBonds
                    };
                }
            });
            
            // loop through weighted investments array, adding weighted returns to
            // sumStocksRoR or sumBondsRor
            weightedInvestments.forEach(function (holding) {
                if (holding.type === "Stock") {
                    sumStocksRoR += holding.weightedReturn;
                } else {
                    sumBondsRoR += holding.weightedReturn;
                }
            });
            
            // determin which asset class has higher return
            if (sumStocksRoR > sumBondsRoR) {
                greaterRoR = sumStocksRoR;
                lesserRoR  = sumBondsRoR;
            } else {
                greaterRoR = sumBondsRoR;
                lesserRoR  = sumStocksRoR;
            }
            
            // handle extreme cases
            if (requiredRate > greaterRoR) {
                // if required rate exceeds greaterRoR hold 100% stocks
                return 1;
            } else if (requiredRate < lesserRoR) {
                // if required rate lower than lesserRoR hold 100% bonds (0 stocks)
                return 0;
            } else {
                // normal case: calculate percentage of stocks required
                return (requiredRate - sumBondsRoR) / (sumStocksRoR - sumBondsRoR);
            }
            
        }

        
        /* CALCULATE AGGREGATE AVERAGE PORTFOLIO RATE OF RETURN
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
            getPercentStocks: getPercentStocks,
            getTargetPercentStocks: getTargetPercentStocks,
            avgPortfolioReturn: avgPortfolioReturn
        };
        
    }]);
    
}());