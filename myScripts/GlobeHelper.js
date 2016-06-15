define(
    function () {

        var GlobeHelper = GlobeHelper || {}

        GlobeHelper.getCoords = function (renderable) {
            var coord = {};
            coord[0] = {};
            coord[0].lat = renderable._boundaries[0].latitude;
            coord[0].lng = renderable._boundaries[0].longitude;
            coord[1] = {};
            coord[1].lat = renderable._boundaries[1].latitude;
            coord[1].lng = renderable._boundaries[1].longitude;
            coord[2] = {};
            coord[2].lat = renderable._boundaries[2].latitude;
            coord[2].lng = renderable._boundaries[2].longitude;
            coord[3] = {};
            coord[3].lat = renderable._boundaries[3].latitude;
            coord[3].lng = renderable._boundaries[3].longitude;
            return coord;
        };
        GlobeHelper.clean = function (layers, bigCubes, globe) {
            var x;

            if (layers) {
                for (x in layers) {
                    globe.removeLayer(layers[x]);
                }

            }
            if (bigCubes) {
                for (x in bigCubes) {
                    globe.removeLayer(bigCubes[x]);
                }
            }

        };
        GlobeHelper.getStatistics = function (rect, height, data, index, colors, config, compare) {
            var sum = 0;
            var sumweight = 0;
            var sumValue = 0;
            var iteration = 0;
            var min = 0;
            var max = -Infinity;
            var median = 0;

            for (var n = 0; n < rect.cubes.length; n++) {
                if (rect.cubes[n].heightLayer == height) {
                    iteration += 1;
                    var weight;
                    if (config[compare].idSeparator) {
                        var id = rect.cubes[n].id.split(config[compare].idSeparator).length / 3;
                        weight = 1 / id;
                    } else {
                        weight = 1;
                    }
                    sumweight += weight;
                    sum += Number(rect.cubes[n].data[compare] * weight);
                    sumValue += Number(rect.cubes[n].data);
                    max = Math.max(max, Number(rect.cubes[n].data[compare]));
                    min = Math.min(min, Number(rect.cubes[n].data[compare]));
                }
            }
            var value;

            switch (index) {
                case 0:  //weighted average
                    value = sum / sumweight;
                    break;
                case 1: //arithmetic average
                    value = sumValue / iteration;
                    break;
                case 2: // variance
                    var aritAverage = sumValue / iteration;
                    var variance = 0;
                    for (n = 0; n < rect.cubes.length; n++) {
                        if (rect.cubes[n].heightLayer == height) {
                            var val = rect.cubes[n].data[compare];
                            variance += (val - aritAverage) * (val - aritAverage);
                        }
                    }
                    variance = variance / (iteration - 1);
                    value = Math.sqrt(variance);
                    break;
                case 3: //median
                    median = Math.ceil(iteration / 2);
                    value = rect.cubes[median].data[compare];
                    break;
                case 4: //max
                    value = max;
                    break;
                case 5: //min
                    value = min;
                    break;
                default:
                    value = sum / sumweight;
                    break;
            }

            var maxBound = data.bounds[0];
            var minBound = data.bounds[1];
            var col = this.getColor(((value - minBound) / (maxBound - minBound)) * 100, colors);

            return [col, value];

        };


        GlobeHelper.getRGB = function (h) {
            h = (h.charAt(0) == "#") ? h.substring(1, 7) : h;
            var r = parseInt(h.substring(0, 2), 16);
            var g = parseInt(h.substring(2, 4), 16);
            var b = parseInt(h.substring(4, 6), 16);
            return [r, g, b];
        };
        GlobeHelper.getColor = function (weight, inputColors) {
            var p, colors = [];
            if (weight < 50) {
                colors[1] = inputColors[0];
                colors[0] = inputColors[1];
                p = weight / 50;
            } else {
                colors[1] = inputColors[1];
                colors[0] = inputColors[2];
                p = (weight - 50) / 50;
            }
            var w = p * 2 - 1;
            var w1 = (w / 1 + 1) / 2;
            var w2 = 1 - w1;
            var rgb = [Math.round(colors[0][0] * w1 + colors[1][0] * w2),
                Math.round(colors[0][1] * w1 + colors[1][1] * w2),
                Math.round(colors[0][2] * w1 + colors[1][2] * w2)
            ];
            return [rgb[0], rgb[1], rgb[2], 255];
        };
        GlobeHelper.toTime = function (timeVal) {
            var date = new Date(0);
            try{
            date.setMilliseconds(Number(timeVal + "000"));
            timeVal = date.toLocaleDateString() + " " + date.toLocaleTimeString();}
            catch(e){
                timeVal=0;
            }
            return timeVal;
        };
        return GlobeHelper;
    });