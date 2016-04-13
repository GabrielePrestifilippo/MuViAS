var layers = [];

function newLayer(number) {

    layers[number] = new WorldWind.RenderableLayer();
    layers[number].enabled=false;
    var meshes = [];
    wwd.addLayer(layers[number]);

    for (n in gridLayer.renderables) {
        var x = [],
            y = [];
        
        x[0] = gridLayer.renderables[n]._boundaries[0].latitude;
        y[0] = gridLayer.renderables[n]._boundaries[0].longitude;
        x[1] = gridLayer.renderables[n]._boundaries[1].latitude;
        y[1] = gridLayer.renderables[n]._boundaries[1].longitude;
        x[2] = gridLayer.renderables[n]._boundaries[2].latitude;
        y[2] = gridLayer.renderables[n]._boundaries[2].longitude;
        x[3] = gridLayer.renderables[n]._boundaries[3].latitude;
        y[3] = gridLayer.renderables[n]._boundaries[3].longitude;

        var meshPositions = [];

        var row = [];

        row.push(new WorldWind.Position(x[0], y[0], 500 + (number * 2500)));
        row.push(new WorldWind.Position(x[1], y[1], 500 + (number * 2500)));




        meshPositions.push(row);

        var row = [];

        row.push(new WorldWind.Position(x[0], y[0], 500 + (number + 1) * 2500));
        row.push(new WorldWind.Position(x[1], y[1], 500 + (number + 1) * 2500));



        meshPositions.push(row);

        var row = [];

        row.push(new WorldWind.Position(x[3], y[3], 500 + (number + 1) * 2500));
        row.push(new WorldWind.Position(x[2], y[2], 500 + (number + 1) * 2500));



        meshPositions.push(row);

        var row = [];

        row.push(new WorldWind.Position(x[3], y[3], 500 + (number * 2500)));
        row.push(new WorldWind.Position(x[2], y[2], 500 + (number * 2500)));



        meshPositions.push(row);

        var row = [];

        row.push(new WorldWind.Position(x[0], y[0], 500 + (number * 2500)));
        row.push(new WorldWind.Position(x[1], y[1], 500 + (number * 2500)));



        meshPositions.push(row);


        var row = [];

        row.push(new WorldWind.Position(x[1], y[1], 500 + (number * 2500)));
        row.push(new WorldWind.Position(x[2], y[2], 500 + (number * 2500)));



        meshPositions.push(row);

        var row = [];

        row.push(new WorldWind.Position(x[1], y[1], 500 + (number + 1) * 2500));
        row.push(new WorldWind.Position(x[2], y[2], 500 + (number + 1) * 2500));



        meshPositions.push(row);




        var row = [];

        row.push(new WorldWind.Position(x[3], y[3], 500 + (number * 2500)));
        row.push(new WorldWind.Position(x[0], y[0], 500 + (number * 2500)));



        meshPositions.push(row);

        var row = [];
        row.push(new WorldWind.Position(x[3], y[3], 500 + (number + 1) * 2500));
        row.push(new WorldWind.Position(x[0], y[0], 500 + (number + 1) * 2500));



        meshPositions.push(row);
        var mesh = new WorldWind.GeographicMesh(meshPositions, null);
        meshes.push(mesh);

        var meshAttributes = new WorldWind.ShapeAttributes(null);



        meshAttributes._interiorColor = WorldWind.Color.YELLOW;
        meshAttributes.drawOutline = false;
        meshAttributes.applyLighting = true;
        mesh.attributes = meshAttributes;


        var highlightAttributes = new WorldWind.ShapeAttributes(meshAttributes);

        mesh.highlightAttributes = highlightAttributes;
    
        
        layers[number].addRenderable(mesh);

    }
}