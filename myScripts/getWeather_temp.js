tempPick

/*jshint -W117 */

var dimX;
var dimY;
var bigCubes;
var minLat = Infinity,
    minLng = Infinity,
    maxLat = -Infinity,
    maxLng = -Infinity;
var rect = [];

function pickRect() {

    for (var x in layers) {
        for (var y in layers[x].renderables) {
            layers[x].renderables[y].enabled = false;
        }

    }
    var extent = {};
    extent[0] = {};
    extent[0].lng = Infinity;
    extent[1] = {};
    extent[1].lng = -Infinity;
    extent[2] = {};
    extent[2].lat = Infinity;
    extent[3] = {};
    extent[3].lat = -Infinity;



    for (x in gridLayer.renderables) {
        if (minLng > gridLayer.renderables[x]._boundaries[1].longitude) {
            minLng = gridLayer.renderables[x]._boundaries[1].longitude;

        }
    }

    for (x in gridLayer.renderables) {
        if (minLat > gridLayer.renderables[x]._boundaries[0].latitude) {
            minLat = gridLayer.renderables[x]._boundaries[0].latitude;

        }
    }


    for (x in gridLayer.renderables) {
        if (maxLng < gridLayer.renderables[x]._boundaries[2].longitude) {
            maxLng = gridLayer.renderables[x]._boundaries[2].longitude;
        }
    }

    for (x in gridLayer.renderables) {
        if (maxLat < gridLayer.renderables[x]._boundaries[1].latitude) {
            maxLat = gridLayer.renderables[x]._boundaries[1].latitude;
        }
    }


    var division = 3;

    dimY = (maxLat - minLat) / division;
    dimX = (maxLng - minLng) / division;

    var subBlocks = division * division;


    var block = 0;
    var blockLat = minLat;
    var blockLng = minLng;

    for (x = 0; x < division; x++) {

        for (var z = 0; z < division; z++) {


            rect[block] = new WorldWind.Rectangle(
                blockLat,
                blockLng,
                dimY, dimX);
            rect[block].cubes = [];
            block++;
            blockLat = blockLat + dimY;

        }
        blockLng = blockLng + dimX;
        blockLat = minLat;

    }


    for (x in gridLayer.renderables) {
        gridLayer.renderables[x].point = new Point(gridLayer.renderables[x]._boundaries[0].latitude, gridLayer.renderables[x]._boundaries[0].longitude);
    }



    /*
    for (z in layers){
         layers[z].renderables[x].enabled = false;
        }
*/
}

function assignCubes() {
    for (var x in gridLayer.renderables) {

        for (n = 0; n < rect.length; n++) {
            for (var z in layers) {

                if (layers[z].renderables[x]) {

                    if (rect[n].containsPoint(layers[z].renderables[x].Point)) {

                        rect[n].cubes.push(layers[z].renderables[x]);
                    }

                }
            }
        }
    }
}



function show(n) {
    for (var x in gridLayer.renderables) {
        if (rect[n].containsPoint(gridLayer.renderables[x].point)) {
            for (var z in layers) {
                layers[z].renderables[x].enabled = true;
            }

        }
        wwd.redraw();
    }
}

function hide(n) {
    for (var x in gridLayer.renderables) {
        if (rect[n].containsPoint(gridLayer.renderables[x].point)) {

            for (var z in layers) {
                layers[z].renderables[x].enabled = false;
            }

        }
    }
}

