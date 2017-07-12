define(['../../../thirdparty/papaparse'], function (Papa) {

    var CsvReader = CsvReader || {};

    /**
     * Read the data from a CSV file and goes back to the original function from which was called
     * @param urlData: url to retrieve the file
     * @param resolve: function to execute when finished
     * @param delimiter: delimiter of the CSV file
     */
    CsvReader.getData = function (urlData, resolve, delimiter) {
        Papa.parse(urlData, {
            download: true,
            delimiter: delimiter,
            complete: function (res) {
                var data = CsvReader.removeEmpty(res.data);
                resolve(data);
            }
        });
    };


    /**
     * Remove the last line of the file if it is empty
     * @param data: the data retrieved from the csv
     * @returns {*}
     */
    CsvReader.removeEmpty = function (data) {
        if (data[data.length - 1] == "" || data[data.length - 1] == undefined) {
            data.splice(data.length - 1);
        }

        return data
    };
    return CsvReader;
});
