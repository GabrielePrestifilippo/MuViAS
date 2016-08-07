define(['src/WorldWind'], function (WorldWind) {
    "use strict";
    var wwd = window.WorldWind;

    /**
     * Extends a Web WorldWind globe, with some predefined layers
     * @param options, set the name of the globe through the id
     * @constructor
     */
    var Globe = function (options) {
        wwd.WorldWindow.call(this, options.id);
        this.addLayer(new wwd.BMNGOneImageLayer());
        this.addLayer(new wwd.BingAerialWithLabelsLayer());
        //var compassLayer = new wwd.CompassLayer();
       // this.addLayer(compassLayer);
        this.addLayer(new wwd.CoordinatesDisplayLayer(this));
        var nightImageSource = 'images/dnb_land.png';
        this.addLayer(new wwd.AtmosphereLayer(nightImageSource));
        this.addLayer(new wwd.ViewControlsLayer(this));
        this.layers[0].detailControl=0.9;
        this.layers[1].detailControl=0.9;
    };


    /**
     * Create the globe
     * @type {WorldWind.WorldWindow}
     */
    Globe.prototype = Object.create(WorldWind.WorldWindow.prototype);


    return Globe;
});