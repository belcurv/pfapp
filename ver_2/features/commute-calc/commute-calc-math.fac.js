(function () {
    'use strict';

    angular

        .module('pfapp')

        .factory('ccMath', [function () {

            // calculate total round-trip cost from one origin to destination
            // @params  [number] miles       [one-way distance from origin to dest]
            // @params  [number] hours       [one-way duration from origin to dest]
            // @params  [number] mileageRate [money cost per mile]
            // @params  [number] hourlyRate  [money cost per hour]
            // @returns [number]             [total round trip cost]
            function oneOriginTotalCost(miles, hours, mileageRate, hourlyRate) {
                return (2 * (miles * mileageRate + hours * hourlyRate));
            }

            // convert response object distance from meters to miles
            // @params  [number] meters   [distance value from gmaps response object]
            // @returns [number]          [distance in miles]
            function metersToMiles(meters) {
                return meters / 1609.344;
            }

            // convert response object duration from seconds to hours
            // @params  [number] seconds  [duration value from gmaps response object]
            // @returns [number]          [value in hours]
            function secondsToHours(seconds) {
                return seconds / 3600;
            }

            // calculate monthly difference in commute costs (daily cost difference
            // multiplied by number of week-days per month (260/12))
            // @params  [number] costA [round-trip cost from originA to destination]
            // @params  [number] costB [round-trip cost from originB to destination]
            // @returns [number]       [positive cost difference between commutes]
            function costDiff(costA, costB) {
                return (260 / 12) * (Math.abs(costA - costB));
            }
            
            // calculate per-mile OPERATING costs
            // @params  [number] gasPrice   [gas price per gallon]
            // @params  [number] mpg        [fuel efficiency in miles per gallon]
            // @params  [number] maint      [avg maintenance cost per mile]
            // @params  [number] tires      [avg tire cost per mile]
            // @returns [number]            [sum of per-mile OPERATING costs]
            function perMileOperatingCosts(gasPrice, mpg, maint, tires) {
                return (gasPrice / mpg) + maint + tires;
            }
            
            // calculate per-mile OWNERSHIP costs
            // @params  [number] insurance      [gas price per gallon]
            // @params  [number] licenseRegTax  [fuel efficiency in miles per gallon]
            // @params  [number] depreciation   [avg maintenance cost per mile]
            // @params  [number] finance        [avg tire cost per mile]
            // @params  [number] miles          [1-way commute miles]
            // @returns [number]                [sum of per-mile OWNERSHIP costs]
            function perMileOwnershipCosts(insurance, licenseRegTax, depreciation, finance, miles) {
                var annualCosts = insurance + licenseRegTax + depreciation + finance,
                    annualMiles = miles * 2 * 260;
                return annualCosts / annualMiles;
            }
            

            // build array from distance and duration.
            // multiplier array elements are function of 260 week days per year.
            // Examples:
            //   "Day" multiplier is 1 (260/260) "week days per day"
            //   "Week" multiplier is 5 (260/52) "week days per week"
            //   "Month" multiplier is ~21.67 (260/12) "week days per month"
            // @params  [number] miles    [one-way distance from origin to dest]
            // @params  [number] hours    [one-way duration from origin to dest]
            // @params  [number] rate     [money cost per mile]
            // @params  [number] rtMult   [rount-trip multiplier, either 1 or 2]
            // @params  [number] wage     [money cost per hour]
            // @returns [array]           [matrix of time periods and costs]   
            function buildArray(miles, hours, rate, rtMult, wage) {
                var i,
                    arr = [],
                    label = ["Day", "Week", "Month", "Year", "5 Years", "10 Years"],
                    multiplier = [(260 / 260), (260 / 52), (260 / 12), 260, (260 * 5), (260 * 10)];

                for (i = 0; i < label.length; i += 1) {
                    arr.push({
                        per: label[i],
                        time: rtMult * hours * multiplier[i],
                        dist: rtMult * miles * multiplier[i],
                        carCost: rtMult * miles * rate * multiplier[i],
                        timeCost: rtMult * hours * wage * multiplier[i]
                    });
                }
                return arr;
            }

            return {
                oneOriginTotalCost: oneOriginTotalCost,
                metersToMiles: metersToMiles,
                secondsToHours: secondsToHours,
                costDiff: costDiff,
                perMileOperatingCosts: perMileOperatingCosts,
                perMileOwnershipCosts: perMileOwnershipCosts,
                buildArray: buildArray
            };
        
        }]);

}());