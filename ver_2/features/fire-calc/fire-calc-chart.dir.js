(function () {
    'use strict';

    angular.module('pfapp')

        // XML-ish namespace for created SVG elements
        .constant('ns', 'http://www.w3.org/2000/svg')

        .directive('fireCalcChart', ['$filter', 'ns', 'fireMath', function ($filter, ns, fireMath) {

            var link = function (scope, elem, attrs) {

                // define chart layout attributes
                var width = 600,
                    height = 300,
                    xMargin = 80,
                    yMargin = 20,
                    spacer = 10,

                    // init empty coord point containers
                    points = [],

                    // capture SVG element
                    svgElem = angular.element(document.getElementById('svg'));


                // add CSS class and attributes to SVG element
                svgElem.addClass('chart--content')
                    .attr('width', '100%')
                    .attr('height', '100%')
                    .attr('xmlns', 'http://www.w3.org/2000/svg')
                    .attr('viewBox', '0 0 ' + width + ' ' + height);


                // watch isolate scope paramters for changes.
                // On changes, update points and re-render chart
                scope.$watchGroup([
                    'fireState.FVrate',
                    'fireState.FVpmt',
                    'fireState.FVpv',
                    'nper',
                    'requiredSavings'
                ], function () {
                    
                    points = buildArr(scope.fireState.FVrate, scope.fireState.FVpmt, scope.fireState.FVpv, scope.nper);
                    
                    render();
                
                });
                

                // build array of time-value pairs
                // uses FV calc, iterating nper from 0 to nper
                function buildArr(rate, pmt, pv, nper) {
                    var outputArr = [],
                        j,
                        y;

                    for (j = 0; j < nper + 1; j += 1) {
                        y = fireMath.calcFV(rate, pmt, pv, j);
                        outputArr.push([j, y]);
                    }
                    return outputArr;
                }
                

                // build and bind coord array from FV inputs w/ FVrate
                points = buildArr(scope.fireState.FVrate, scope.fireState.FVpmt, scope.fireState.FVpv, scope.nper);
                

                // Calculate maximum vertical (Y) chart axis value.
                // Max value is multiple of $50,000
                function getChartYMax(points) {
                    var reqSavings = scope.requiredSavings,
                        maxYPoint = points[points.length - 1][1],
                        largerVal,
                        howManyFiftys;

                    if (reqSavings > maxYPoint) {
                        howManyFiftys = Math.floor((reqSavings + 1) / 50000);
                    } else {
                        howManyFiftys = Math.floor(maxYPoint / 50000);
                    }

                    return ((howManyFiftys + 1) * 50000);
                }


                // build SVG path string
                var linePath = function (points) {
                    var path,
                        pathParts = [],
                        currentPoint,
                        i,
                        numPoints = points.length - 1,
                        yMax = points[points.length - 1][1],
                        chartYMax = getChartYMax(points),

                        // multipliers scale the output x & y coords
                        xMultiple = (width - xMargin - spacer) / numPoints,
                        yMultiple = (height - yMargin - spacer) / chartYMax,

                        // convert y values to start at chart bottom
                        formattedPoints = points.map(function (point) {
                            return [
                                (point[0] * xMultiple) + xMargin,
                                (height - (point[1] * yMultiple)) - yMargin
                            ];
                        });

                    // build path array
                    for (i = 0; i < formattedPoints.length; i += 1) {
                        currentPoint = formattedPoints[i];

                        pathParts.push(currentPoint[0] + ',' + currentPoint[1]);
                    }

                    // convert path array to string
                    // because SVG path 'd' attr expects a string
                    path = 'M' + pathParts.join(' L') +
                        ' L' + (width - spacer) + ',' + (height - yMargin) +
                        ' L' + xMargin + ',' + (height - yMargin) +
                        ' Z';

                    return path;
                };


                /* GENERATE GOAL LINE 
                 * @params  [array]  points   [array of coordinate points]
                 * @params  [number] goal     [target savings goal from controller]
                 * @returns [object]          [<g>roup of axis <line> and <text> els]
                 */
                function genGoalLine(points, goal) {
                    var group = angular.element(document.createElementNS(ns, 'g')),
                        line = angular.element(document.createElementNS(ns, 'line')),
                        text = angular.element(document.createElementNS(ns, 'text')),
                        chartYMax = getChartYMax(points),
                        yMultiple = goal / chartYMax,
                        goalYVal = height - yMargin - ((height - yMargin - spacer) * yMultiple);

                    // add attributes to axis elements
                    group.addClass('goal-line');
                    line.attr('x1', xMargin)
                        .attr('y1', goalYVal)
                        .attr('x2', (width - spacer))
                        .attr('y2', goalYVal);

                    // add attributes to <text> element
                    text.addClass('goal-text')
                        .attr('x', (xMargin + 3))
                        .attr('y', (goalYVal + 12))
                        .html('Goal: ' + $filter('currency')(goal));

                    // append the <line> and <text> to the <g>
                    group.append(line);
                    group.append(text);

                    return group;
                }


                /* GENERATE AXIS LABELS
                 *
                 * @params  [array]     points  [array of coordinate points]
                 * @params  [string]    axis    ['y' or 'x' specifies conditional path]
                 * @returns [object]            [<g>roup of axis <line> and <text> els]
                 */
                function genAxisLabels(points, axis) {

                    // ns comes from our angular.constant()
                    var group = angular.element(document.createElementNS(ns, 'g')),
                        line, // placeholder for <line> element built in loop
                        text, // placeholder for <text> element built in loop
                        numPoints,
                        xPos, xValue, xMultiple,
                        yPos, yValue, ySpacing,
                        yMax = points[points.length - 1][1],
                        chartYMax = getChartYMax(points),
                        i;

                    // conditionally handle passed axis param
                    if (axis === 'y') {

                        // add CSS class to <g> element
                        group.addClass('labels y-labels');

                        // limit qty of Y axis labels to 10
                        // points.length is 1 more than the number of years to FIRE
                        // because it includes year 0
                        if (points.length > 10) {
                            numPoints = 10;
                        } else {
                            numPoints = points.length - 1;
                        }

                        // calculate relative space between each Y axis label
                        ySpacing = (height - yMargin - spacer) / numPoints;

                        // loop through points, generate <line> and <text> elements,
                        // and append each of them to our <g> group
                        for (i = 0; i < points.length; i += 1) {
                            // calculate y axis label value
                            yValue = i * chartYMax / numPoints;

                            // calculate y axis label position
                            yPos = height - ySpacing * i;

                            // create new <line> element
                            line = angular.element(document.createElementNS(ns, 'line'));

                            // add attributes to <line> element
                            line.addClass('horiz-rule')
                                .attr('x1', xMargin)
                                .attr('y1', yPos - yMargin)
                                .attr('x2', (width - spacer))
                                .attr('y2', yPos - yMargin);

                            // create new <text> element
                            text = angular.element(document.createElementNS(ns, 'text'));

                            // add attributes to <text> element
                            text
                                .attr('x', (xMargin - 5))
                                .attr('y', (yPos - yMargin + 4))
                                .html($filter('currency')(yValue));

                            group
                                .append(line)
                                .append(text);

                        }
                        return group;

                    } else if (axis === 'x' || !axis || axis === null) {

                        // add CSS class to <g> element
                        group.addClass('labels x-labels');

                        numPoints = points.length - 1;
                        xMultiple = (width - xMargin - spacer) / numPoints;

                        // loop through points, generate <line> and <text> elements,
                        // and append each of them to our <g> group
                        for (i = 0; i < points.length; i += 1) {
                            // calculate y axis label values
                            xValue = points[i][0];

                            // calculate y position
                            xPos = points[i][0] * xMultiple;

                            // create new <line> element
                            line = angular.element(document.createElementNS(ns, 'line'));

                            // add attributes to <line> element
                            line.addClass('tick')
                                .attr('x1', (xPos + xMargin))
                                .attr('y1', (height - yMargin))
                                .attr('x2', (xPos + xMargin))
                                .attr('y2', (height - yMargin + 2));

                            // create new <text> element
                            text = angular.element(document.createElementNS(ns, 'text'));

                            // add attributes to <text> element
                            text
                                .attr('x', (xPos + xMargin))
                                .attr('y', (height - 5))
                                .html(xValue);

                            group
                                .append(line)
                                .append(text);
                        }
                        return group;
                    }
                }


                /* GENERATE AXIS LINES
                 * 
                 * @param   [string]    cssClass    [the CSS class selector]
                 * @param   [number]    x1          [starting x coord]
                 * @param   [number]    y1          [starting y coord]
                 * @param   [number]    x2          [ending x coord]
                 * @param   [number]    y2          [ending y coord]
                 * @returns [object]                [SVG <g> DOM group object]
                 */
                function genAxisLine(cssClass, x1, y1, x2, y2) {
                    // ns comes from our angular.constant()
                    var group = angular.element(document.createElementNS(ns, 'g')),
                        line = angular.element(document.createElementNS(ns, 'line'));

                    // add attributes to axis elements
                    group.addClass(cssClass);
                    line.attr('x1', x1)
                        .attr('y1', y1)
                        .attr('x2', x2)
                        .attr('y2', y2);

                    // append the <line> to the <g>
                    group.append(line);

                    return group;
                }


                // MAIN RENDERER
                function render() {

                    // empty containing svgElem before refilling it
                    svgElem.empty();

                    // ns comes from our angular.constant()
                    var pathElem = document.createElementNS(ns, 'path');

                    // ! no idea why the first param is 'null' !
                    // Changing it to 'ns' breaks ?!  WTF XMLSVG?
                    pathElem.setAttributeNS(null, 'class', 'chart--line1');
                    pathElem.setAttributeNS(null, 'd', linePath(points));

                    // append paths
                    svgElem
                        .append(pathElem);

                    // append goal line
                    svgElem
                        .append(genGoalLine(points, scope.requiredSavings));

                    // append axis lines
                    svgElem
                        .append(genAxisLine('chart--x-grid', xMargin, spacer, xMargin, (height - yMargin)))
                        .append(genAxisLine('chart--y-grid', xMargin, (height - yMargin), (width - spacer), (height - yMargin)));

                    // append axis labels
                    svgElem
                        .append(genAxisLabels(points, 'y'))
                        .append(genAxisLabels(points, 'x'));

                }
                render();

            };
            

            // DDO
            return {
                restrict: 'AE',
                scope: {
                    fireState: '=',
                    nper: '=',
                    requiredSavings: '='
                },
                template: '<svg id="svg"></svg>',
                link: link
            };

        }]);

}());