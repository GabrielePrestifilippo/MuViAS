define([], function () {

    /**
     * Defines a new Google Chart object
     * @constructor
     */
    var Chart = function () {
        google.charts.load('current', {
            'packages': ['corechart']
        });
        google.charts.setOnLoadCallback();
    };

    /**
     * Draw the chart on the user interface
     * @param data: data to draw
     * @param options: options to assign to the chart
     */
    Chart.prototype.draw = function (data, options) {
        this.chart = new google.visualization.AreaChart($('#chart_div')[0]);
        this.chart.draw(data, options);
        this.started=1;
    };

    /**
     * Set a point in the chart specifying the current time step
     * @param actualTime: actual time step
     * @param compare: set which variable are we analyzing
     */
    Chart.prototype.setPoint = function (actualTime, compare) {
        this.chart.setSelection([{
            row: actualTime,
            column: compare + 1
        }]);
    };
    return Chart;
});