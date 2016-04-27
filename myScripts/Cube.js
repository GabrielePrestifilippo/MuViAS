define([
    'src/WorldWind'

], function (WorldWind) {
    var Cube = function (coordinates, color) {


        var meshPositions = [],
            meshIndices = [];

        var x = [],
            y = [],
            z = [];

        x[0] = coordinates[0].lat;
        y[0] = coordinates[0].lng;
        x[1] = coordinates[3].lat;
        y[1] = coordinates[3].lng;
        x[2] = coordinates[1].lat;
        y[2] = coordinates[1].lng;
        x[3] = coordinates[2].lat;
        y[3] = coordinates[2].lng;

        z[0] = coordinates.altitude;
        z[1] = z[0] + coordinates.height;
        var texCoords = [];

        meshPositions.push(new WorldWind.Position(x[0], y[0], z[0]));
        meshPositions.push(new WorldWind.Position(x[1], y[1], z[0]));
        meshPositions.push(new WorldWind.Position(x[2], y[2], z[0]));


        meshIndices.push(0);
        meshIndices.push(1);
        meshIndices.push(2);


        meshPositions.push(new WorldWind.Position(x[3], y[3], z[0]));
        meshPositions.push(new WorldWind.Position(x[2], y[2], z[0]));
        meshPositions.push(new WorldWind.Position(x[1], y[1], z[0]));

        meshIndices.push(3);
        meshIndices.push(4);
        meshIndices.push(5);


        meshPositions.push(new WorldWind.Position(x[1], y[1], z[0]));
        meshPositions.push(new WorldWind.Position(x[1], y[1], z[1]));
        meshPositions.push(new WorldWind.Position(x[0], y[0], z[0]));

        meshIndices.push(6);
        meshIndices.push(7);
        meshIndices.push(8);


        meshPositions.push(new WorldWind.Position(x[0], y[0], z[1]));
        meshPositions.push(new WorldWind.Position(x[0], y[0], z[0]));
        meshPositions.push(new WorldWind.Position(x[1], y[1], z[1]));

        meshIndices.push(9);
        meshIndices.push(10);
        meshIndices.push(11);


        meshPositions.push(new WorldWind.Position(x[1], y[1], z[1]));
        meshPositions.push(new WorldWind.Position(x[2], y[2], z[1]));
        meshPositions.push(new WorldWind.Position(x[0], y[0], z[1]));

        meshIndices.push(12);
        meshIndices.push(13);
        meshIndices.push(14);

        meshPositions.push(new WorldWind.Position(x[1], y[1], z[1]));
        meshPositions.push(new WorldWind.Position(x[3], y[3], z[1]));
        meshPositions.push(new WorldWind.Position(x[2], y[2], z[1]));

        meshIndices.push(15);
        meshIndices.push(16);
        meshIndices.push(17);


        meshPositions.push(new WorldWind.Position(x[1], y[1], z[1]));
        meshPositions.push(new WorldWind.Position(x[3], y[3], z[1]));
        meshPositions.push(new WorldWind.Position(x[1], y[1], z[0]));

        meshIndices.push(18);
        meshIndices.push(19);
        meshIndices.push(20);


        texCoords.push(new WorldWind.Vec2(1, 1));
        texCoords.push(new WorldWind.Vec2(1, 1));
        texCoords.push(new WorldWind.Vec2(1, 1));


        meshPositions.push(new WorldWind.Position(x[3], y[3], z[1]));
        meshPositions.push(new WorldWind.Position(x[3], y[3], z[0]));
        meshPositions.push(new WorldWind.Position(x[1], y[1], z[0]));

        meshIndices.push(21);
        meshIndices.push(22);
        meshIndices.push(23);


        meshPositions.push(new WorldWind.Position(x[3], y[3], z[1]));
        meshPositions.push(new WorldWind.Position(x[2], y[2], z[0]));
        meshPositions.push(new WorldWind.Position(x[3], y[3], z[0]));

        meshIndices.push(24);
        meshIndices.push(25);
        meshIndices.push(26);

        texCoords.push(new WorldWind.Vec2(1, 1));
        texCoords.push(new WorldWind.Vec2(1, 1));
        texCoords.push(new WorldWind.Vec2(1, 1));


        meshPositions.push(new WorldWind.Position(x[3], y[3], z[1]));
        meshPositions.push(new WorldWind.Position(x[2], y[2], z[1]));
        meshPositions.push(new WorldWind.Position(x[2], y[2], z[0]));

        meshIndices.push(27);
        meshIndices.push(28);
        meshIndices.push(29);


        meshPositions.push(new WorldWind.Position(x[2], y[2], z[1]));
        meshPositions.push(new WorldWind.Position(x[2], y[2], z[0]));
        meshPositions.push(new WorldWind.Position(x[0], y[0], z[1]));

        meshIndices.push(30);
        meshIndices.push(31);
        meshIndices.push(32);

        texCoords.push(new WorldWind.Vec2(0, 0));
        texCoords.push(new WorldWind.Vec2(0, 0));
        texCoords.push(new WorldWind.Vec2(0, 0));

        meshPositions.push(new WorldWind.Position(x[2], y[2], z[0]));
        meshPositions.push(new WorldWind.Position(x[0], y[0], z[0]));
        meshPositions.push(new WorldWind.Position(x[0], y[0], z[1]));

        meshIndices.push(33);
        meshIndices.push(34);
        meshIndices.push(35);


        var meshAttributes = new WorldWind.ShapeAttributes(null);

        meshAttributes.drawOutline = false;
        meshAttributes.applyLighting = true;


        var mesh = new WorldWind.TriangleMesh(meshPositions, meshIndices, meshAttributes);

        if (color.length > 1) {
            var canvas = document.createElement("canvas");
            var ctx = canvas.getContext("2d");

            var my_gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
            my_gradient.addColorStop(0, color[0]);
            my_gradient.addColorStop(0.49, color[0]);
            my_gradient.addColorStop(0.51, color[1]);
            my_gradient.addColorStop(1, color[1]);

            ctx.fillStyle = my_gradient;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            texCoords.push(new WorldWind.Vec2(0, 0));
            texCoords.push(new WorldWind.Vec2(0, 0));
            texCoords.push(new WorldWind.Vec2(0, 0));
            texCoords.push(new WorldWind.Vec2(1, 1));
            texCoords.push(new WorldWind.Vec2(1, 1));
            texCoords.push(new WorldWind.Vec2(1, 1));
            texCoords.push(new WorldWind.Vec2(0, 0));
            texCoords.push(new WorldWind.Vec2(0, 0));
            texCoords.push(new WorldWind.Vec2(0, 0));
            texCoords.push(new WorldWind.Vec2(0, 0));
            texCoords.push(new WorldWind.Vec2(0, 0));
            texCoords.push(new WorldWind.Vec2(0, 0));
            texCoords.push(new WorldWind.Vec2(0, 0));
            texCoords.push(new WorldWind.Vec2(0, 0));
            texCoords.push(new WorldWind.Vec2(0, 0));
            texCoords.push(new WorldWind.Vec2(1, 1));
            texCoords.push(new WorldWind.Vec2(1, 1));
            texCoords.push(new WorldWind.Vec2(1, 1));
            texCoords.push(new WorldWind.Vec2(1, 1));
            texCoords.push(new WorldWind.Vec2(1, 1));
            texCoords.push(new WorldWind.Vec2(1, 1));
            texCoords.push(new WorldWind.Vec2(1, 1));
            texCoords.push(new WorldWind.Vec2(1, 1));
            texCoords.push(new WorldWind.Vec2(1, 1));
            texCoords.push(new WorldWind.Vec2(0, 0));
            texCoords.push(new WorldWind.Vec2(0, 0));
            texCoords.push(new WorldWind.Vec2(0, 0));

            meshAttributes.imageSource = new WorldWind.ImageSource(canvas);
            mesh.textureCoordinates = texCoords;
        } else {
            meshAttributes.interiorColor = color;
        }
        mesh.outlineIndices = [0, 1, 3, 4, 0, 1, 6, 7, 9, 10, 6, 7, 16, 17, 14, 12, 19, 22, 23, 18, 19, 28, 25, 26, 27, 28, 31, 34, 35, 30];

        mesh.expirationInterval = 100000;

        mesh.point = {
            0: x[0],
            1: y[0]
        };
        return mesh;

    };

    return Cube;
});