/*jshint -W083 */
/*global define:true, $:true, Papa:true, WorldWind:true, Promise:true, google:true*/

var wwd;
var layers;

define([
    'src/WorldWind',
    'myScripts/Cube',

], function(
    WorldWind,
    Cube) {

    var GlobeInterface = function() {};

    GlobeInterface.prototype.create = function(options, parent) {
        this.heightCube = options.heightCube;
        this.gridUrl = options.gridUrl;
        this.heightDim = options.heightDim;
        this.maxShown = options.maxShown;
        this.maxInApp = options.maxInApp;
        this.startHeight = options.startHeight;
        this.autoTime = options.autoTime;
        this.statIndex = options.statIndex;
        this.maxDownload = options.maxDownload;
        this.colors = options.colors;
        this.config = [];
        this.config[0] = options.config_0;
        this.sub = options.sub;
        layers = this.layers = []; //debugging
        this.allTime = [];
        this.time = {};
        this.dim = {};
        this.rect = [];
        this.minTime = 0;
        this.activeLayers = 0;
        this.compare = 0;
        this.bigCubes = [];
        this.parent = parent;
        this.wwd = parent.wwd;

    };

    GlobeInterface.prototype.updateOpt = function(options) {
        this.UI.resetTime(options[0]);
        this.autoTime = options[1];
        this.statIndex = options[2];

    };

    GlobeInterface.prototype.clean = function() {
        var x;
        if (this.layers) {
            for (x in this.layers) {
                this.wwd.removeLayer(this.layers[x]);
            }
            this.layers = [];

        }
        if (this.bigCubes) {
            for (x in this.bigCubes) {
                this.wwd.removeLayer(this.bigCubes[x]);
            }
        }

    };

    GlobeInterface.prototype.cubeFromData = function(content, number) {
        this.config[number] = this.parent.config[number];
        var size = content.length;
        var config = this.config[number];
        var allTime = this.allTime;
        var time = this.time;

        for (var x = 0; x < size; x++) {
            var tmp = content[x];

            if (allTime.indexOf(tmp[config.time]) == -1) {
                allTime.push(tmp[config.time]);
            }
            if (!time[tmp[config.time]]) {
                time[tmp[config.time]] = [];
            }
            if (!time[tmp[config.time]][number]) {
                time[tmp[config.time]][number] = [];
            }



            var tempArray = [tmp[config.id]];

            for (var y in config.data) {
                tempArray.push(tmp[config.data[y]]);
            }

            time[tmp[config.time]][number].push(tempArray);
        }

        this.parent.dataLoaded++;
        if (this.config[1]) {
            var reference = this.config[1].reference;
            if (this.parent.dataLoaded == 2) {
                this.makeCubes(config, reference);
                this.UI.disableNewData();
                this.UI.start();
                this.movingTemplate = this.createRect(this.sub, this);
            }
        } else {
            this.makeCubes(config, 0);
        }

    };

    GlobeInterface.prototype.loadGrid = function(resolve) {
        var gridLayer = new WorldWind.RenderableLayer("GridLayer");
        this.gridLayer = gridLayer;
        this.createJson(this.gridLayer, this.gridUrl, this.configuration, resolve);
        this.wwd.addLayer(this.gridLayer);
    };

    GlobeInterface.prototype.makeBigCubes = function() {
        var parent = this.parent;
        var bigCubes = [];
        var heightDim = this.heightDim;
        var compare = this.compare;
        var x, y;
        var layers = this.layers;
        for (x in layers) {

            for (y in layers[x].renderables) {
                layers[x].renderables[y].enabled = false;
                layers[x].renderables[y].bigCubed = true;
            }
        }

        if (heightDim > this.maxShown) {
            heightDim = this.maxShown;
        }
        var z = {
            altitude: this.startHeight,
            height: this.activeLayers * this.heightCube / heightDim
        };
        for (x = 0; x < heightDim; x++) {
            if (this.bigCubes && this.bigCubes[x]) {
                this.wwd.removeLayer(this.bigCubes[x]);
            }

            bigCubes[x] = new WorldWind.RenderableLayer("bigCubes_" + x);
            this.wwd.addLayer(bigCubes[x]);
            var rect = this.rect;
            for (y = 0; y < rect.length; y++) {
                var rectangle = rect[y];
                var height = x + this.minTime;
                var stat = this.getStat(rectangle, height, parent.myData[compare], this.statIndex, this.colors, compare);
                var bigCube = this.getBigCubes(rectangle, z, stat[0]);
                bigCube.data = stat[1];
                bigCube.showAlt = true;
                bigCube.bigShow = true;
                bigCubes[x].addRenderable(bigCube);
            }
            z.altitude = z.altitude + z.height;
        }

        this.bigCubes = bigCubes;

    };

    GlobeInterface.prototype.makeCubes = function(config, number) {
        var parent = this.parent;
        var self = this;
        this.activeLayers = 0;
        var time = this.time;
        var timeSize = Object.size(time);
        var allowedTime = [];

        for (var l = 0; l < timeSize; l++) {
            if (allowedTime.length < this.maxInApp) {
                if (allowedTime.indexOf(l) == -1) {
                    allowedTime.push(l);
                } else {
                    break;
                }

                if (this.config[1] && (!time[this.allTime[l]][0] || !time[this.allTime[l]][1])) {
                    break;
                }

                this.layers[l] = new WorldWind.RenderableLayer(); //temp

                this.layers[l].enabled = true;

                this.layers[l].active = true;
                this.activeLayers++;

                if (l >= this.maxShown) {
                    this.layers[l].enabled = false;
                    this.layers[l].active = false;
                    this.activeLayers--;
                }
                this.layers[l].heightLayer = l;
                this.wwd.addLayer(this.layers[l]);
                var cubes = [];


                var colorCube;
                var colors;
                var num;
                var coords;
                var id;
                var info;
                var data, data1;
                var thisTime = time[this.allTime[l]][number];

                var length = thisTime.length;
                if (this.config[1]) {
                    length = Math.min(time[this.allTime[l]][0].length, time[this.allTime[l]][1].length);
                }
                for (var x = 0; x < length; x++) {
                    if (this.config[1] && !time[this.allTime[l]][1][x]) {
                        break;
                    }

                    var result;

                    var renderables = self.gridLayer.renderables;
                    var xTime = thisTime[x][0];

                    for (var y = 0; y < renderables.length; y++) {
                        var ref = renderables[y].attributes.id;
                        if (ref == xTime) {
                            result = renderables[y];
                            break;
                        }
                    }
                    if (result && result._boundaries) {


                        if (this.config[1]) {
                            colorCube = [];
                            info = [];
                        }

                        if (time[this.allTime[l]][1]) {
                            num = time[this.allTime[l]][1][x][1].split(".").join("");
                            var max1 = parent.myData[1].bounds[0];
                            var min1 = parent.myData[1].bounds[1];
                            colors = this.colors;
                            var col1 = this.color(((num - min1) / (max1 - min1)) * 100, colors);
                            colorCube.push("rgb(" + col1[0] + "," + col1[1] + "," + col1[2] + ")");
                            info.push(time[this.allTime[l]][1][x]);
                            data1 = num;

                        }

                        num = time[this.allTime[l]][number][x][1].split(".").join("");
                        data = num;
                        var max = parent.myData[0].bounds[0];
                        var min = parent.myData[0].bounds[1];
                        colors = this.colors;
                        var col = this.color(((num - min) / (max - min)) * 100, colors);


                        if (this.config[1]) {
                            colorCube.push("rgb(" + col[0] + "," + col[1] + "," + col[2] + ")");
                            info.push(time[this.allTime[l]][0][x]);
                        } else {
                            colorCube = WorldWind.Color.colorFromBytes(col[0], col[1], col[2], col[3]);
                            info = time[this.allTime[l]][number][x];

                        }

                        coords = this.getCoords(result);
                        coords.altitude = this.startHeight + (l * this.heightCube);
                        coords.height = this.heightCube;
                        id = result.attributes.id;
                    }


                    var cube = new Cube(coords, colorCube);

                    cube.enabled = true;
                    cube.info = info;

                    cube.heightLayer = l;
                    cube.data = [];
                    cube.data.push(data);
                    if (this.config[1]) {
                        cube.data.push(data1);
                    }
                    cube.filtered = false;
                    cube.latlongfilter = false;

                    cube.id = id;
                    cubes.push(cube);
                }

                this.layers[l].addRenderables(cubes);

            }
        }
    };

    GlobeInterface.prototype.getCoords = function(renderable) {
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

    GlobeInterface.prototype.assignCubes = function() {
        var rect = this.rect;
        for (var x in this.gridLayer.renderables) {
            for (var y = 0; y < rect.length; y++) {
                for (var z in this.layers) {
                    if (this.layers[z].renderables[x]) {
                        if (rect[y].containsPoint(this.layers[z].renderables[x].point)) {
                            rect[y].cubes.push(this.layers[z].renderables[x]);
                        }

                    }
                }
            }
        }
    };

    GlobeInterface.prototype.createRect = function(division) {
        var gridLayer = this.gridLayer;
        var x;
        var minLat = Infinity,
            minLng = Infinity,
            maxLat = -Infinity,
            maxLng = -Infinity;
        for (x in gridLayer.renderables) {
            var r = gridLayer.renderables[x];

            minLng = Math.min(minLng, r._boundaries[1].longitude);
            minLat = Math.min(minLat, r._boundaries[0].latitude);
            maxLng = Math.max(maxLng, r._boundaries[2].longitude);
            maxLat = Math.max(maxLat, r._boundaries[1].latitude);

            r.point = {
                0: r._boundaries[0].latitude,
                1: r._boundaries[0].longitude
            };
        }
        gridLayer.bounds = {};
        gridLayer.bounds.minLng = minLng;
        gridLayer.bounds.minLat = minLat;
        gridLayer.bounds.maxLng = maxLng;
        gridLayer.bounds.maxLat = maxLat;


        this.dim.x = (maxLat - minLat) / division;
        this.dim.y = (maxLng - minLng) / division;

        var subBlocks = division * division;

        var block = 0;
        var blockLat = minLat;
        var blockLng = minLng;

        for (x = 0; x < division; x++) {

            for (var z = 0; z < division; z++) {

                this.rect[block] = new WorldWind.Rectangle(
                    blockLat,
                    blockLng,
                    this.dim.x, this.dim.y);
                this.rect[block].cubes = [];
                block++;
                blockLat = blockLat + this.dim.x;
            }
            blockLng = blockLng + this.dim.y;
            blockLat = minLat;
        }

        var movingTemplate = new WorldWind.Rectangle(
            minLat - 0.00001,
            minLng - 0.00001,
            this.dim.x * this.sub,
            this.dim.y * this.sub);
        this.assignCubes();

        return movingTemplate;
    };

    GlobeInterface.prototype.configuration = function(geometry, properties) {
        var configuration = {};
        if (geometry.isPolygonType() || geometry.isMultiPolygonType()) {
            configuration.attributes = new WorldWind.ShapeAttributes(null);
            configuration.attributes.id = properties.id;
            configuration.attributes.interiorColor = new WorldWind.Color(0.3, 0.3, 0.3, 0.5);
            configuration.attributes.outlineColor = new WorldWind.Color(1, 1, 1, 0.8);
        }
        return configuration;
    };

    GlobeInterface.prototype.createJson = function(layer, url, configuration, resolve) {
        var multiPolygonGeoJSON = new WorldWind.GeoJSONParser(url);
        multiPolygonGeoJSON.load(configuration, layer, resolve);
    };

    GlobeInterface.prototype.color = function(weight, inputColors) {
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

    GlobeInterface.prototype.getBigCubes = function(rect, z, color) {
        var coords = {};
        var dim = this.dim;
        coords[0] = {};
        coords[1] = {};
        coords[2] = {};
        coords[3] = {};
        coords[0].lat = rect.x;
        coords[0].lng = rect.y;
        coords[1].lat = rect.x + dim.x;
        coords[1].lng = rect.y;
        coords[2].lat = rect.x + dim.x;
        coords[2].lng = rect.y + dim.y;
        coords[3].lat = rect.x;
        coords[3].lng = rect.y + dim.y;

        coords.altitude = z.altitude;
        coords.height = z.height;
        var cube = new Cube(coords, color);

        cube.enabled = true;
        cube.active = true;
        cube.height = coords.height;
        return cube;
    };

    GlobeInterface.prototype.getStat = function(rect, height, data, index, colors) {
        var sum = 0;
        var sumweight = 0;
        var sumValue = 0;
        var iteration = 0;
        var min = 0;
        var max = -Infinity;
        var median = 0;
        var compare = this.compare;

        for (var n = 0; n < rect.cubes.length; n++) {
            if (rect.cubes[n].heightLayer == height) {
                iteration += 1;
                var weight;
                if (this.config[this.compare].idSeparator) {
                    var id = rect.cubes[n].id.split(this.config[this.compare].idSeparator).length / 3;
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
            case 0:
                value = sum / sumweight; //weighted avg
                break;
            case 1:
                value = sumValue / iteration; //arith avg
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
        var col = this.color(((value - minBound) / (maxBound - minBound)) * 100, colors);
        col = WorldWind.Color.colorFromBytes(col[0], col[1], col[2], col[3]);

        return [col, value];

    };

    GlobeInterface.prototype.changeSize = function(size, dir) {

        var lengthTemp;
        var dim = this.dim;
        var movingTemplate = this.movingTemplate;
        if (dir) {
            this.movingTemplate.y = this.gridLayer.bounds.minLng + size[0];
            lengthTemp = (dim.y * this.sub) - size[0];
            movingTemplate.height = lengthTemp;
            movingTemplate.height = lengthTemp - (dim.y * this.sub - size[1]);
        } else {
            movingTemplate.x = this.gridLayer.bounds.minLat + size[0];
            lengthTemp = (dim.x * this.sub) - size[0];
            movingTemplate.width = lengthTemp;
            movingTemplate.width = lengthTemp - (dim.x * this.sub - size[1]);
        }
    };

    GlobeInterface.prototype.changeAlt = function(values) {
        var number;
        var n, x;

        for (n = 0; n < this.layers.length; n++) {
            this.layers[n].enabled = false;

        }

        for (n in this.bigCubes) {
            for (x in this.bigCubes[n].renderables) {
                this.bigCubes[n].renderables[x].enabled = false;
                this.bigCubes[n].renderables[x].showAlt = false;
            }
        }

        var norm = [Math.floor((this.heightDim * values[0]) / this.activeLayers), Math.floor((this.heightDim * values[1]) / this.activeLayers)];

        for (n = norm[0]; n < norm[1]; n++) {
            if (this.bigCubes[n]) {
                for (x in this.bigCubes[n].renderables) {
                    if (this.bigCubes[n].renderables[x].active) {
                        if (this.bigCubes[n].renderables[x].bigShow) {
                            this.bigCubes[n].renderables[x].enabled = true;
                        }
                        this.bigCubes[n].renderables[x].showAlt = true;
                    } else {
                        this.bigCubes[n].renderables[x].showAlt = false;
                    }
                }
            }
        }
        for (n = values[0] + this.minTime; n < values[1] + this.minTime; n++) {
            if (this.layers[n].active) {
                this.layers[n].enabled = true;
            }
        }
        wwd.redraw();
    };

    GlobeInterface.prototype.setOpacity = function(value) {
        var x, y;
        for (x in this.layers) {
            for (y in this.layers[x].renderables) {
                this.layers[x].renderables[y]._attributes.interiorColor.alpha = value;
            }
        }

        for (x in this.bigCubes) {
            for (y in this.bigCubes[x].renderables) {
                this.bigCubes[x].renderables[y]._attributes.interiorColor.alpha = value;
            }
        }
    };

    GlobeInterface.prototype.filterValues = function(values) {
        var compare = this.compare;
        var layers = this.layers;
        for (var x in layers) {
            for (var y in layers[x].renderables) {
                var renderable = layers[x].renderables[y];
                var data = renderable.data[compare];

                if (data < values[0] || data > values[1]) {

                    renderable.enabled = false;
                    renderable.filtered = true;

                } else {
                    if (renderable.filtered) {
                        renderable.filtered = false;
                        if (!renderable.latlongfilter && !renderable.bigCubed) {
                            renderable.enabled = true;
                        }
                    }
                }
            }
        }
    };

    GlobeInterface.prototype.changeTime = function(val, direction) {
        this.minTime = val;
        var number, x;

        if (direction) {
            number = this.heightCube;
        } else {
            number = -this.heightCube;
        }

        for (var z in this.layers) {
            var thisLayer = this.layers[z];
            for (x in thisLayer.renderables) {
                var bottom = thisLayer.renderables[x].positions[0].altitude;
                var myRend = thisLayer.renderables[x];
                var positions = myRend.positions;
                for (var y in positions) {

                    var current = positions[y].altitude;
                    var additional = Number(this.startHeight + (this.heightCube * Number(z)) - (val * this.heightCube));

                    if (current == bottom) {
                        additional += 0;
                    } else {
                        additional += this.heightCube;
                    }

                    positions[y].altitude = additional;

                }

            }
        }

        var layers = this.layers;
        for (x in layers) {
            layers[x].enabled = false;
            layers[x].active = false;
        }
        for (x = val; x <= (this.activeLayers - 1) + val; x++) {
            this.layers[x].enabled = true;
            this.layers[x].active = true;
        }



        wwd.redraw();
    };

    GlobeInterface.prototype.moveWindow = function(direction) {
        var x, y, z, h;
        var rect = this.rect;
        var movingTemplate = this.movingTemplate;
        if (direction) {
            for (y in this.layers) {
                for (x in this.layers[y].renderables) {
                    if (movingTemplate.containsPoint(this.layers[y].renderables[x].point) && this.layers[y].renderables[x].enabled === false) {
                        for (z in rect) {
                            if (this.layers[y].renderables[x]) {
                                if (rect[z].cubes.indexOf(this.layers[y].renderables[x]) !== -1) {
                                    if (movingTemplate.intersects(rect[z])) {
                                        if (this.bigCubes.length > 0) {
                                            for (h in this.bigCubes) {
                                                if (this.bigCubes[h].renderables[z].active) {
                                                    if (this.bigCubes[h].renderables[z].showAlt) {
                                                        this.bigCubes[h].renderables[z].enabled = true;
                                                        this.bigCubes[h].renderables[z].bigShow = true;
                                                    }
                                                } else {
                                                    this.layers[y].renderables[x].latlongfilter = false;
                                                    if (!this.layers[y].renderables[x].filtered) {
                                                        this.layers[y].renderables[x].enabled = true;

                                                    }
                                                }
                                            }
                                        } else {
                                            this.layers[y].renderables[x].latlongfilter = false;
                                            if (!this.layers[y].renderables[x].filtered) {
                                                this.layers[y].renderables[x].enabled = true;

                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }

        } else {
            for (y in this.layers) {
                for (x in this.layers[y].renderables) {
                    if (!movingTemplate.containsPoint(this.layers[y].renderables[x].point)) {
                        for (z in rect) {
                            if (this.layers[y].renderables[x]) {
                                if (rect[z].cubes.indexOf(this.layers[y].renderables[x]) !== -1) {
                                    if (this.bigCubes.length > 0) {
                                        for (h in this.bigCubes) {
                                            if (this.bigCubes[h].renderables[z].active) {
                                                this.bigCubes[h].renderables[z].enabled = false;
                                                this.bigCubes[h].renderables[z].bigShow = false;

                                            } else {
                                                this.layers[y].renderables[x].enabled = false;
                                                this.layers[y].renderables[x].latlongfilter = true;
                                            }
                                        }
                                    } else {
                                        this.layers[y].renderables[x].enabled = false;
                                        this.layers[y].renderables[x].latlongfilter = true;

                                    }

                                }
                            }
                        }
                    }
                }
            }
        }
    };

    GlobeInterface.prototype.getCorrelation = function() {
        var time = this.time;
        var config0 = this.config[0];
        var config1 = this.config[1];
        var first = [];
        var second = [];
        var y;
        var weight;
        var sum0 = 0;
        var sum1 = 0;

        var dataNum0 = 0;
        var dataNum1 = 0;

        for (var x in time) {
            if (time[x][0] && time[x][1]) {
                var length=Math.min(time[x][0].length,time[x][1].length);
                for (y = 0; y < length; y++) {
                    var id = time[x][0][y][config0.id];
                    if (config0.idSeparator) {
                        id = time[x][0][y][config0.id].split(config0.idSeparator).length / 3;
                        weight = 1 / id;
                    } else {
                        weight = 1;
                    }
                    var val;
                    if (config0.separator) {
                        val = time[x][0][y][config0.data[dataNum0]].split(config0.separator).join("");
                    } else {
                        val = time[x][0][y][config0.data[dataNum0]];
                    }
                    sum0 += val * weight;

                    id = time[x][1][y][config1.id];
                    if (config0.idSeparator) {
                        id = time[x][1][y][config1.id].split(config1.idSeparator).length / 3;
                        weight = 1 / id;
                    } else {
                        weight = 1;
                    }
                    if (config0.separator) {
                        val = time[x][1][y][config1.data[dataNum1]].split(config1.separator).join("");
                    } else {
                        val = time[x][1][y][config1.data[dataNum1]];
                    }
                    sum1 += val * weight;
                }

                first.push(sum0 / time[x][0].length);
                second.push(sum1 / time[x][1].length);
            }

        }
        var corr = [first, second];
        var correlation = this.correlation(corr, 0, 1);
        return correlation;
    };

    GlobeInterface.prototype.correlation = function(prefs, p1, p2) {

        var si = [];

        for (var key in prefs[p1]) {
            if (prefs[p2][key]) si.push(key);
        }

        var n = si.length;

        if (n === 0) return 0;

        var sum1 = 0;
        var i;
        for (i = 0; i < si.length; i++) sum1 += prefs[p1][si[i]];

        var sum2 = 0;
        for (i = 0; i < si.length; i++) sum2 += prefs[p2][si[i]];

        var sum1Sq = 0;
        for (i = 0; i < si.length; i++) {
            sum1Sq += Math.pow(prefs[p1][si[i]], 2);
        }

        var sum2Sq = 0;
        for (i = 0; i < si.length; i++) {
            sum2Sq += Math.pow(prefs[p2][si[i]], 2);
        }

        var pSum = 0;
        for (i = 0; i < si.length; i++) {
            pSum += prefs[p1][si[i]] * prefs[p2][si[i]];
        }

        var num = pSum - (sum1 * sum2 / n);
        var den = Math.sqrt((sum1Sq - Math.pow(sum1, 2) / n) *
            (sum2Sq - Math.pow(sum2, 2) / n));

        if (den === 0) return 0;

        return num / den;

    };


    return GlobeInterface;
});