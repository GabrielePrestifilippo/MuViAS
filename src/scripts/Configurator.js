define(['../../thirdparty/papaparse'], function (Papa) {

    var configurator = function (parent) {
        this.parent = parent;
    };
    /**
     * Retrieve the first line from the file to configure the options in the user interface
     * @param urlData: url to retrieve the file
     * @param resolve: function to execute when finished
     */
    configurator.prototype.getConfig = function (urlData, resolve) {
        Papa.parse(urlData, {
            worker: false,
            download: true,
            preview: 1,
            fastMode: true,
            complete: function (res) {
                resolve(res.data[0]);
            }
        });
    };

    return configurator;
});