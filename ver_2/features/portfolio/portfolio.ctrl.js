(function () {
    'use strict';

    angular.module('pfapp')

        .controller('portfolioController', ['LS', 'pfMath', function (LS, pfMath) {

            var vm = this,
                pfDefaults = [
                    []
                ];

        
            /* fetch input data from either localStorage or defaults
             *
             * @params  [none]
             * @returns [array of portfolio holdings or blank defaults]
            */
            function loadState() {
                if (LS.getData('portfolio-storage')) {
                    vm.portfolioDataSource = 'Using saved data from local storage';
                    console.log(LS.getData('portfolio-storage'));
                    return LS.getData('portfolio-storage');
                } else {
                    vm.portfolioDataSource = 'No data in local storage';
                    return pfDefaults;
                }
            }
            
            
            /* bind input data to model
             *
             * @params  [none]
             * @returns [none]
            */
            function setState() {
                // call loadState, which returns array
                var arr = loadState();
                // bind
                vm.state = {
                    investments: arr[0],
                    newTickerType: "Stock"
                };
            }
            setState();  // call on first hit

            
            // public methods
            vm.pfMethods = {
                saveState: saveState,
                deleteData: deleteData,
                addInvestment: addInvestment,
                deleteInvestment: deleteInvestment,
                sumPortfolioValue: pfMath.sumPortfolioValue,
                sumInvestmentValue: pfMath.sumInvestmentValue,
                ratioStocks: pfMath.ratioStocks,
                avgPortfolioReturn: pfMath.avgPortfolioReturn
            };
            
            
            /* add investment to the array
             *
             * @params  [string]    ticker      [name of the hoding]
             * @params  [number]    val         [dollar value of the holding]
             * @params  [string]    type        [asset class: Stock or Bond]
             * @params  [number]    avgReturn   [10-yr avg return of the holding]
             * @returns                         [bunch o' bindings]
             */
            function addInvestment(ticker, val, type, avgReturn) {
                // push new investment to model array
                vm.state.investments.push({
                    ticker: ticker,
                    value: val,
                    type: type,
                    avgReturn: avgReturn
                });
                // save state
                saveState();
                // clear input fields
                vm.state.newTicker = '';
                vm.state.newTickerValue = '';
                vm.state.newAvgReturn = '';
            }
            
                       
            /* delete a single investment
             *
             * @params  [number]    index       [the index of the array element to remove]
             * @returns                         [none]
            */
            function deleteInvestment(index) {
                // index comes from view ng-repeat $index
                vm.state.investments.splice(index, 1);
                // fire a save after removing the item
                // saveState() triggers a setState() which refreshes view
                saveState();
            }
            
            
            /* Save current state to local storage
             *
             * @params  [none]
             * @returns [none]
            */
            function saveState() {
                var avgReturn = vm.pfMethods.avgPortfolioReturn(vm.state.investments);
                LS.setData('portfolio-storage', [vm.state.investments]);
                LS.setData('pfapp-storage', avgReturn);
                // reset state; will use local storage values
                setState();
            }
            
            
            /* wipe personal portfolio info from local storage
             *
             * @params  [none]
             * @returns [none]
            */
            function deleteData() {
                // delete personal portfolio data
                LS.deleteData('portfolio-storage');
                LS.deleteData('pfapp-storage');
                // reset state; will use defaults
                setState();
            }
            
            
        }]);
}());