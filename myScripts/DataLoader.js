define([], function () {

    var DataLoader = function (parent) {};

    /**
     * Get the data from a CSV file and parse them using "Papa Parse"
     * @param urlData : url to retrieve the CSV
     * @param resolve: resolve function to execute when finished
     * @param config: configuration used to get further the bounds
     */
    DataLoader.prototype.getData = function (urlData, resolve, config) {

        var self = this;
        var completed = 0;

        Papa.parse(urlData, {
            worker: false,
            download: true,
            preview: 6000,
            fastMode: true,
            complete: function (res) {
                if (!completed) {
                    completed = 1;
                    var data = DataLoader.removeEmpty(res.data);
                    data.bounds = self.getDataBounds(data, config, 0);
                    if(config.heightExtrusion) {
                        data.bounds1 = self.getDataBounds(data, config, 1);
                    }
                    resolve(data);
                    return 1;


                }
            }
        });
    };

    /**
     * Remove the last line of the file if it is empty
     * @param data: the data retrieved from the csv
     * @returns {*}
     */
    DataLoader.removeEmpty = function (data) {
        if (data[data.length - 1] == "" || data[data.length - 1] == undefined) {
            data.splice(data.length - 1);
        }

        return data
    };
    /**
     * Retrieve the bounds of the values from the data
     * @param data: the data retrieved from the parser
     * @param config: configuration with the structure of the CSV
     * @param n: select which variable are we interested in
     * @returns {*[]}: returns an array with a min and max of the data
     */
    DataLoader.prototype.getDataBounds = function (data, config, n) {
        var max = -Infinity;
        var min = Infinity;
        var tmp;
        for (var x = 0; x < data.length; x++) {
            tmp = data[x];
            if (tmp[config.data[0]].indexOf(config.separator) !== -1) {
                max = Math.max(max, tmp[config.data[n]].split(config.separator).join(""));
                min = Math.min(min, tmp[config.data[n]].split(config.separator).join(""));
            }
        }

        return [max, min];
    };

    return DataLoader;
});
