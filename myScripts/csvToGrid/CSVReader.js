define([], function () {

    var CsvReader = CsvReader || {};

    CsvReader.getData = function (urlData,resolve) {
        Papa.parse(urlData, {
            download: true,
            delimiter: ";",
            complete: function (res) {
                resolve(res.data);
            }
        });
    };


    return CsvReader;
});
