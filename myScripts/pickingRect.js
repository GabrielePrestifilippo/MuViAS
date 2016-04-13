





function show(n){
for (var x in gridLayer.renderables) {
    if (rect[n].containsPoint(gridLayer.renderables[x].point)) {
         for (var z in layers){
        layers[z].renderables[x].enabled = true;
        }
        
    }
wwd.redraw();
}
}

function hide(n){
for (var x in gridLayer.renderables) {
    if (rect[n].containsPoint(gridLayer.renderables[x].point)) {
        
         for (var z in layers){
        layers[z].renderables[x].enabled = false;
        }
       
    }
}
}

function createBigCube(x,y,layer,value,z, heightLayer){
    var meshPositions = [],
    meshIndices = [];





var altitude=z[0];
var altitude1=z[1];
    
meshPositions.push(new WorldWind.Position(x[3], y[3], altitude));
meshPositions.push(new WorldWind.Position(x[0], y[0], altitude));
meshPositions.push(new WorldWind.Position(x[2], y[2], altitude));





meshIndices.push(0);
meshIndices.push(1);
meshIndices.push(2);

meshPositions.push(new WorldWind.Position(x[1], y[1], altitude));
meshPositions.push(new WorldWind.Position(x[2], y[2], altitude));

meshPositions.push(new WorldWind.Position(x[0], y[0], altitude));

meshIndices.push(3);
meshIndices.push(4);
meshIndices.push(5);


//SECONDO

meshPositions.push(new WorldWind.Position(x[0], y[0], altitude));
meshPositions.push(new WorldWind.Position(x[0], y[0], altitude1));
meshPositions.push(new WorldWind.Position(x[3], y[3], altitude));

meshIndices.push(6);
meshIndices.push(7);
meshIndices.push(8);





meshPositions.push(new WorldWind.Position(x[3], y[3], altitude1));

meshPositions.push(new WorldWind.Position(x[3], y[3], altitude));
meshPositions.push(new WorldWind.Position(x[0], y[0], altitude1));

meshIndices.push(9);
meshIndices.push(10);
meshIndices.push(11);

//terzo

meshPositions.push(new WorldWind.Position(x[0], y[0], altitude1));
meshPositions.push(new WorldWind.Position(x[1], y[1], altitude1));
meshPositions.push(new WorldWind.Position(x[3], y[3], altitude1));


meshIndices.push(12);
meshIndices.push(13);
meshIndices.push(14);

meshPositions.push(new WorldWind.Position(x[1], y[1], altitude1));
meshPositions.push(new WorldWind.Position(x[2], y[2], altitude1));
meshPositions.push(new WorldWind.Position(x[3], y[3], altitude1));



meshIndices.push(15);
meshIndices.push(16);
meshIndices.push(17);

//quarto

meshPositions.push(new WorldWind.Position(x[2], y[2], altitude1));
meshPositions.push(new WorldWind.Position(x[2], y[2], altitude));

meshPositions.push(new WorldWind.Position(x[1], y[1], altitude1));

meshIndices.push(18);
meshIndices.push(19);
meshIndices.push(20);

meshPositions.push(new WorldWind.Position(x[1], y[1], altitude1));
meshPositions.push(new WorldWind.Position(x[2], y[2], altitude));
meshPositions.push(new WorldWind.Position(x[1], y[1], altitude));

meshIndices.push(21);
meshIndices.push(22);
meshIndices.push(23);


//quinto


meshPositions.push(new WorldWind.Position(x[1], y[1], altitude1));
meshPositions.push(new WorldWind.Position(x[1], y[1], altitude));
meshPositions.push(new WorldWind.Position(x[0], y[0], altitude1));
meshIndices.push(24);
meshIndices.push(25);
meshIndices.push(26);

meshPositions.push(new WorldWind.Position(x[0], y[0], altitude));
meshPositions.push(new WorldWind.Position(x[0], y[0], altitude1));

meshPositions.push(new WorldWind.Position(x[1], y[1], altitude));
meshIndices.push(27);
meshIndices.push(28);
meshIndices.push(29);


//sesto


meshPositions.push(new WorldWind.Position(x[2], y[2], altitude1));
meshPositions.push(new WorldWind.Position(x[2], y[2], altitude));
meshPositions.push(new WorldWind.Position(x[3], y[3], altitude1));

meshIndices.push(30);
meshIndices.push(31);
meshIndices.push(32);


meshPositions.push(new WorldWind.Position(x[3], y[3], altitude));
meshPositions.push(new WorldWind.Position(x[3], y[3], altitude1));
meshPositions.push(new WorldWind.Position(x[2], y[2], altitude));

meshIndices.push(33);
meshIndices.push(34);
meshIndices.push(35);

      


    var meshAttributes = new WorldWind.ShapeAttributes(null);
    // Create the mesh.
     var mesh = new WorldWind.TriangleMesh(meshPositions, meshIndices, meshAttributes);
   
   
    var outlineIndices=[0,1,3,4,0, 1,  6,7,9,10,6, 7, 12,13,16,17,12, 13, 16, 18,19,3,13];
     mesh.outlineIndices = outlineIndices;
    
    var col = colore(((value - min) / (max - min)) * 100);
    meshAttributes._interiorColor= col;
    meshAttributes._outlineColor= new WorldWind.Color.colorFromBytes(0, 0, 0, 50);
    meshAttributes.drawOutline = true;
    meshAttributes.applyLighting = true;
    meshAttributes.enableLighting=true;
  

    
    var highlightAttributes = new WorldWind.ShapeAttributes(meshAttributes);
    mesh.highlightAttributes = highlightAttributes;
    
    mesh.active=true;
    mesh.height=heightLayer;
    mesh.point=new Point(x[0],y[0]);
    layer.addRenderable(mesh);
}
