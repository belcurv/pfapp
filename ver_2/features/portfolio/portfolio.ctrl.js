(function () {
    'use strict';

    angular.module('pfapp')

        .controller('portfolioController', ['LS', 'pfMath', function (LS, pfMath) {

            var vm = this,
                pfDefaults = [
                    []
                ];

        
            /* FETCH INPUT DATA FROM EITHER localStorage OR vm.pfDefaults
             *
             * @params  [none]
             * @returns [array of portfolio holdings or blank defaults]
            */
            function loadState() {
                if (LS.getData('portfolio-storage')) {
                    vm.portfolioDataSource = 'Using saved data from local storage';
                    return LS.getData('portfolio-storage');
                } else {
                    vm.portfolioDataSource = 'No data in local storage';
                    return pfDefaults;
                }
            }
            
            
            /* BIND INPUT DATA TO MODEL
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
            setState();  // call on page load

            
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
            
            
            /* ADD SINGLE HOLDING TO INVESTMENTS ARRAY
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
            
                       
            /* DELETE SINGLE INVESTMENT
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
            
            
            /* SAVE CURRENT STATE IN LOCAL STORAGE
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
            
            
            /* WIPE PERSONAL PORTFOLIO DATA FROM LOCAL STORAGE
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