define([
    'myScripts/Voxel',
    'myScripts/GlobeHelper',
    'src/WorldWind'

], function (Cube,
             GlobeHelper,
             WorldWind) {

    var GlobeInterface = function (globe) {
        this.globe = globe;
    };
    /** Settings **/
    GlobeInterface.prototype.init = function (options, parent) {
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
        this.layers = [];

        this.dim = {};
        this.rect = [];
        this.minTime = 0;
        this.activeLayers = 0;
        this.compare = 0;
        this.bigCubes = [];
        this.parent = parent;
        this.myData = [];
    };
    GlobeInterface.prototype.updateOpt = function (options) {
        this.UI.resetTime(options[0]);
        this.autoTime = options[1];
        this.statIndex = options[2];

    };
    GlobeInterface.prototype.setUI = function (UI) {
        this.UI = UI;
    };

    /** Creation **/
    GlobeInterface.prototype.dataParser = function (content, allTime, time, config, number) {
        var size = content.length;


        for (var x = 0; x < size; x++) {
            var tmp = content[x];
            var tmpTime = GlobeHelper.toTime(tmp[config.time]);

            if (allTime.indexOf(tmpTime) == -1) {
                allTime.push(tmpTime);
            }
            if (!time[tmpTime]) {
                time[tmpTime] = [];
            }
            if (!time[tmpTime][number]) {
                time[tmpTime][number] = [];
            }


            var tempArray = [tmp[config.id]];

            for (var y in config.data) {
                tempArray.push(tmp[config.data[y]]);
            }

            time[tmpTime][number].push(tempArray);
        }
        return {allTime, time};
    };
    GlobeInterface.prototype.doxelFromData = function (allTime, time, config) {
        this.dataLoaded++;
        if (this.config[1]) {
            gInterface.maxShown = 1;
            for (var y in time) {
                if (time[y].length < 2) {
                    delete this.time[y];
                }
            }
            for (var y in allTime) {
                if (!time[Number(allTime[y])]) {
                    allTime.splice(y);
                }
            }
            var reference = this.config[1].reference;
            if (this.dataLoaded == 2) {
                this.makeDoxel(config, reference);
                this.UI.disableNewData();
                this.UI.start();
                var resultRect = this.createRect(this.sub, this.gridLayer);
                this.movingTemplate = resultRect[0];
                this.rect = resultRect[1];
                this.dim.x = resultRect[2];
                this.dim.y = resultRect[3];
                this.assignCubes(resultRect[1], this.gridLayer.renderables, this.layers);
            }
        } else {
            this.makeDoxel(allTime, time, config, 0);
        }

    };
    GlobeInterface.prototype.loadGrid = function (gridUrl,raw, resolve) {
        var gridLayer = new WorldWind.RenderableLayer("GridLayer");
        this.createJson(gridLayer, gridUrl, raw, resolve);
        this.globe.addLayer(gridLayer);
        return gridLayer;
    };
    GlobeInterface.prototype.makeBigDoxels = function () {
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
                this.globe.removeLayer(this.bigCubes[x]);
            }

            bigCubes[x] = new WorldWind.RenderableLayer("bigCubes_" + x);
            this.globe.addLayer(bigCubes[x]);
            var rect = this.rect;
            for (y = 0; y < rect.length; y++) {
                var rectangle = rect[y];
                var height = x + this.minTime;
                var stat = GlobeHelper.getStatistics(rectangle, height, this.myData[compare], this.statIndex, this.colors, this.config, this.compare);
                var col = WorldWind.Color.colorFromBytes(stat[0][0], stat[0][1], stat[0][2], stat[0][3]);
                var bigCube = this.getBigCubes(rectangle, z, col);
                bigCube.data = stat[1];
                bigCube.showAlt = true;
                bigCube.bigShow = true;
                bigCubes[x].addRenderable(bigCube);
            }
            z.altitude = z.altitude + z.height;
        }

        this.bigCubes = bigCubes;

    };
    GlobeInterface.prototype.makeDoxel = function (allTime, time, config, number) {
        var self = this;
        this.activeLayers = 0;

        var timeSize = Object.size(time);
        var allowedTime = [];

        for (var l = 0; l < timeSize; l++) {
            if (allowedTime.length < this.maxInApp) {
                if (allowedTime.indexOf(l) == -1) {
                    allowedTime.push(l);
                } else {
                    break;
                }

                if (this.config[1] && (!time[allTime[l]][0] || !time[allTime[l]][1])) {
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
                this.globe.addLayer(this.layers[l]);
                var cubes = [];


                var colorCube;
                var colors;
                var num;
                var coords;
                var id;
                var info;
                var data, data1;
                var thisTime = time[allTime[l]][number];

                var length = thisTime.length;
                if (this.config[1]) {
                    length = Math.min(time[allTime[l]][0].length, time[allTime[l]][1].length);
                }
                for (var x = 0; x < length; x++) {
                    if (this.config[1] && !time[allTime[l]][1][x]) {
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

                        if (time[allTime[l]][1]) {
                            num = time[allTime[l]][1][x][1].split(".").join("");
                            var max1 = this.myData[1].bounds[0];
                            var min1 = this.myData[1].bounds[1];
                            colors = this.colors;
                            var col1 = GlobeHelper.getColor(((num - min1) / (max1 - min1)) * 100, colors);
                            colorCube.push("rgb(" + col1[0] + "," + col1[1] + "," + col1[2] + ")");
                            info.push(time[allTime[l]][1][x]);
                            data1 = num;

                        }

                        num = time[allTime[l]][number][x][1].split(".").join("");
                        data = num;
                        var max = this.myData[0].bounds[0];
                        var min = this.myData[0].bounds[1];
                        colors = this.colors;
                        var col = GlobeHelper.getColor(((num - min) / (max - min)) * 100, colors);


                        if (this.config[1]) {
                            colorCube.push("rgb(" + col[0] + "," + col[1] + "," + col[2] + ")");
                            info.push(time[allTime[l]][0][x]);
                        } else {
                            colorCube = WorldWind.Color.colorFromBytes(col[0], col[1], col[2], col[3]);
                            info = time[allTime[l]][number][x];

                        }

                        coords = GlobeHelper.getCoords(result);
                        coords.altitude = this.startHeight + (l * this.heightCube);
                        coords.height = this.heightCube;
                        if (this.config[0].heightExtrusion) {
                            var num = time[allTime[l]][number][x][2].split(".").join("");
                            var max = this.myData[0].bounds1[0];
                            var min = this.myData[0].bounds1[1];
                            var val = ((num - min) / (max - min)) * 100;
                            coords.height = this.heightCube + val * this.heightCube / 10;
                        }
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
    GlobeInterface.prototype.assignCubes = function (rect, gridRenderables, layers) {
        for (var x in gridRenderables) {
            for (var y = 0; y < rect.length; y++) {
                for (var z in layers) {
                    if (layers[z].renderables[x]) {
                        if (rect[y].containsPoint(layers[z].renderables[x].point)) {
                            rect[y].cubes.push(layers[z].renderables[x]);
                        }
                    }
                }
            }
        }
    };
    GlobeInterface.prototype.getBigCubes = function (rect, z, color) {
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
    GlobeInterface.prototype.createJson = function (layer, url, raw, resolve) {
        var configuration = function (geometry, properties) {
            var configuration = {};
            if (geometry.isPolygonType() || geometry.isMultiPolygonType()) {
                configuration.attributes = new WorldWind.ShapeAttributes(null);
                configuration.attributes.id = properties.id;
                configuration.attributes.interiorColor = new WorldWind.Color(0.3, 0.3, 0.3, 0.5);
                configuration.attributes.outlineColor = new WorldWind.Color(1, 1, 1, 0.8);
            }
            return configuration;
        };
        var multiPolygonGeoJSON = new WorldWind.GeoJSONParser(url);
        multiPolygonGeoJSON.load(configuration, layer, raw, resolve);
       
    };
    GlobeInterface.prototype.createRect = function (division, gridLayer) {

        var x;
        var minLat = Infinity,
            minLng = Infinity,
            maxLat = -Infinity,
            maxLng = -Infinity;
        for (x in gridLayer.renderables) {
            var r = gridLayer.renderables[x];

            minLng = Math.min(minLng, r._boundaries[0].longitude);
            minLng = Math.min(minLng, r._boundaries[1].longitude);

            minLat = Math.min(minLat, r._boundaries[0].latitude);
            minLat = Math.min(minLat, r._boundaries[1].latitude);

            maxLng = Math.max(maxLng, r._boundaries[1].longitude);
            maxLng = Math.max(maxLng, r._boundaries[2].longitude);

            maxLat = Math.max(maxLat, r._boundaries[1].latitude);
            maxLat = Math.max(maxLat, r._boundaries[3].latitude);

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


        var dimX = (maxLat - minLat) / division;
        var dimY = (maxLng - minLng) / division;


        var block = 0;
        var blockLat = minLat;
        var blockLng = minLng;
        var rect = [];


        for (x = 0; x < division; x++) {

            for (var z = 0; z < division; z++) {

                rect[block] = new WorldWind.Rectangle(
                    blockLat,
                    blockLng,
                    dimX, dimY);
                rect[block].cubes = [];
                block++;
                blockLat = blockLat + dimX;
            }
            blockLng = blockLng + dimY;
            blockLat = minLat;
        }

        var movingTemplate = new WorldWind.Rectangle(
            minLat - 0.00001,
            minLng - 0.00001,
            dimX * division,
            dimY * division);


        return [movingTemplate, rect, dimX, dimY];
    };
    GlobeInterface.prototype.rectInit = function (resultRect) {
        this.movingTemplate = resultRect[0];
        this.rect = resultRect[1];
        this.dim.x = resultRect[2];
        this.dim.y = resultRect[3];
        this.assignCubes(resultRect[1], this.gridLayer.renderables, this.layers);
        this.UI.start();

    };

    /** Filters **/
    GlobeInterface.prototype.changeSize = function (size, dir) {

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
    GlobeInterface.prototype.changeAltitude = function (values) {

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
        this.globe.redraw();
    };
    GlobeInterface.prototype.setOpacity = function (value) {
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
    GlobeInterface.prototype.filterValues = function (values) {
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
    GlobeInterface.prototype.changeTime = function (val) {
        this.minTime = val;
        var x;

        for (var z in this.layers) {
            var thisLayer = this.layers[z];
            for (x in thisLayer.renderables) {
                var bottom = thisLayer.renderables[x].positions[0].altitude;
                var top = thisLayer.renderables[x].positions[7].altitude;
                var myRend = thisLayer.renderables[x];
                var positions = myRend.positions;
                for (var y in positions) {

                    var current = positions[y].altitude;
                    var height = top - bottom;

                    var additional = Number(this.startHeight + (height * Number(z)) - (val * height));

                    if (current == bottom) {
                        additional += 0;
                    } else {
                        additional += top - bottom;
                    }

                    positions[y].altitude = additional;

                }
                this.layers[z].renderables[x].reset();
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


        this.globe.redraw();
    };
    GlobeInterface.prototype.moveWindow = function (direction) {
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

    return GlobeInterface;
});