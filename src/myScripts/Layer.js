define([

    '../worldwind/WorldWind'

], function (WorldWind) {

    var RenderableLayer = WorldWind.RenderableLayer;

    /**
     * Overwrite a layer class from Web WorldWind core library
     * @param name
     * @constructor
     */
    var Layer = function (name) {
        WorldWind.RenderableLayer.call(this, name);
    };

    /**
     * Create the layer object
     * @type {RenderableLayer}
     */
    Layer.prototype = Object.create(RenderableLayer.prototype);

    return Layer;
});