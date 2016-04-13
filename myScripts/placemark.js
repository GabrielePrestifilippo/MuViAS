function surfaceImage(number, renderable, value) {


    var ref = 0;
    for (var n in layers) {
        ref++;
    }

    if (!indexes[number]) {
        indexes[number] = ref + 1;
        layers[ref] = new WorldWind.RenderableLayer();
        layers[ref].enabled = true;
        layers[ref].heightLayer = ref;
        wwd.addLayer(layers[ref]);
    } else {
        ref--;
    }


    var x = [],
        y = [];


    x[0] = renderable._boundaries[0].latitude;
    y[0] = renderable._boundaries[0].longitude;
    x[1] = renderable._boundaries[1].latitude;
    y[1] = renderable._boundaries[1].longitude;
    x[2] = renderable._boundaries[2].latitude;
    y[2] = renderable._boundaries[2].longitude;
    x[3] = renderable._boundaries[3].latitude;
    y[3] = renderable._boundaries[3].longitude;

    var shapeAttributes = new WorldWind.ShapeAttributes(null),
        highlightShapeAttributes;

    var col = colore(((value - min) / (max - min)) * 100);

    shapeAttributes.interiorColor = col;
    shapeAttributes.drawOutline = false;
    shapeAttributes.enableLighting = false;


    var shapeBoundaries = [
        new WorldWind.Location(x[0], y[0]),
        new WorldWind.Location(x[1], y[1]),
        new WorldWind.Location(x[2], y[2]),
        new WorldWind.Location(x[3], y[3]),
    ];

    var surfacePolygon = new WorldWind.SurfacePolygon(shapeBoundaries,
        new WorldWind.ShapeAttributes(shapeAttributes));


    surfacePolygon.heightLayer=ref;

    surfacePolygon.id=renderable.attributes.id;

    
    
    surfacePolygon.Point={0:x[0], 1:y[0]};

    surfacePolygon.data = value;
    layers[ref].addRenderable(surfacePolygon);

}