function createBigCube(x, y, layer, value, z, heightLayer) {
    var meshes = [];
    var meshPositions = [];

    var row = [];

    row.push(new WorldWind.Position(x[0], y[0], z[0]));
    row.push(new WorldWind.Position(x[1], y[1], z[0]));




    meshPositions.push(row);

    row = [];

    row.push(new WorldWind.Position(x[0], y[0], z[1]));
    row.push(new WorldWind.Position(x[1], y[1], z[1]));



    meshPositions.push(row);

    row = [];

    row.push(new WorldWind.Position(x[3], y[3], z[1]));
    row.push(new WorldWind.Position(x[2], y[2], z[1]));



    meshPositions.push(row);

    row = [];

    row.push(new WorldWind.Position(x[3], y[3], z[0]));
    row.push(new WorldWind.Position(x[2], y[2], z[0]));



    meshPositions.push(row);

    row = [];

    row.push(new WorldWind.Position(x[0], y[0], z[0]));
    row.push(new WorldWind.Position(x[1], y[1], z[0]));



    meshPositions.push(row);


    row = [];

    row.push(new WorldWind.Position(x[1], y[1], z[0]));
    row.push(new WorldWind.Position(x[2], y[2], z[0]));



    meshPositions.push(row);

    row = [];

    row.push(new WorldWind.Position(x[1], y[1], z[1]));
    row.push(new WorldWind.Position(x[2], y[2], z[1]));



    meshPositions.push(row);




    row = [];

    row.push(new WorldWind.Position(x[3], y[3], z[0]));
    row.push(new WorldWind.Position(x[0], y[0], z[0]));



    meshPositions.push(row);

    row = [];
    row.push(new WorldWind.Position(x[3], y[3], z[1]));
    row.push(new WorldWind.Position(x[0], y[0], z[1]));



    meshPositions.push(row);
    var mesh = new WorldWind.GeographicMesh(meshPositions, null);
    meshes.push(mesh);

    var meshAttributes = new WorldWind.ShapeAttributes(null);


    var col = colore(((value - min) / (max - min)) * 100);
    meshAttributes._interiorColor = col;

    meshAttributes.drawOutline = false;
    meshAttributes.applyLighting = true;
    mesh.attributes = meshAttributes;


    var highlightAttributes = new WorldWind.ShapeAttributes(meshAttributes);

    mesh.highlightAttributes = highlightAttributes;
    mesh.active = true;
    mesh.heightLayer = heightLayer;
    mesh.point = new Point(x[0], y[0]);
    layer.addRenderable(mesh);
}

function makeBigCubes() {
    bigCubes = new WorldWind.RenderableLayer();
    var meshes = [];
    wwd.addLayer(bigCubes);

    var heightDim = 2;
    var startH = 500;
    var endH = 500 + (layers.length * 2500);
    for (var h = 0; h < heightDim; h++) {
        var z = [startH, endH / heightDim];

        for (var box in rect) {
            var x = [],
                y = [];
            x[0] = rect[box].x;
            x[1] = rect[box].x + dimY;
            x[2] = rect[box].x + dimY;
            x[3] = rect[box].x;

            y[0] = rect[box].y;
            y[1] = rect[box].y;
            y[2] = rect[box].y + dimX;
            y[3] = rect[box].y + dimX;

            var value;
            var sum = 0;
            var iter;

            for (var n = 0; n < rect[box].cubes.length; n++) {
                sum += Number(rect[box].cubes[n].data);
            }

            value = sum / rect[box].cubes.length;




            var height = [];
            for (var t = h; t < heightDim * (h + 1) - h; t++) {
                height.push(t + h)
            }
            createBigCube(x, y, bigCubes, value, z, height);

        }
        startH = endH / heightDim;
        endH = endH * (h + 2);
    }



    var handlePick = function(o) {

        // the mouse or tap location.
        var x = o.clientX,
            y = o.clientY;
        var pickList = wwd.pick(wwd.canvasCoordinates(x, y)); //pick point

        if (pickList.objects.length > 0) { //if at least 1 object picked
            for (var p = 0; p < pickList.objects.length; p++) { //for each picked point
                if (pickList.objects[p].isOnTop) {


                    for (x in rect) { //for each rectangle

                        if (rect[x].cubes.indexOf(pickList.objects[p].userObject) != -1) { //if the rectangle contains the point
                            for (var d in bigCubes.renderables) {
                                if (bigCubes.renderables[d].heightLayer.indexOf(pickList.objects[p].userObject.layer.heightLayer) != -1) {
                                    bigCubes.renderables[d].enabled = true;
                                    bigCubes.renderables[d].active = true;
                                    var z;

                                    for (z in rect[x].cubes) {
                                        if (rect[x].cubes[z]) {
                                            rect[x].cubes[z].enabled = false;
                                        }
                                    }
                                    wwd.redraw();
                                    //break;
                                }
                            }
                        }
                    }

                    for (x in bigCubes.renderables) {
                        if (bigCubes.renderables[x] == pickList.objects[p].userObject) {
                            bigCubes.renderables[x].enabled = false;
                            bigCubes.renderables[x].active = false;


                           var x1;
                            x1=x;
                            var dim=3 * 3 -1;
                            if(x>dim){
                            x1-=dim;
                            }
                            
                            for (var l in rect[x1].cubes) {


                                if (bigCubes.renderables[x].heightLayer.indexOf(rect[x1].cubes[l].heightLayer) != -1) {

                                    if (rect[x1].cubes[l]) {
                                        rect[x1].cubes[l].enabled = true;
                                    }
                                }
                            }
                            wwd.redraw();
                            break;
                        }
                    }

                }
            }
        }


    };
    wwd.addEventListener("dblclick", handlePick);
    var tapRecognizer = new WorldWind.TapRecognizer(wwd, handlePick);

}