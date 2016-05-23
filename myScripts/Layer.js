define([

    'src/WorldWind'

], function (WorldWind) {

    var RenderableLayer = WorldWind.RenderableLayer;
    
    var Layer = function (name) {
        WorldWind.RenderableLayer.call(this, name);
    };

    Layer.prototype = Object.create(RenderableLayer.prototype);

    return Layer;
});