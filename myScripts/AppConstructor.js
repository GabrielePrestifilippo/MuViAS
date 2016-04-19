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
        this.wwd.addLayer(new WorldWind.CompassLayer());
        this.wwd.addLayer(new WorldWind.CoordinatesDisplayLayer(wwd));
        this.wwd.addLayer(new WorldWind.ViewControlsLayer(wwd));
    };

    AppConstructor.prototype.setInterface = function(interface) {
        this.globeInterface = interface;
    };

    AppConstructor.prototype.create = function(options) {

        this.globeInterface.create(options, this);
        this.clean();
        var self = this;
        this.config = [];
        this.config[0] = options.config_0;
        this.config[1] = options.config_1;
        this.sub = options.sub;
        this.maxDownload = options.maxDownload;
        this.myData = [];
        this.myData[0] = new myData(this, 0);

        if (this.config[0].half) {
            this.allDone = 0;
            this.myData[1] = new myData(this, 1);
        }

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
                self.myData[1].getData(self.config[1].url, this.resolve, 1);
            });
        }

        $.when(promiseData, promiseGrid).done(function() {
            self.globeInterface.movingTemplate = self.globeInterface.createRect(self.sub, self); //grid dependable
            self.globeInterface.UI = new UI(self);
        });

    };

    AppConstructor.prototype.clean = function() {
        var x;
        if (this.layers) {
            for (x in this.layers) {
                this.wwd.removeLayer(this.layers[x]);
            }

        }
        if (this.bigCubes) {
            for (x in this.bigCubes) {
                this.wwd.removeLayer(this.bigCubes[x]);
            }
        }

    };

    return AppConstructor;
});