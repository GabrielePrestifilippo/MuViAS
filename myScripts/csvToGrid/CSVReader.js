define([], function () {

    var CsvReader = CsvReader || {};

    CsvReader.getData = function (urlData, resolve) {
        Papa.parse(urlData, {
            download: true,
            delimiter: ";",
            complete: function (res) {
                var data = CsvReader.removeEmpty(res.data);
                resolve(data);
            }
        });
    };



    CsvReader.removeEmpty = function (data) {
        if (data[data.length - 1] == "" || data[data.length - 1] == undefined) {
            data.splice(data.length - 1);
        }

        return data
    };
    return CsvReader;
});
