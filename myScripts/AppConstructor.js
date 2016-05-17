var wwd;
var layers;

define(['myScripts/DataLoader',
        'myScripts/GlobeHelper',
        'myScripts/csvToGrid/Converter',
    ]
    , function (DataLoader, GlobeHelper, Converter) {

        var AppConstructor = function () {
        };
        AppConstructor.prototype.newData = function (config1, gInterface) {
            GlobeHelper.clean(gInterface.layers, gInterface.bigCubes, gInterface.globe);
            gInterface.layers = [];
            gInterface.config[1] = config1;
            var dataLoader = new DataLoader(this, 1);

            var promiseData = $.Deferred(function () {
                dataLoader.getData(config1.url, this.resolve, config1);
            });

            $.when(promiseData).done(function (data) {
                gInterface.myData[1] = data;
                var parsedData = gInterface.dataParser(data, gInterface.allTime, gInterface.time, config1, 1);
                gInterface.allTime = parsedData.allTime;
                gInterface.time = parsedData.time;
                gInterface.doxelFromData(data, 1);

            });

        };
        AppConstructor.prototype.init = function (options, gInterface) {
            gInterface.init(options, this);
            GlobeHelper.clean(gInterface.layers, gInterface.bigCubes, gInterface.globe);

            if (options.isCSV) {
                this.initCSV(options, gInterface);

            } else {
                this.initGridData(options, gInterface);
            }
        };
        AppConstructor.prototype.initCSV = function (options, gInterface) {

            var config = [];
            config[0] = options.config_0;
            var sub = options.sub;
            var maxDownload = options.maxDownload;
            var myData = [];
            var data;
            var promiseLoad = $.Deferred(function () {
                data = Converter.loadData(options.csv.csvUrl, this.resolve);
            });
            var self = this;
            $.when(promiseLoad).done(function (data) {
                var parsedData = Converter.initData(data, options.csv.zone, config[0], 0);

                data.bounds = self.getDataBounds(data, config[0]);

                var geojson = JSON.stringify(Converter.initJson(parsedData, options.csv.zone, options.csv.source));

                var promiseGrid = $.Deferred(function () {
                    gInterface.gridLayer = gInterface.loadGrid(geojson, 1, this.resolve);//should be json
                });


                $.when(promiseGrid).done(function () {
                    var resultRect = gInterface.createRect(sub, gInterface.gridLayer);
                    gInterface.myData[0] = data;
                    gInterface.doxelFromData(parsedData.allTime, parsedData.time, config);
                    gInterface.allTime = parsedData.allTime;
                    gInterface.time = parsedData.time;
                    gInterface.rectInit(resultRect);
                });


            });

        };
        AppConstructor.prototype.initGridData = function (options, gInterface) {

            var config = [];
            config[0] = options.config_0;
            var sub = options.sub;
            var maxDownload = options.maxDownload;
            var myData = [];

            var dataLoader = new DataLoader(this, 0);
            gInterface.dataLoaded = 0;


            var promiseGrid = new Promise(function (resolve) {
                gInterface.gridLayer = gInterface.loadGrid(options.gridUrl, 0, resolve);
            });

            var promiseData = new Promise(function (resolve) {
                promiseGrid.then(function () {
                    dataLoader.getData(config[0].url, resolve, config[0]);
                });
            });

            promiseData.then(function (data) {
                gInterface.myData[0] = data;
                var allTime = [];
                var time = {};
                var parsedData = gInterface.dataParser(data, allTime, time, config[0], 0);
                gInterface.allTime = parsedData.allTime;
                gInterface.time = parsedData.time;
                gInterface.doxelFromData(parsedData.allTime, parsedData.time, config);
            });

            if (config[0].half) {
                new Promise(function (resolve) {
                    myData[1].getData(config[1].url, resolve, config[0]);
                });
            }

           Promise.all([promiseData, promiseGrid]).then(function () {
                var resultRect = gInterface.createRect(sub, gInterface.gridLayer);
                gInterface.rectInit(resultRect);
            });

        };
        AppConstructor.prototype.getDataBounds = function (result, config) {
            var max = -Infinity;
            var min = Infinity;
            var tmp;
            for (var x = 1; x < result.length; x++) {
                tmp = result[x];
                if (tmp[config.data[0]].indexOf(config.separator) !== -1) {
                    max = Math.max(max, tmp[config.data[0]].split(config.separator).join(""));
                    min = Math.min(min, tmp[config.data[0]].split(config.separator).join(""));
                } else {
                    max = Math.max(max, tmp[config.data[0]]);
                    min = Math.min(min, tmp[config.data[0]]);
                }
            }
            return [max, min];
        };
        return AppConstructor;
    });

