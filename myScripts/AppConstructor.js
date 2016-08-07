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

        /**
         * Initialize the application, specifying if it is a CSV data containing point features of a grid blocks
         * @param options: options from the user interface to handle all the data
         * @param gInterface: globe interface to insert the data
         */
        AppConstructor.prototype.init = function (options, gInterface) {
            gInterface.init(options, this);
            GlobeHelper.clean(gInterface.smallVoxels, gInterface.bigVoxels, gInterface.gridlayer, gInterface.globe);

            if (options.isCSV || options.isUrl) {
                this.initCSV(options, gInterface);
            } else {
                this.initGridData(options, gInterface);
            }
        };

        /**
         * Initialize a new CSV data, could be a new dataset, or a new part of a dataset, both from a CSV or a WCPS
         * @param options: options to specify the kind of data
         * @param gInterface: globe interface to insert the data
         * @param addCsv: parameter to set if we are adding new data or is the first time
         */
        AppConstructor.prototype.initCSV = function (options, gInterface, addCsv, maxTile) {
            GlobeHelper.clean(gInterface.smallVoxels.layers, gInterface.bigVoxels.layers, gInterface.gridLayer, gInterface.globe);
            var config = [];
            gInterface.options = options;
            config[0] = options.config_0;
            config[0].data = options.csv.data;
            config[0].time = options.csv.time;
            config[0].delimiter = options.csv.delimiter;
            var sub = options.sub;
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


                if (!addCsv) {
                    addCsv = gInterface._navigator.getVisibleAreaBoundaries();
                } else {
                    addCsv = gInterface._navigator.getVisibleAreaBoundaries();

                    while (addCsv._top - addCsv._bottom > 40) {
                        addCsv._top -= 1;
                        addCsv._bottom += 1;
                    }
                    while (addCsv._right - addCsv._left > 40) {
                        addCsv._right -= 1;
                        addCsv._left += 1;
                    }

                    while ((addCsv._right - addCsv._left) / (addCsv._top - addCsv._bottom) > 1.3) {
                        addCsv._right -= 0.2;
                        addCsv._left += 0.2;
                        addCsv._top += 0.1;
                        addCsv._bottom -= 0.1;
                    }

                    while ((addCsv._top - addCsv._bottom) / (addCsv._right - addCsv._left) > 1.3) {
                        addCsv._top -= 0.2;
                        addCsv._bottom += 0.2;
                        addCsv._right += 0.1;
                        addCsv._left -= 0.1;
                    }
                }
                if (options.isUrl) {

                    config[0].data = [0];
                    config[0].time = 3;
                    config[0].lat = 1;
                    config[0].lng = 2;
                }
                try {

                    data = Converter.filterData(data, config[0], addCsv, maxTile);
                    if (data.length > 0) {

                        var parsedData = Converter.initData(data, config[0], 0);
                        data.bounds = Converter.getDataBounds(data, config[0], 0);
                        if (config[0].heightExtrusion) {
                            data.bounds1 = Converter.getDataBounds(data, config[0], 1);
                        }
                        var geojson = JSON.stringify(Converter.initJson(parsedData, options.csv.zone, options.csv.quadSub, options.csv.source));
                        var promiseGrid = new Promise(function (resolve) {
                            gInterface.gridLayer = gInterface.loadGrid(geojson, 1, resolve);//should be json
                        });
                    }

                    promiseGrid.then(function () {
                        var resultRect = gInterface.createRect(sub, gInterface.gridLayer);
                        var w;
                        if (typeof(Worker) !== "undefined") {

                            var promiseWorker = new Promise(function (resolve) {
                                w = new Worker("myScripts/workers/setGridtoData.js");

                                w.postMessage([geojson, parsedData.times, config[0]]);
                                w.onmessage = function (event) {
                                    resolve(event.data);
                                };

                            });

                        } else {
                            parsedData.times = Converter.setGridtoData(geojson, parsedData.times, config[0]);
                        }

                        promiseWorker.then(function (timesWorker) {
                            parsedData.times = JSON.parse(timesWorker);
                            gInterface.myData[0] = data;
                            gInterface.doxelFromData(parsedData.allTime, parsedData.times, config);
                            gInterface.allTime = parsedData.allTime;
                            gInterface.times = parsedData.times;
                            gInterface.rectInit(resultRect);
                        });

                    });
                } catch (e) {
                    console.log(e + "Error in parsing file");

                }


            });

        };

        /**
         * Initialize the data from the grid-block CSV
         * @param options: to specify the structure of data
         * @param gInterface: globe interface to insert the data
         */
        AppConstructor.prototype.initGridData = function (options, gInterface) {

            var config = [];
            config[0] = options.config_0;
            var sub = options.sub;
            var myData = [];

            var dataLoader = new DataLoader(this, 0);
            gInterface.dataLoaded = 0;


            var promiseGrid = new Promise(function (resolve) {
                var text = options.gridUrl;

                if (options.isLocal) {

                    var reader = new FileReader();

                    reader.onload = function () {
                        text = reader.result;
                    }

                    reader.readAsText(options.gridUrl);

                    reader.onloadend = function () {
                        gInterface.gridLayer = gInterface.loadGrid(text, 1, resolve);
                    }
                }else{
                    gInterface.gridLayer = gInterface.loadGrid(text, 0, resolve);
                }


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

        /**
         * Insert new data on the existing globe interface, cleans first all the data and parameter to start a new insertion
         * @param config1: configuration file of the new data to insert
         * @param gInterface: globe interface to insert the data
         */
        AppConstructor.prototype.newData = function (config1, gInterface) {
            var layLength = gInterface.globe.layers.length;
            for (var x = 4; x <= layLength; x++) {
                gInterface.globe.removeLayer(gInterface.globe.layers[x]);
            }

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

        /**
         * Add a ne part of a CSV file. Used when the automatic tile download is selected
         * @param gInterface: globe interface to insert the data
         */
        AppConstructor.prototype.addCsv = function (gInterface) {
            if (gInterface.options && gInterface.autoTile) {
                var maxTile = GlobeHelper.getMaxTile();
                this.initCSV(gInterface.options, gInterface, 1, maxTile)
            }
        };

        /**
         * Prepare the Web Coverage Processing request with all the parameters
         * @param options: parameter to query the server
         * @param resolve: resolve function to execute after the query has successfully performed
         */
        AppConstructor.prototype.prepareWCS = function (options, resolve) {
            var bounds = gInterface._navigator.getVisibleAreaBoundaries();
            while (bounds._top - bounds._bottom > 40) {
                bounds._top -= 1;
                bounds._bottom += 1;
            }
            while (bounds._right - bounds._left > 40) {
                bounds._right -= 1;
                bounds._left += 1;
            }
            var range1 = options.monthRange1;
            var range2 = options.monthRange2;
            var promiseData = new Promise(function (solveData) {

                var url = options.url;
                var coverage = options.coverage;
                var data = 'request=<?xml version="1.0" encoding="UTF-8" ?><ProcessCoveragesRequest xmlns="http://www.opengis.net/wcps/1.0" service="WCPS" version="1.0.0">  <query>    <abstractSyntax>' +
                    '      for c in (' + coverage + ') return encode(c[Lat(' + bounds._bottom + ':' + bounds._top + '),' +
                    ' Long(' + bounds._left + ':' + bounds._right + '), ansi("2014-' + range1 + '":"2014-' + range2 + '")], "csv")' +
                    '    </abstractSyntax>  </query></ProcessCoveragesRequest>';

                $.ajax({
                    type: "POST",
                    url: url,
                    data: data,
                    contentType: "application/json; charset=utf-8",
                    success: function (res) {
                        solveData(res);
                    }
                });

            });
            promiseData.then(function (data) {

                var csv = [];
                var range = range2 - range1 + 1;
                data = data.split("}},");
                var ind_lng = -0.1;
                for (var x = 0; x < data.length; x++) {
                    var str = data[x].replace(/\{|\}/g, '');
                    str = str.split(",");
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

        return AppConstructor;
    })
;

