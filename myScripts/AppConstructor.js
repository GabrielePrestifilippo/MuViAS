var wwd;
var layers;

define(['myScripts/DataLoader.js',
        'myScripts/GlobeHelper.js',
    ]
    , function (DataLoader, GlobeHelper) {

        var AppConstructor = function () {
        };
        AppConstructor.prototype.newData = function (config1, gInterface) {
            GlobeHelper.clean(gInterface.layers, gInterface.bigCubes, gInterface.globe);
            gInterface.config[1] = config1;
            var dataLoader = new DataLoader(this, 1);
            
            var promiseData = $.Deferred(function () {
                dataLoader.getData(config1.url, this.resolve, config1);
            });

            $.when(promiseData).done(function (data) {
                gInterface.myData[1] = data;
                gInterface.cubeFromData(data, 1);

            });
            
        };
        AppConstructor.prototype.init = function (options, gInterface) {
            var self = this;

            gInterface.init(options, this);
            GlobeHelper.clean(gInterface.layers, gInterface.bigCubes, gInterface.globe);
            var config = [];
            config[0] = options.config_0;
            var sub = options.sub;
            var maxDownload = options.maxDownload;
            var myData = [];

            var dataLoader = new DataLoader(this, 0);
            gInterface.dataLoaded = 0;


            var promiseGrid = $.Deferred(function () {
                gInterface.loadGrid(this.resolve);
            });

            var promiseData = $.Deferred(function () {
                var self = this;
                $.when(promiseGrid).done(function () {
                    dataLoader.getData(config[0].url, self.resolve, config[0]);
                });
            });

            $.when(promiseData).done(function (data) {
                gInterface.myData[0] = data;
                gInterface.cubeFromData(data, 0);

            });

            if (config[0].half) {
                $.Deferred(function () {
                    myData[1].getData(config[1].url, this.resolve, config[0]);
                });
            }

            $.when(promiseData, promiseGrid).done(function () {
                gInterface.movingTemplate = gInterface.createRect(sub, self); //grid dependable
                gInterface.UI.start();
            });

        };
        return AppConstructor;
    });

