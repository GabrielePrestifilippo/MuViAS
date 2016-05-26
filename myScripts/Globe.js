

define(['src/WorldWind'], function (WorldWind) {
    "use strict";
    var wwd = window.WorldWind;


    var Globe = function(options) {
        wwd.WorldWindow.call(this, options.id);
        this.addLayer(new wwd.BMNGOneImageLayer());
        this.addLayer(new wwd.BingAerialWithLabelsLayer());
        var compassLayer = new wwd.CompassLayer();
        //compassLayer._compass.screenOffset.y = 0.35;
        this.addLayer(compassLayer);
        this.addLayer(new wwd.CoordinatesDisplayLayer(this));
        this.addLayer(new wwd.AtmosphereLayer(this));
        this.addLayer(new wwd.ViewControlsLayer(this));
        this.navigator.range = 15000000;
        this.navigator.lookAtLocation.latitude=19;
        this.navigator.lookAtLocation.longitude=15;

    };

    Globe.prototype = Object.create(WorldWind.WorldWindow.prototype);


    return Globe;
});