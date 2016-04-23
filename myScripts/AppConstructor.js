/*jshint -W083 */
/*global define:true, $:true, Papa:true, WorldWind:true, Promise:true*/

var wwd;
var layers;

define([
    'src/WorldWind',
    'myScripts/myData.js',
    'myScripts/UI.js',
    'myScripts/globeInterface.js',

], function(
    WorldWind,
    myData,
    UI,
    globeInterface) {

    var AppConstructor = function() {
        WorldWind.Logger.setLoggingLevel(WorldWind.Logger.LEVEL_ERROR);
        wwd = this.wwd = new WorldWind.WorldWindow("canvasOne"); //debugging
        this.wwd.addLayer(new WorldWind.BMNGOneImageLayer());
        this.wwd.addLayer(new WorldWind.BingAerialWithLabelsLayer());
        var compassLayer=new WorldWind.CompassLayer();
        compassLayer._compass.screenOffset.y=0.35;
        this.wwd.addLayer(compassLayer);
        this.wwd.addLayer(new WorldWind.CoordinatesDisplayLayer(wwd));
        this.wwd.addLayer(new WorldWind.ViewControlsLayer(wwd));
        this.wwd.navigator.range=20000000;
    };

    AppConstructor.prototype.setInterface = function(interface) {
        this.globeInterface = interface;
    };

    AppConstructor.prototype.newData = function(config1) {
        this.globeInterface.clean();
        var self = this;
        this.config[1] = config1;
        this.myData[1] = new myData(this, 1);

        var promiseData1 = $.Deferred(function() {
            self.myData[1].getData(self.config[1].url, this.resolve, 1);
        });


    };

    AppConstructor.prototype.create = function(options) {
        this.options = options;
        this.globeInterface.create(options, this);
        this.globeInterface.clean();
        var self = this;
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
        self.globeInterface.UI = new UI(self);

        var promiseGrid = $.Deferred(function() {
            self.globeInterface.loadGrid(this.resolve);
        });

        var dataUrl = this.dataUrl;

        var promiseData = $.Deferred(function() {
            $.when(promiseGrid).done(function() {
                self.myData[0].getData(self.config[0].url, promiseData.resolve, 0);
            });
        });

        if (this.config[0].half) {
            var promiseData1 = $.Deferred(function() {
                var result=self.myData[1].getData(self.config[1].url, this.resolve, 1);
            });
        }

        $.when(promiseData, promiseGrid).done(function() {
            self.globeInterface.movingTemplate = self.globeInterface.createRect(self.sub, self); //grid dependable
            self.globeInterface.UI.start();
        });

    };

    return AppConstructor;
});