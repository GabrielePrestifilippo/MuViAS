/*jshint -W083 */
/*global define:true, $:true, Papa:true, WorldWind:true, Promise:true*/

var wwd;
var layers;


//change x of->x in


Object.size = function(obj) {
    var size = 0,
        key;
    for (key in obj) {
        if (obj.hasOwnProperty(key)) size++;
    }
    return size;
};

define([
    'src/WorldWind',
    'myScripts/Cube',
    'myScripts/myData.js',
    'myScripts/UI.js',

], function(
    WorldWind,
    Cube,
    myData,
    UI) {

    var TeleData = function() {

        WorldWind.Logger.setLoggingLevel(WorldWind.Logger.LEVEL_ERROR);
        wwd = this.wwd = new WorldWind.WorldWindow("canvasOne"); //debugging
        this.wwd.addLayer(new WorldWind.BMNGOneImageLayer());
        this.wwd.addLayer(new WorldWind.BingAerialWithLabelsLayer());
        this.wwd.addLayer(new WorldWind.CompassLayer());
        this.wwd.addLayer(new WorldWind.CoordinatesDisplayLayer(wwd));
        this.wwd.addLayer(new WorldWind.ViewControlsLayer(wwd));
    };

    TeleData.prototype.updateOpt = function(options) {
        this.UI.resetTime(options[0]);
        this.autoTime = options[1];
        this.statIndex = options[2];
    };
    
    TeleData.prototype.create = function(options) {
        this.clean();
        this.heightCube = options.heightCube;
        this.gridUrl = options.gridUrl;
        this.heightDim = options.heightDim;
        this.maxShown = options.maxShown;
        this.maxInApp = options.maxInApp;
        this.startHeight = options.startHeight;
        this.autoTime = options.autoTime;
        this.statIndex = options.statIndex;
        this.maxDownload = options.maxDownload;
        this.config = options.config;
        this.sub = options.sub;
        this.dataUrl = options.dataUrl;
        this.data = new myData(this);
        //this.data.bounds = [79714491610112800, 5707801646149];
        var self = this;
        layers = this.layers = []; //debugging
        this.allTime = [];
        this.dim = {};
        this.rect = [];
        this.time = {};
        this.minTime = 0;
        this.activeLayers = 0;
        this.bigCubes = [];


        var gridLayer = new WorldWind.RenderableLayer("GridLayer"); //env
        this.gridLayer = gridLayer;

        var promiseGrid = $.Deferred(function() {
            self.loadGrid(this.resolve);
        });

        var dataUrl = this.dataUrl;
        var promiseData = $.Deferred(function() {
            self.data.getData(dataUrl, this.resolve);
        });


        $.when(promiseGrid, promiseData).done(function(res1, res2) {
            self.movingTemplate = self.createRect(self.sub, self); //grid dependable
            self.UI = new UI(self);
        });


    };
    TeleData.prototype.clean = function() {
        var x;
        if (this.layers) {
            for (x in this.layers) {
                this.wwd.removeLayer(this.layers[x]);
            }

        }
        if (this.bigCubes) {
            for (x in this.bigCubes) {
                this.wwd.removeLayer(this.bigCubes[x]);
            }
        }

    };


    TeleData.prototype.cubeFromData = function(data, number) {

        var config = this.config;
        this.parserToTime(data, number);
        //this.makeCubes();
        this.makeHalfCubes(config, number);
    };
    TeleData.prototype.loadGrid = function(resolve) {
        this.createJson(this.gridLayer, this.gridUrl, this.configuration, resolve);
        this.wwd.addLayer(this.gridLayer);
    };

    TeleData.prototype.parserToTime = function(content, number) {
        var size = content.length;
        var config = this.config;

        for (var x = 0; x < size; x++) {
            var tmp = content[x];
            if (this.allTime.indexOf(tmp[config.time]) == -1) {
                this.allTime.push(tmp[config.time]);
            }
            if (!this.time[tmp[config.time]]) {
                this.time[tmp[config.time]] = [];
                this.time[tmp[config.time]][number] = [];
            }
            var tempArray = [tmp[config.id]];

            for (var y in config.data) {
                tempArray.push(tmp[config.data[y]]);
            }

            this.time[tmp[config.time]][number].push(tempArray);
        }
    };


    TeleData.prototype.makeBigCubes = function() {
        var bigCubes = [];
        var heightDim = this.heightDim;
        var x, y;
        for (x in layers) {

            for (y in layers[x].renderables) {
                layers[x].renderables[y].enabled = false;

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
                var stat = this.getStat(rectangle, height, this.data, this.statIndex);
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

    TeleData.prototype.makeCubes = function() {
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
                for (var x in time[this.allTime[l]]) {

                    var id;
                    var result = $.grep(self.gridLayer.renderables, function(e) {
                        id = e.attributes.id;
                        return e.attributes.id == time[self.allTime[l]][x][0];
                    });

                    if (result && result[0] && result[0]._boundaries) {
                        var num = time[this.allTime[l]][x][1].split(".").join("");

                        var max = this.data.bounds[0];
                        var min = this.data.bounds[1];

                        var col = this.color(((num - min) / (max - min)) * 100);
                        var coords = this.getCoords(result[0]);
                        coords.altitude = this.startHeight + (l * this.heightCube);
                        coords.height = this.heightCube;

                        var cube = new Cube(coords, col);

                        cube.enabled = true;
                        cube.info = time[this.allTime[l]][x];

                        cube.heightLayer = l;
                        cube.data = num;
                        cube.id = result[0].attributes.id;
                        cubes.push(cube);

                    }
                }
                this.layers[l].addRenderables(cubes);
            }
        }
    };

    TeleData.prototype.makeHalfCubes = function(config, number) {
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
                for (var x in time[this.allTime[l]][number]) {

                    var id;
                    var result = $.grep(self.gridLayer.renderables, function(e) {
                        id = e.attributes.id;
                        return e.attributes.id == time[self.allTime[l]][number][x][0];
                    });

                    if (result && result[0] && result[0]._boundaries) {
                        var num = time[this.allTime[l]][number][x][1].split(".").join("");

                        var max = this.data.bounds[0];
                        var min = this.data.bounds[1];

                        var col = this.color(((num - min) / (max - min)) * 100);
                        var coords = this.getCoords(result[0]);

                        if (config.half) {
                            for (x in coords) {
                                if (!number) {
                                    coords[3].lng = coords[0].lng;
                                } else {
                                    coords[1].lng = coords[2].lng;
                                }
                            }
                        }

                        coords.altitude = this.startHeight + (l * this.heightCube);
                        coords.height = this.heightCube;

                        var cube = new Cube(coords, col);

                        cube.enabled = true;
                        cube.info = time[this.allTime[l]][number][x];

                        cube.heightLayer = l;
                        cube.data = num;
                        cube.id = result[0].attributes.id;
                        cubes.push(cube);

                    }
                }
                this.layers[l].addRenderables(cubes);
            }
        }
    };
    //geometry class?
    TeleData.prototype.getCoords = function(renderable) {
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



    TeleData.prototype.assignCubes = function() {
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

    TeleData.prototype.createRect = function(division) {
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




    TeleData.prototype.configuration = function(geometry, properties) {
        var configuration = {};
        if (geometry.isPolygonType() || geometry.isMultiPolygonType()) {
            configuration.attributes = new WorldWind.ShapeAttributes(null);
            configuration.attributes.id = properties.id;
            configuration.attributes.interiorColor = new WorldWind.Color(0.3, 0.3, 0.3, 0.5);
            configuration.attributes.outlineColor = new WorldWind.Color(1, 1, 1, 0.8);
        }
        return configuration;
    };

    TeleData.prototype.createJson = function(layer, url, configuration, resolve) {
        var multiPolygonGeoJSON = new WorldWind.GeoJSONParser(url);
        multiPolygonGeoJSON.load(configuration, layer, resolve);
    };

    TeleData.prototype.color = function(weight) {
        var color1, color2, p;
        if (weight < 50) {
            color2 = [255, 0, 0];
            color1 = [255, 255, 0];
            p = weight / 50;
        } else {
            color2 = [255, 255, 0];
            color1 = [0, 255, 0];
            p = (weight - 50) / 50;
        }
        var w = p * 2 - 1;
        var w1 = (w / 1 + 1) / 2;
        var w2 = 1 - w1;
        var rgb = [Math.round(color1[0] * w1 + color2[0] * w2),
            Math.round(color1[1] * w1 + color2[1] * w2),
            Math.round(color1[2] * w1 + color2[2] * w2)
        ];
        return new WorldWind.Color.colorFromBytes(rgb[0], rgb[1], rgb[2], 255);
    };

    TeleData.prototype.getBigCubes = function(rect, z, color) {
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
    TeleData.prototype.getStat = function(rect, height, data, index) {
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
                var weight = 1 / (rect.cubes[n].id.split("_").length / 3);
                sumweight += weight;
                sum += Number(rect.cubes[n].data * weight);
                sumValue += Number(rect.cubes[n].data);
                max = Math.max(max, Number(rect.cubes[n].data));
                min = Math.min(min, Number(rect.cubes[n].data));
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
                        var val = rect.cubes[n].data;
                        variance += (val - aritAverage) * (val - aritAverage);
                    }
                }
                variance = variance / (iteration - 1);
                value = Math.sqrt(variance);
                break;
            case 3: //median
                median = Math.ceil(iteration / 2);
                value = rect.cubes[median].data;
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
        var color = this.color(((value - minBound) / (maxBound - minBound)) * 100);
        return [color, value];

    };


    TeleData.prototype.changeSize = function(size, dir) {

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

    TeleData.prototype.changeAlt = function(values) {
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


    TeleData.prototype.setOpacity = function(value) {
        var x, y;
        for (x in this.layers) {
            for (y in this.layers[x].renderables) {
                this.layers[x].renderables[y]._attributes.interiorColor.alpha = value;
            }
        }

        for (x in this.bigCubes) {
            for (y in this.bigCubes[x].renderables) {
                this.bigCubes[x].renderables._attributes.interiorColor.alpha = value;
            }
        }
    };

    TeleData.prototype.changeTime = function(val, direction) {
        this.minTime = val;
        var number, x;

        if (direction) {
            number = this.heightCube;
        } else {
            number = -this.heightCube;
        }

        for (var z in this.layers) {
            for (x in this.layers[z].renderables) {
                var bottom = this.layers[z].renderables[x].positions[0].altitude;
                for (var y in this.layers[z].renderables[x].positions) {

                    var current = this.layers[z].renderables[x].positions[y].altitude;
                    var additional = Number(this.startHeight + (this.heightCube * Number(z)) - (val * this.heightCube));

                    if (current == bottom) {
                        additional += 0;
                    } else {
                        additional += this.heightCube;
                    }

                    this.layers[z].renderables[x].positions[y].altitude = additional;

                }
                this.layers[z].renderables[x].reset();
            }
        }

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

    TeleData.prototype.moveWindow = function(direction) {
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
                                                    this.layers[y].renderables[x].enabled = true;
                                                }
                                            }
                                        } else {
                                            this.layers[y].renderables[x].enabled = true;
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
                                            }
                                        }
                                    } else {
                                        this.layers[y].renderables[x].enabled = false;
                                    }

                                }
                            }
                        }
                    }
                }
            }
        }
    };

    return TeleData;
});