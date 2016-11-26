(function () {
    'use strict';

    angular.module('pfapp')

        .directive('fire-calc-chart', [function () {
            
            var link = function (scope, elem, attr) {
                
                scope.width = 600;
            scope.height = 400;
            scope.xMargin = 90;
            scope.yMargin = 20;
            scope.spacer = 10;

            // rate, pmt, pv, nper
            scope.inputs = {
                rate1: 0.06,
                rate2: 0.05,
                pmt: 10000,
                pv: 50000,
                nper: 20
            };

            scope.reCalc = function (inputs) {
                scope.points = buildArr(inputs.rate1, inputs.pmt, inputs.pv, inputs.nper);
                scope.points2 = buildArr(inputs.rate2, inputs.pmt, inputs.pv, inputs.nper);
                genXLabels(scope.points);
                genYLabels(scope.points);
            };

            // future value
            function calcFv(rate, pmt, pv, nper) {

                var fv = ((pmt * (Math.pow(1 + rate, nper) - 1) / rate) + (pv * Math.pow(1 + rate, nper)));

                return Math.abs(fv);
            }

            // build array of time,value pairs
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

            scope.points = buildArr(scope.inputs.rate1, scope.inputs.pmt, scope.inputs.pv, scope.inputs.nper);

            scope.points2 = buildArr(scope.inputs.rate2, scope.inputs.pmt, scope.inputs.pv, scope.inputs.nper);

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

            scope.xAxisLabels = [];

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

            };
            genXLabels(scope.points);

            scope.yAxisLabels = [];

            // generate y axis label matrix
            // each array element consists of two values:
            //   1) the SVG y value for positioning axis label text in the SVG graph
            //   2) the actual FV value for each label
            function genYLabels(points) {
                var numPoints = points.length - 1,
                    yMargin = scope.yMargin,
                    spacer = scope.spacer,
                    yspacing = (scope.height - yMargin - spacer) / numPoints,
                    yMax = points[points.length - 1][1],
                    yValue,
                    yPos,
                    i;

                // clear
                scope.yAxisLabels.length = 0;

                for (i = 0; i < points.length; i += 1) {
                    // calculate y axis label values
                    yValue = i * yMax / numPoints;

                    // calculate y position
                    yPos = scope.height - yspacing * i;

                    // push
                    scope.yAxisLabels.push([yPos, yValue]);
                }

            }
            genYLabels(scope.points);

           }]);
                
            }
            
            

    }]);


}());