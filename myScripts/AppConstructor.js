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
            GlobeHelper.clean(gInterface.smallVoxels.layers, gInterface.bigVoxels.layers, gInterface.gridLayer, gInterface.globe);
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
                [gInterface.allTime, gInterface.times] = gInterface.sliceTime(gInterface.allTime, gInterface.times);
                gInterface.doxelFromData(gInterface.allTime, gInterface.times, gInterface.config, 1);

            });

        };
        AppConstructor.prototype.init = function (options, gInterface) {
            gInterface.init(options, this);
            GlobeHelper.clean(gInterface.smallVoxels, gInterface.bigVoxels, gInterface.gridlayer, gInterface.globe);

            if (options.isCSV) {
                this.initCSV(options, gInterface);

            } else {
                this.initGridData(options, gInterface);
            }
        };

        AppConstructor.prototype.addCsv = function (gInterface) {
            if (gInterface.options && gInterface.autoTile)
                this.initCSV(gInterface.options, gInterface, 1)
        };

        AppConstructor.prototype.initCSV = function (options, gInterface, addCsv) {
            GlobeHelper.clean(gInterface.smallVoxels.layers, gInterface.bigVoxels.layers, gInterface.gridLayer, gInterface.globe);
            gInterface._navigator.getVisibleAreaBoundaries();
            var config = [];
            gInterface.options = options;
            config[0] = options.config_0;
            config[0].data = options.csv.data;
            config[0].time = options.csv.time;
            config[0].delimiter = options.csv.delimiter;
            var sub = options.sub;
            var maxDownload = options.maxDownload;

            var promiseLoad = new Promise(function (resolve) {
                if (!addCsv) {
                     Converter.loadData(options.csv.csvUrl, resolve, config[0].delimiter);
                } else {
                    resolve(gInterface.allData);
                }
            });

            promiseLoad.then(function (data) {
                gInterface.allData=data;
                if (addCsv) {
                    gInterface.started = 1;
                    addCsv = gInterface._navigator.getVisibleAreaBoundaries();
                }
                data = Converter.filterData(data, config[0], addCsv);
                console.log("filterDone");
                var parsedData = Converter.initData(data, options.csv.zone, config[0], 0);
                data.bounds = Converter.getDataBounds(data, config[0], 0);
                if (config[0].heightExtrusion) {
                    data.bounds1 = Converter.getDataBounds(data, config[0], 1);
                }
                var geojson = JSON.stringify(Converter.initJson(parsedData, options.csv.zone, options.csv.quadSub, options.csv.source));
                var promiseGrid = new Promise(function (resolve) {
                    gInterface.gridLayer = gInterface.loadGrid(geojson, 1, resolve);//should be json
                });

                promiseGrid.then(function () {
                    var resultRect = gInterface.createRect(sub, gInterface.gridLayer);
                    Converter.setGridtoData(geojson, parsedData.times, config[0]);
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


        return AppConstructor;
    })
;

