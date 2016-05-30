var wwd;
var layers;

define(['myScripts/DataLoader',
        'myScripts/GlobeHelper',
        'myScripts/csvToGrid/Converter',
        'myscripts/LayerGroup'
    ]
    , function (DataLoader, GlobeHelper, Converter, LayerGroup) {

        var AppConstructor = function () {
        };
        AppConstructor.prototype.newData = function (config1, gInterface) {
            GlobeHelper.clean(gInterface.smallVoxels.layers, gInterface.bigVoxels.layers, gInterface.globe);
            gInterface.smallVoxels = new LayerGroup();
            gInterface.config[1] = config1;
            var dataLoader = new DataLoader(this, 1);

            var promiseData = new Promise(function (resolve) {
                dataLoader.getData(config1.url, resolve, config1);
            });


            promiseData.then(function (data) {
                gInterface.myData[1] = data;

                var parsedData = gInterface.dataParser(data, gInterface.allTime, gInterface.times, config1, 1);
                gInterface.allTime = parsedData.allTime;
                gInterface.times = parsedData.times;
                [gInterface.allTime, gInterface.times]=gInterface.sliceTime(gInterface.allTime, gInterface.times);
                gInterface.doxelFromData(gInterface.allTime, gInterface.times,gInterface.config,1);

            });

        };
        AppConstructor.prototype.init = function (options, gInterface) {
            gInterface.init(options, this);
            GlobeHelper.clean(gInterface.smallVoxels, gInterface.bigVoxels, gInterface.globe);

            if (options.isCSV) {
                this.initCSV(options, gInterface);

            } else {
                this.initGridData(options, gInterface);
            }
        };
        AppConstructor.prototype.initCSV = function (options, gInterface) {

            var config = [];
            config[0] = options.config_0;
            config[0].data=options.csv.data;
            config[0].time=options.csv.time;
            var sub = options.sub;
            var maxDownload = options.maxDownload;
            var myData = [];
            var data;
            var promiseLoad = new Promise(function (resolve) {
                data = Converter.loadData(options.csv.csvUrl, resolve);
            });
            var self = this;
            promiseLoad.then(function (data) {
                var parsedData = Converter.initData(data, options.csv.zone, config[0], 0);
                data.bounds = self.getDataBounds(data, config[0]);
                var geojson = JSON.stringify(Converter.initJson(parsedData, options.csv.zone, options.csv.quadSub, options.csv.source));
                var promiseGrid = new Promise(function (resolve) {
                    gInterface.gridLayer = gInterface.loadGrid(geojson, 1, resolve);//should be json
                });

                promiseGrid.then(function () {
                    var resultRect = gInterface.createRect(sub, gInterface.gridLayer);
                    Converter.setGridtoData(geojson, parsedData.times);
                    gInterface.myData[0] = data;
                    gInterface.doxelFromData(parsedData.allTime, parsedData.times, config);
                    gInterface.allTime = parsedData.allTime;
                    gInterface.times = parsedData.times;
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
                var times = {};
                var parsedData = gInterface.dataParser(data, allTime, times, config[0], 0);
                gInterface.allTime = parsedData.allTime;
                gInterface.times = parsedData.times;
                gInterface.doxelFromData(parsedData.allTime, parsedData.times, config);
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
                    if(!isNaN(max) && !isNaN(min)) {
                        max = Math.max(max, Number(tmp[config.data[0]].split(config.separator).join("")));
                        min = Math.min(min, Number(tmp[config.data[0]].split(config.separator).join("")));
                    }
                } else {
                    if(!isNaN(max) && !isNaN(min)) {
                        max = Math.max(max, tmp[config.data[0]]);
                        min = Math.min(min, tmp[config.data[0]]);
                    }
                }
            }
            return [max, min];
        };
       
        return AppConstructor;
    });

