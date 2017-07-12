define(['./math'], function (math) {

var Transformation = function(){};

Transformation.prototype.setPoints = function (coord, coord2) {
    y0 = [];
    coord.forEach(function (c) {
        y0.push(c[0], c[1]);
    });

    var columns = [[], [], [], [], [], []];
    for (var x = 0; x < coord2.length; x++) {
        columns[0].push(coord2[x][0]);
        columns[0].push(0);

        columns[1].push(coord2[x][1]);
        columns[1].push(0);

        columns[2].push(1);
        columns[2].push(0);

        columns[3].push(0);
        columns[3].push(coord2[x][0]);


        columns[4].push(0);
        columns[4].push(coord2[x][1]);


        columns[5].push(0);
        columns[5].push(1);

    }
    var A = columns;
    A = math.transpose(A);

    var a_trans = math.transpose(A);
    var a_mult = math.multiply(a_trans, A);
    var a_inv = math.inv(a_mult);
    var a_mult_trans = math.multiply(a_inv, a_trans);

    var result = math.multiply(a_mult_trans, y0);

    this.a = result[0];
    this.b = result[1];
    this.c = result[2];
    this.d = result[3];
    this.e = result[4];
    this.f = result[5];
};
Transformation.prototype.transform = function (coord) {

    var new_X = this.a * coord[0] + this.b * coord[1] + this.c;
    var new_Y = this.d * coord[0] + this.e * coord[1] + this.f;

    return [new_X, new_Y];

};

return Transformation;
});

