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
        //  this.addLayer(new wwd.BMNGOneImageLayer());
        this.addLayer(new wwd.BingAerialWithLabelsLayer());
        WorldWind.configuration.baseUrl = WorldWind.configuration.baseUrl.split("../")[0];
        var nightImageSource = 'images/dnb_land.png';
        var starFieldLayer = new WorldWind.StarFieldLayer('images/stars.json');
        this.atmosphereLayer = new WorldWind.AtmosphereLayer(nightImageSource);

        this.addLayer(starFieldLayer);
        this.addLayer(this.atmosphereLayer);

        starFieldLayer.time = new Date();
        this.atmosphereLayer.lightLocation = WorldWind.SunPosition.getAsGeographicLocation(starFieldLayer.time);


        this.addLayer(new wwd.CoordinatesDisplayLayer(this));

        // this.addLayer(new wwd.AtmosphereLayer(nightImageSource));
        this.layers[0].detailControl = 1;
        this.layers[1].detailControl = 1;

    };


    /**
     * Create the globe
     * @type {WorldWind.WorldWindow}
     */
    Globe.prototype = Object.create(WorldWind.WorldWindow.prototype);


    return Globe;
});