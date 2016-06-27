var wwd;
var layers;

define(['myScripts/DataLoader',
        'myScripts/GlobeHelper',
        'myScripts/csvToGrid/Converter',
        'myScripts/LayerGroup'
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

            if (options.isCSV || options.isUrl) {
                this.initCSV(options, gInterface);
            } else {
                this.initGridData(options, gInterface);
            }
        };

        AppConstructor.prototype.addCsv = function (gInterface) {
            if (gInterface.options && gInterface.autoTile)
                this.initCSV(gInterface.options, gInterface, 1)
        };


        AppConstructor.prototype.prepareWCS = function (options, resolve) {
            var bounds = gInterface._navigator.getVisibleAreaBoundaries();
            var range1 = options.monthRange1;
            var range2 = options.monthRange2;
            var promiseData = new Promise(function (solveData) {

                var url = options.url;
                var coverage=options.coverage;
                var data = 'request=<?xml version="1.0" encoding="UTF-8" ?><ProcessCoveragesRequest xmlns="http://www.opengis.net/wcps/1.0" service="WCPS" version="1.0.0">  <query>    <abstractSyntax>' +
                    '      for c in ('+coverage+') return encode(c[Lat(' + bounds._bottom + ':' + bounds._top + '),' +
                    ' Long(' + bounds._left + ':' + bounds._right + '), ansi("2014-' + range1 + '":"2014-' + range2 + '")], "csv")' +
                    '    </abstractSyntax>  </query></ProcessCoveragesRequest>';


                $.ajax({
                    type: "POST",
                    url: url,
                    data: data,
                    contentType: "application/json; charset=utf-8",
                    success: function (res) {
                        solveData(res);
                    },
                });

            });
            promiseData.then(function (data) {

                var csv = [];
                var range=range2-range1+1;
                data = data.split("}},");
                var ind_lng = -0.1;
                for (var x = 0; x < data.length; x++) {
                    var str = data[x].replace(/\{|\}/g, '');
                    var str = str.split(",");
                    ind_lng += 0.1;
                    var ind_lat = -0.1;
                    for (var y = 0; y < str.length / range; y++) {
                        ind_lat += 0.1;

                        for (var z = 0; z < range; z++) {
                            var temp = Number(str[y + z]);
                            if (temp < 999) {
                                csv.push([temp, bounds._bottom + ind_lat, bounds._left + ind_lng, z + 1]);
                            }
                        }
                    }
                }

                resolve(csv);

            });
        };
        
        AppConstructor.prototype.initCSV = function (options, gInterface, addCsv) {
            GlobeHelper.clean(gInterface.smallVoxels.layers, gInterface.bigVoxels.layers, gInterface.gridLayer, gInterface.globe);
            var config = [];
            gInterface.options = options;
            config[0] = options.config_0;
            config[0].data = options.csv.data;
            config[0].time = options.csv.time;
            config[0].delimiter = options.csv.delimiter;
            var sub = options.sub;
            var maxDownload = options.maxDownload;
            var self = this;
            var promiseLoad = new Promise(function (resolve) {
                if (!addCsv && !options.isUrl) {
                    Converter.loadData(options.csv.csvUrl, resolve, config[0].delimiter);
                } else if (addCsv && !options.isUrl) {
                    resolve(gInterface.allData);
                } else if (options.isUrl) {
                    self.prepareWCS(options.config_0, resolve);
                }
            });

            promiseLoad.then(function (data) {
                gInterface.allData = data;
                if (addCsv) {
                    gInterface.started = 1;
                    addCsv = gInterface._navigator.getVisibleAreaBoundaries();
                }
                if (options.isUrl) {

                    config[0].data = [0];
                    config[0].time = 3;
                    config[0].lat = 1;
                    config[0].lng = 2;
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

