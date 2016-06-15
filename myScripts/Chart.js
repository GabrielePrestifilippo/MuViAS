define([], function () {

    var Chart = function () {
        google.charts.load('current', {
            'packages': ['corechart']
        });
        google.charts.setOnLoadCallback();
    };
    Chart.prototype.draw = function (data, options) {
        this.chart = new google.visualization.AreaChart($('#chart_div')[0]);
        this.chart.draw(data, options);
        this.started=1;
    };
    Chart.prototype.setPoint = function (actualTime, compare) {
        this.chart.setSelection([{
            row: actualTime,
            column: compare + 1
        }]);
    };
    return Chart;
});