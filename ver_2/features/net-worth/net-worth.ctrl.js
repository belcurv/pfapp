(function () {
    'use strict';
    
    angular.module('pfapp')
    
        .controller('netWorthController', ['LS', function (LS) {

            var vm = this;

            // localStorage!
            vm.value = LS.getData('fire-calc-storage');
            
            vm.storageArray = LS.getData('fire-calc-storage') || [];
            
            vm.latestData = function () {
                return LS.getData('fire-calc-storage');
            };
            
            vm.update = function (loc, val) {
                return LS.setData(loc, val);
            };
            
            vm.pushToArray = function (val) {
                vm.storageArray.push(val);
                LS.setData('pfapp-storage', vm.storageArray);
            };
            
            vm.clearStorage = function () {
                LS.clearData();
                vm.storageArray.length = 0;
            };
            

        }]);
    
}());