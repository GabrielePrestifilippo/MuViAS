var wwd;
var layers;

define([
    'src/WorldWind',
    'myScripts/myData.js'

], function (WorldWind,
             myData) {

    var AppConstructor = function (globe) {
        this.globe = globe;
    };
    AppConstructor.prototype.setInterface = function (gInterface) {
        this.globeInterface = gInterface;
    };
    AppConstructor.prototype.newData = function (config1) {
        this.globeInterface.clean();
        var self = this;
        this.config[1] = config1;
        this.myData[1] = new myData(this, 1);

        var promiseData1 = $.Deferred(function () {
            self.myData[1].getData(self.config[1].url, this.resolve, 1);
        });


    };
    AppConstructor.prototype.init = function (options) {
        var self = this;
        this.options = options;
        this.globeInterface.init(options, this);
        this.globeInterface.clean();
        this.config = [];
        this.config[0] = options.config_0;
        this.sub = options.sub;
        this.maxDownload = options.maxDownload;
        this.myData = [];
        this.myData[0] = new myData(this, 0);

        this.dataLoaded = 0;
        if (this.config[0].half) {
            this.myData[1] = new myData(this, 1);
        }

        var promiseGrid = $.Deferred(function () {
            self.globeInterface.loadGrid(this.resolve);
        });

        var promiseData = $.Deferred(function () {
            $.when(promiseGrid).done(function () {
                self.myData[0].getData(self.config[0].url, promiseData.resolve, 0);
            });
        });

        if (this.config[0].half) {
            $.Deferred(function () {
                self.myData[1].getData(self.config[1].url, this.resolve, 1);
            });
        }

        $.when(promiseData, promiseGrid).done(function () {
            self.globeInterface.movingTemplate = self.globeInterface.createRect(self.sub, self); //grid dependable
            self.globeInterface.UI.start();
        });

    };

    return AppConstructor;
});

