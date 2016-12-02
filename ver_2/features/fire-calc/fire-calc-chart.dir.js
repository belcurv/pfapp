(function () {
    'use strict';

    angular.module('pfapp')

        // SVG namespace for use when creating SVG elements
        .constant('ns', 'http://www.w3.org/2000/svg')

        .directive('fireCalcChart', ['$filter', 'ns', 'fireMath', function ($filter, ns, fireMath) {

            var link = function (scope, elem, attrs) {

                // define chart layout attributes
                var width   = 600,
                    height  = 400,
                    xMargin = 80,
                    yMargin = 20,
                    spacer  = 10,

                    // init empty coord point container
                    points = [],

                    // capture SVG element
                    svgElem = angular.element(document.getElementById('svg'));


                // add CSS class, namespace and attributes to main <svg> element
                svgElem.addClass('chart--content')
                    .attr('xmlns', ns)
                    .attr('width', '100%')
                    .attr('height', '100%')
                    .attr('viewBox', '0 0 ' + width + ' ' + height);


                // watch isolate scope paramters for changes & re-render chart
                scope.$watchGroup([
                    'fireState.FVrate',
                    'fireState.FVpmt',
                    'fireState.FVpv',
                    'nper',
                    'requiredSavings'
                ], function () {
                    render();
                });
                

                /* BUILD ARRAY OF TIME-VALUE PAIRS
                 * Uses calcFV from fireMath factory
                 *
                 * @params   [number]   rate   [annual interest rate]
                 * @params   [number]   pmt    [annual contribution]
                 * @params   [number]   pv     [present account value]
                 * @params   [number]   nper   [number of periods in years]
                 * @returns  [array]           [array of time-value pairs]
                */
                function buildArr(rate, pmt, pv, nper) {
                    var outputArr = [],
                        time,
                        value;
                    
                    // avoid zero or negative nper values
                    if (nper <= 1) {
                        nper = 1;
                    }

                    for (time = 0; time < nper + 1; time += 1) {
                        value = fireMath.calcFV(rate, pmt, pv, time);
                        outputArr.push([time, value]);
                    }
                    return outputArr;
                }
                

                /* CALCULATE MAXIMUM VERTICAL (Y) CHART AXIS VALUE
                 * Max Y value is multiple of $50,000 to make the chart look nice
                 *
                 * @params    [array]   points   [array of time-value pairs]
                 * @returns   [number]           [maximum chart Y axis value]
                */
                function getChartYMax(points) {
                    var reqSavings = scope.requiredSavings,
                        maxYPoint = points[points.length - 1][1],
                        howManyFiftys;

                    if (reqSavings > maxYPoint) {
                        howManyFiftys = Math.floor((reqSavings + 1) / 50000);
                    } else {
                        howManyFiftys = Math.floor(maxYPoint / 50000);
                    }

                    // return 1 more than the quotient, times 50000
                    return ((howManyFiftys + 1) * 50000);
                }

                
                /* GENERATE SVG POLYGONS
                 *
                 * @params    [array]   points   [array of time-value pairs]
                 * @returns   [object]           [<g>roup of SVG <polygon> els]
                 */
                function genPolygon(points) {
                    var group = angular.element(document.createElementNS(ns, 'g')),
                        polygon,
                        pointsString,                
                        currentPoint,
                        formattedPoints,
                        i,
                        numPoints = points.length - 1,
                        chartYMax = getChartYMax(points),

                        // multipliers scale the output x & y coords
                        xMultiple = (width - xMargin - spacer) / numPoints,
                        yMultiple = (height - yMargin - spacer) / chartYMax,

                        // format values to align with chart extents
                        formattedPoints = points.map(function(point) {
                           return [
                              (point[0] * xMultiple) + xMargin,
                              (height - (point[1] * yMultiple)) - yMargin
                           ];
                        });

                    // loop through points array to build pathParts array
                    for (i = 0; i < formattedPoints.length; i += 1) {

                        polygon = angular.element(document.createElementNS(ns, 'polygon'));

                        var title = angular.element(document.createElementNS(ns, 'title'));

                        // <polygon> wants a 'points' attr, consisting of x,y pairs
                        var x1 = formattedPoints[i][0],
                            y1 = height - yMargin,

                            x2 = formattedPoints[i][0],
                            y2 = formattedPoints[i][1],

                            x3 = formattedPoints[i][0] + xMultiple,
                            y3, // tricky - see below conditional

                            x4 = formattedPoints[i][0] + xMultiple,
                            y4 = height - yMargin;

                        // y3 is trickier since there is no (i + 1) for the last element
                        if (i < formattedPoints.length - 1) {
                            y3 = formattedPoints[i + 1][1];
                            // <title> adds 'tool tip' on hover
                            title.text($filter('currency')(points[i + 1][1]));
                        } else {
                            y3 = formattedPoints[formattedPoints.length];
                            // <title> adds 'tool tip' on hover
                            title.text($filter('currency')(points[points.length]));
                        }

                        // assemble 'points' attr as a giant string
                        pointsString = x1 + ',' + y1 + ' ' + x2 + ',' + y2 + ' ' + x3 + ',' + y3 + ' ' + x4 + ',' + y4;

                        // add 'points' attribute to <polygon>
                        polygon.attr('points', pointsString);

                        // add <title> child elements for hover events
                        polygon.append(title);

                        // add assembled <polygon> object to the <g>roup
                        group.append(polygon);
                    }

                    // add CSS class to <g>roup element
                    group.addClass('chart--polygon');

                    // return the whole <g>roup object
                    return group;
                }


                /* GENERATE GOAL LINE
                 *
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

                    // add attributes to goal <line> element
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

                    // append goal <line> and <text> to the <g>roup
                    group.append(line);
                    group.append(text);

                    return group;
                }


                /* GENERATE AXIS LABELS
                 *
                 * 'ns' (namespace) comes from our angular.constant()
                 *
                 * @params  [array]    points  [array of coordinate points]
                 * @params  [string]   axis    ['y' or 'x' specifies conditional path]
                 * @returns [object]           [<g>roup of axis <line> and <text> els]
                 */
                function genAxisLabels(points, axis) {

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
                        // and append each of them to our <g>roup
                        for (i = 0; i < points.length; i += 1) {
                            // calculate y axis label value
                            yValue = i * chartYMax / numPoints;

                            // calculate y axis label position
                            yPos = height - yMargin - (ySpacing * i);

                            // create new <line> element
                            line = angular.element(document.createElementNS(ns, 'line'));

                            // add attributes to <line> element
                            line.addClass('horiz-rule')
                                .attr('x1', xMargin)
                                .attr('y1', yPos)
                                .attr('x2', (width - spacer))
                                .attr('y2', yPos);

                            // create new <text> element
                            text = angular.element(document.createElementNS(ns, 'text'));

                            // add attributes to <text> element
                            text
                                .attr('x', (xMargin - 5))
                                .attr('y', (yPos + 4))
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
                 * 'ns' (namespace) comes from our angular.constant()
                 * 
                 * @param   [string]    cssClass    [the CSS class selector]
                 * @param   [number]    x1          [starting x coord]
                 * @param   [number]    y1          [starting y coord]
                 * @param   [number]    x2          [ending x coord]
                 * @param   [number]    y2          [ending y coord]
                 * @returns [object]                [SVG <g> DOM group object]
                 */
                function genAxisLine(cssClass, x1, y1, x2, y2) {

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


                /* MAIN RENDERER
                 * 'ns' (namespace) comes from our angular.constant()
                */
                function render() {
                    
                    // build coord points array from fireState inputs and nper
                    points = buildArr(scope.fireState.FVrate, scope.fireState.FVpmt, scope.fireState.FVpv, scope.nper);

                    // empty parent <svg> element before each render
                    svgElem
                        .empty();

                    // append <polygon> <g>roup
                    svgElem
                        .append(genPolygon(points));

                    // append goal <line> and <text> <g>roup
                    svgElem
                        .append(genGoalLine(points, scope.requiredSavings));

                    // append axis <line> and <text> <g>roups
                    svgElem
                        .append(genAxisLine('chart--x-grid', xMargin, spacer, xMargin, (height - yMargin)))
                        .append(genAxisLine('chart--y-grid', xMargin, (height - yMargin), (width - spacer), (height - yMargin)));

                    // append axis label <text> <g>roups
                    svgElem
                        .append(genAxisLabels(points, 'y'))
                        .append(genAxisLabels(points, 'x'));

                }
                
                // call immediately on page load
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