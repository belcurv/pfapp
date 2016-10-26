(function () {
    'use strict';
    
    angular.module('pfapp')
    
        .controller('pfappStorageController', ['LS', function (LS) {

            var vm = this;

            // localStorage!
            vm.value = LS.getData();
            
            vm.storageArray = LS.getData() || [];
            
            vm.latestData = function () {
                return LS.getData();
            };
            
            vm.update = function (val) {
                return LS.setData(val);
            };
            
            vm.pushToArray = function (val) {
                vm.storageArray.push(val);
                LS.setData(vm.storageArray);
            };
            
            vm.clearStorage = function () {
                LS.deleteData();
                vm.storageArray.length = 0;
            };
            

        }]);
    
}());