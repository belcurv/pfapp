/* Inspired by:
 * http://stackoverflow.com/questions/5736398/how-to-calculate-the-svg-path-for-an-arc-of-a-circle
 */

(function () {
    'use strict';

    angular.module('pfapp')

        // 'ns' = namespace ('http://www.w3.org/2000/svg'), from:
        // /services/pfapp-svg-ns.constant.js
        .directive('portfolioPieChart', ['ns', function (ns) {

            function link(scope, elem, attr) {
                var height = 200,
                    width = 300,
                    chart = angular.element(document.getElementById('portfolio-pie-chart')),
                    circle,
                    cx = 150,
                    cy = 100,
                    path;

                // base SVG attributes
                chart
                    .attr('xmlns', ns)
                    .attr('width', '100%')
//                    .attr('height', '100%') // omitting height for FF
                    .attr('viewBox', '0 0 ' + width + ' ' + height);

                // background circle
                circle = angular.element(document.createElementNS(ns, 'circle'));

                circle
                    .addClass('arcBackground')
                    .attr('cx', cx)
                    .attr('cy', cy)
                    .attr('r', 100);

                // pie chart arc path
                path = angular.element(document.createElementNS(ns, 'path'));

                
                // convert input percentage to angle in degrees
                function percentageToDegrees(anglePercent) {
                    
                    // if 100%, no arc is drawn because beginning & end are the same point
                    if (anglePercent === 1) {
                        return 359.99 * anglePercent;
                    } else {
                        return 360 * anglePercent;
                    }                    
                    
                }

                
                // Convert polar coords (radius & angle) to cartesian coords.
                // Both Math.sin and Math.cos _require_ angles in RADIANS
                function polarToCartesian(centerX, centerY, radius, angleInDegrees) {

                    /* convert degrees to radians
                     * radians begin at 3 o'clock, so we have to subtract 90 degrees from
                     * 3 o'clock to find the end x,y relative to 12 o'clock.
                     */
                    var angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;

                    // calculate cartesian end points
                    return {
                        x: centerX + (radius * Math.cos(angleInRadians)),
                        y: centerY + (radius * Math.sin(angleInRadians))
                    };
                }

                
                // Generate Pie Slice Path
                function generateArc(x, y, radius, angleInDegrees) {

                    var start = {
                            x: x,
                            y: y - radius
                        },
                        end = polarToCartesian(x, y, radius, angleInDegrees),
                        largeArcFlag,
                        moveToCenter,
                        lineToTop,
                        arcTo,
                        d;

                    if (angleInDegrees <= 180) {
                        largeArcFlag = '0';
                    } else {
                        largeArcFlag = '1';
                    }

                    // move to circle (0,0) - works
                    moveToCenter = ['M', x, y].join(' ');

                    // draw line to (0,radius) - works
                    lineToTop = ['L', start.x, start.y].join(' ');

                    // assemble arc string from (0,radius) to (end.x,end.y) - works
                    arcTo = ['A', radius, radius, 0, largeArcFlag, 1, end.x, end.y].join(' ');

                    // concatenate everything
                    d = [moveToCenter, lineToTop, arcTo].join(' ');

                    return d;
                }

                
                // main render function
                function render() {
                    path
                        .attr('id', 'pie1')
                        .attr('d', generateArc(cx, cy, 100, percentageToDegrees(scope.percentage)));

                    chart
                        .append(circle)
                        .append(path);
                }
                render();
                
                
                // watch & rerender on isolate scope variable changes
                scope.$watch('percentage', function() {
                    render()
                });

            }

            // DDO
            return {
                restrict: 'AE',
                scope: {
                    percentage: '='
                },
                template: '<svg id="portfolio-pie-chart"></svg>',
                link: link
            };

        }]);

}());