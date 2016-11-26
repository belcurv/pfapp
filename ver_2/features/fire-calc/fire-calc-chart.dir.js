(function () {
    'use strict';

    angular.module('pfapp')

        .directive('fireCalcChart', [function () {
            
            var link = function (scope, elem, attrs) {
                

                // bind chart layout attributes to scope
                scope.width   = 600;
                scope.height  = 400;
                scope.xMargin = 90;
                scope.yMargin = 20;
                scope.spacer  = 10;
                
                // init and bind axis label arrays
                scope.xAxisLabels = [];
                scope.yAxisLabels = [];
                

                // add SVG viewBox attributes string to <svg id="svg">
                // string syntax: "0 0 600 400"            
                angular.element(document.getElementById('svg'))
                    .attr('viewBox', '0 0 ' + scope.width + ' ' + scope.height);

                
                // watch 'fireState' (the inputs) for changes.
                // on changes, update points and axis labels
                scope.$watchCollection('fireState', function () {
                    scope.points = buildArr(scope.fireState.FVrate, scope.fireState.FVpmt, scope.fireState.FVpv, scope.nper);
                    
                    scope.points2 = buildArr(scope.requiredRate, scope.fireState.FVpmt, scope.fireState.FVpv, scope.nper);
                    
                    genXLabels(scope.points);
                    genYLabels(scope.points);
                });
                
                
                // standard future value calculator
                function calcFv(rate, pmt, pv, nper) {
                    
                    // check whether rate is decimal or fraction, convert if nec
                    if (rate > 1) {
                        rate = rate / 100;
                    }

                    var fv = ((pmt * (Math.pow(1 + rate, nper) - 1) / rate) + (pv * Math.pow(1 + rate, nper)));

                    return Math.abs(fv);
                }


                // build array of time-value pairs
                // uses FV calc, iterating nper from 0 to nper
                function buildArr(rate, pmt, pv, nper) {
                    var outputArr = [],
                        j,
                        y;

                    for (j = 0; j < nper + 1; j += 1) {
                        y = calcFv(rate, pmt, pv, j);
                        outputArr.push([j, y]);
                    }
                    return outputArr;
                }


                // build and bind coord array from FV inputs w/ FVrate
                scope.points = buildArr(scope.fireState.FVrate, scope.fireState.FVpmt, scope.fireState.FVpv, scope.nper);
                
                // build and bind coord array from FV inputs w/ requiredRate
                scope.points2 = buildArr(scope.requiredRate, scope.fireState.FVpmt, scope.fireState.FVpv, scope.nper);

                // build SVG path string
                scope.linePath = function (points) {
                    var path,
                        pathParts = [],
                        currentPoint,
                        xMargin = scope.xMargin,
                        yMargin = scope.yMargin,
                        spacer = scope.spacer,
                        i,
                        numPoints = points.length - 1,
                        yMax = points[points.length - 1][1],

                        // multipliers scale the output x & y coords
                        xMultiple = (scope.width - xMargin - spacer) / numPoints,
                        yMultiple = (scope.height - yMargin - spacer) / yMax,

                        // convert y values to start at chart bottom
                        formattedPoints = points.map(function (point) {
                            return [(point[0] * xMultiple) + xMargin, (scope.height - (point[1] * yMultiple)) - yMargin];
                        });

                    scope.yMultiple = yMultiple;

                    // build path array
                    for (i = 0; i < formattedPoints.length; i += 1) {
                        currentPoint = formattedPoints[i];

                        pathParts.push(currentPoint[0] + ',' + currentPoint[1]);
                    }

                    // convert path array to string
                    // because SVG path 'd' attr expects a string
                    path = 'M' + pathParts.join(' L') + ' L' + (scope.width - spacer) + ',' + (scope.height - yMargin) + ' L' + xMargin + ',' + (scope.height - yMargin) + ' Z';

                    return path;
                };

                // build SVG path string
                scope.linePath2 = function (points) {
                    var path,
                        pathParts = [],
                        currentPoint,
                        xMargin = scope.xMargin,
                        yMargin = scope.yMargin,
                        spacer = scope.spacer,
                        numPoints = points.length - 1,
                        i,

                        // multipliers scale the output x & y coords
                        xMultiple = (scope.width - xMargin - spacer) / numPoints,
                        yMultiple = scope.yMultiple,

                        // convert y values to start at chart bottom
                        formattedPoints = points.map(function (point) {
                            return [(point[0] * xMultiple) + xMargin, (scope.height - (point[1] * yMultiple)) - yMargin];
                        });

                    // build path array
                    for (i = 0; i < formattedPoints.length; i += 1) {
                        currentPoint = formattedPoints[i];

                        pathParts.push(currentPoint[0] + ',' + currentPoint[1]);
                    }

                    // convert path array to string
                    // because SVG path 'd' attr expects a string
                    path = 'M' + pathParts.join(' L') + ' L' + (scope.width - spacer) + ',' + (scope.height - yMargin) + ' L' + xMargin + ',' + (scope.height - yMargin) + ' Z';

                    return path;
                };


                // generate x axis label matrix
                // each array element consists of two values:
                //   1) the SVG x value for positioning axis label text in the SVG graph
                //   2) the actual nper value for label text
                function genXLabels(points) {
                    var numPoints = points.length - 1,
                        xMargin = scope.xMargin,
                        spacer = scope.spacer,
                        xMultiple = (scope.width - xMargin - spacer) / numPoints,
                        xAxisMatrix = [],
                        xValue,
                        xPos,
                        i;

                    // clear
                    scope.xAxisLabels.length = 0;

                    for (i = 0; i < points.length; i += 1) {
                        // calculate y axis label values
                        xValue = points[i][0];

                        // calculate y position
                        xPos = points[i][0] * xMultiple;

                        // push
                        scope.xAxisLabels.push([xPos, xValue]);
                    }

                }
                genXLabels(scope.points);


                // generate y axis label matrix
                // each array element consists of two values:
                //   1) the SVG y value for positioning axis label text in the SVG graph
                //   2) the actual FV value for each label
                function genYLabels(points) {
                    var numPoints,
                        yMargin = scope.yMargin,
                        spacer = scope.spacer,
                        yspacing,
                        yMax = points[points.length - 1][1],
                        yValue,
                        yPos,
                        i;
                    
                    // limit qty of Y axis labels to 10
                    // points.length is 1 more than the number of years to FIRE
                    // because it includes year 0
                    if (points.length > 10) {
                        numPoints = 10;
                    } else {
                        numPoints = points.length - 1;
                    }
                    
                    // calculate relative space between each Y axis label
                    yspacing = (scope.height - yMargin - spacer) / numPoints;
                    
                    // clear the array before each rebuild
                    scope.yAxisLabels.length = 0;

                    // loop through points and push axis labels to yAxisLabels array
                    for (i = 0; i < points.length; i += 1) {
                        // calculate y axis label value
                        yValue = i * yMax / numPoints;

                        // calculate y axis label position
                        yPos = scope.height - yspacing * i;

                        // push yPos & yValue to yAxisLabels array
                        scope.yAxisLabels.push([yPos, yValue]);
                    }

                }
                genYLabels(scope.points);

            };
        
            return {
                restrict: 'AE',
                scope: {
                    fireState: '=',
                    nper: '=',
                    requiredRate: '='
                },
                templateUrl: 'features/fire-calc/fire-calc-chart.tpl.html',
                link: link
            };



        }]);


}());