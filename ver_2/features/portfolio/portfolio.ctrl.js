(function () {
    'use strict';

    angular.module('pfapp')

        .controller('portfolioController', ['LS', function (LS) {

            var vm = this,
                arr = [],
                pfDefaults = [
                    []
                ];

        
            // fetch input data from either localStorage or defaults
            function loadState() {
                if (LS.getData('portfolio-storage')) {
                    // when vtrue;
                    vm.portfolioDataSource = 'Using saved data from local storage';
                    return LS.getData('portfolio-storage');
                } else {
                    // when false;
                    vm.portfolioDataSource = 'No data in local storage';
                    return pfDefaults;
                }
            }
            
            
            // bind input data to model
            function setState() {
                // call loadState, which returns array
                var arr = loadState();
                // bind
                vm.state = {
                    investments: arr[0],
                    newTickerType: "stock"
                };
            }
            
            // call on first hit
            setState();
            
            // public methods
            vm.pfMethods = {
                saveState: saveState,
                deleteData: deleteData,
                addInvestment: addInvestment,
                deleteInvestment: deleteInvestment,
                sumInvestmentValue: sumInvestmentValue,
                allocationRatio: allocationRatio
            };
            
            
            // add investment to the array
            function addInvestment(ticker, val, type) {
                // push new investment to model array
                vm.state.investments.push({
                    ticker: ticker,
                    value: val,
                    type: type
                });
                // save state
                saveState();
                // clear input fields
                vm.state.newTicker = '';
                vm.state.newTickerValue = '';
            }
            
                       
            // delete single investment
            function deleteInvestment(index) {
                // index comes from view ng-repeat $index
                vm.state.investments.splice(index, 1);
                // fire a save after removing the item
                // saveState() triggers a setState() which refreshes view
                saveState();
            }
            
            // Save current state to local storage
            function saveState() {
                LS.setData('portfolio-storage', [
                    vm.state.investments
                ]);
                // reset state; will use local storage values
                setState();
            }
            
            // wipe personal portfolio info from local storage
            function deleteData() {
                // delete personal portfolio data
                LS.deleteData('portfolio-storage');
                // reset state; will use defaults
                setState();
            }
            
            function sumInvestmentValue(type) {
                var sum = 0,
                    i;
                // loop through investments
                for (i = 0; i < vm.state.investments.length; i += 1) {
                    // add each investment's value to sum
                    if (vm.state.investments[i].type === type) {
                        sum += vm.state.investments[i].value;
                    }
                }
                // return the sum
                return sum;
            }
            
            function allocationRatio() {
                var sumBonds = sumInvestmentValue("Bond"),
                    sumStocks = sumInvestmentValue("Stock"),
                    sumTotal = 0,
                    ratioStocks;
                
                sumTotal += sumBonds + sumStocks;
                
                ratioStocks = sumStocks / sumTotal;
                
                return ratioStocks;
            }

            
            
        }]);
}());