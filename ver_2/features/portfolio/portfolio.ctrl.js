(function () {
    'use strict';

    angular.module('pfapp')

        .controller('portfolioController', ['LS', function (LS) {

            var vm = this,
                arr = [],
                pfDefaults = [];

        
            // fetch input data from either localStorage or defaults
            function loadState() {
                if (LS.getData('portfolio-storage')) {
                    // when vtrue;
                    vm.portfolioDataSource = 'Using locally-stored input values';
                    return LS.getData('portfolio-storage');
                } else {
                    // when false;
                    vm.portfolioDataSource = 'Using default input values';
                    return pfDefaults;
                }
            }
            
            
            // bind input data to model
            function setState() {
                // call loadState, which returns array
                var arr = loadState();
                // bind
                vm.state = {
                    
                };
            }
            
            // call on first hit
            setState();
            
            // public methods
            vm.pfMethods = {
                saveState: saveState,
                deleteData: deleteData,
                reset: reset
            };
            
            
            // Save current state to local storage
            function saveState() {
                LS.setData('portfolio-storage', [
                    //vm.state...
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
            
            // Reset app
            function reset() {
                vm.results.responseObject = '';
            }

            
            
        }]);
}());