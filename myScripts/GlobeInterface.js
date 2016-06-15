define([
        'myScripts/Voxel',
        'myScripts/GlobeHelper',
        'src/WorldWind',
        'myScripts/Layer',
        'myScripts/LayerGroup'

    ], function (Cube,
                 GlobeHelper,
                 WorldWind,
                 Layer,
                 LayerGroup) {

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


            this.smallVoxels = new LayerGroup();
            this.bigVoxels = new LayerGroup();

            this.dim = {};
            this.rect = [];
            this.minTime = 0;
            this.activeLayers = 0;
            this.compare = 0;


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
        GlobeInterface.prototype.dataParser = function (content, allTime, times, config, number) {
            var size = content.length;


            for (var x = 0; x < size; x++) {
                var tmp = content[x];

                var tmpTime = GlobeHelper.toTime(tmp[config.time]);

                if (allTime.indexOf(tmpTime) == -1) {
                    if (allTime.length >= this.maxInApp) {
                        break;
                    } else {
                        allTime.push(tmpTime);
                    }
                }
                if (!times[tmpTime]) {
                    times[tmpTime] = [];
                }
                if (!times[tmpTime][number]) {
                    times[tmpTime][number] = [];
                }


                var tempArray = [tmp[config.id]];

                for (var y in config.data) {
                    tempArray.push(tmp[config.data[y]]);
                }

                times[tmpTime][number].push(tempArray);
            }

            return {allTime, times};
        };
        GlobeInterface.prototype.sliceTime = function (allTime, times) {
            for (var y in times) {
                if (times[y].length < 2) {
                    delete times[y];
                }
            }


            for (var y in allTime) {
                if (!times[allTime[y]]) {
                    allTime.splice(y);
                }
            }
            return [allTime, times];

        };
        GlobeInterface.prototype.doxelFromData = function (allTime, times, config) {
            this.dataLoaded++;
            if (this.config[1]) {
                gInterface.maxShown = 1;
                var reference = this.config[1].reference;
                if (this.dataLoaded == 2) {
                    this.makeSmallLayers(allTime, times);
                    this.makeSmallDoxels(allTime, times, config, reference);
                    this.UI.disableNewData();
                    this.UI.start();
                    var resultRect = this.createRect(this.sub, this.gridLayer);
                    this.movingTemplate = resultRect[0];
                    this.rect = resultRect[1];
                    this.dim.x = resultRect[2];
                    this.dim.y = resultRect[3];
                    this.assignCubes(resultRect[1], this.gridLayer.renderables, this.smallVoxels.layers);
                }
            } else {
                this.makeSmallLayers(allTime, times);
                this.makeSmallDoxels(allTime, times, config, 0);
            }

        };
        GlobeInterface.prototype.loadGrid = function (gridUrl, raw, resolve) {
            var gridLayer = new WorldWind.RenderableLayer("GridLayer");
            this.createJson(gridLayer, gridUrl, raw, resolve);
            this.globe.addLayer(gridLayer);
            return gridLayer;
        };
        GlobeInterface.prototype.makeBigDoxels = function () {
            var bigVoxels = new LayerGroup();
            var heightDim = this.heightDim;
            var compare = this.compare;
            var x, y;
            var layers = this.smallVoxels.layers;

            layers.forEach(function (layer) {
                layer.renderables.forEach(function (renderable) {
                    renderable.enabled = false;
                    renderable.bigCubed = true;
                });
            });

            if (heightDim > this.maxShown) {
                heightDim = this.maxShown;
            }
            var z = {
                altitude: this.startHeight,
                height: this.activeLayers * this.heightCube / heightDim
            };
            for (x = 0; x < heightDim; x++) {
                if (this.bigVoxels && this.bigVoxels.layers[x]) {
                    this.globe.removeLayer(this.bigVoxels.layers[x]);
                }


                bigVoxels.pushLayer("bigVoxels_" + x);
                this.globe.addLayer(bigVoxels.layers[x]);
                var rect = this.rect;
                for (y = 0; y < rect.length; y++) {
                    var rectangle = rect[y];
                    var height = x + this.minTime;
                    var stat = GlobeHelper.getStatistics(rectangle, height, this.myData[compare], this.statIndex, this.colors, this.config, this.compare);
                    var col = WorldWind.Color.colorFromBytes(stat[0][0], stat[0][1], stat[0][2], stat[0][3]);
                    var bigCube = this.getBigVoxels(rectangle, z, col);
                    bigCube.data = stat[1];
                    bigCube.showAlt = true;
                    bigCube.bigShow = true;
                    bigVoxels.layers[x].addRenderable(bigCube);
                }
                z.altitude = z.altitude + z.height;
            }

            this.bigVoxels = bigVoxels;

        };
        GlobeInterface.prototype.makeSmallLayers = function (allTime, times) {

            this.activeLayers = 0;
            var smallVoxels = this.smallVoxels;


            var allowedTime = [];
            var timeSize = allTime.length;
            for (var l = 0; l < timeSize; l++) {

                if (allowedTime.indexOf(l) == -1) {
                    allowedTime.push(l);
                } else {
                    break;
                }

                if (this.config[1] && (!times[allTime[l]][0] || !times[allTime[l]][1])) {
                    break;
                }

                smallVoxels.addLayer(l, l);

                smallVoxels.layers[l].enabled = true;


                smallVoxels.layers[l].active = true;

                this.activeLayers++;

                if (l >= this.maxShown) {
                    smallVoxels.layers[l].enabled = false;
                    smallVoxels.layers[l].active = false;
                    this.activeLayers--;
                }

                smallVoxels.layers[l].heightLayer = l;

                this.globe.addLayer(smallVoxels.layers[l]);


            }
        };
        GlobeInterface.prototype.makeSmallDoxels = function (allTime, times, config, number) {
            var self = this;
            var timeSize = allTime.length;
            for (var l = 0; l < timeSize; l++) {
                var cubes = [];
                var colorCube;
                var colors;
                var num;
                var coords;
                var id;
                var info;
                var data, data1;
                var thisTime = times[allTime[l]][number];

                var length = thisTime.length;
                if (config[1]) {
                    length = Math.min(times[allTime[l]][0].length, times[allTime[l]][1].length);
                }
                //make all the cubes and put in cube array
                // for (var x = 0; x < length; x++) {
                for (var y = 0; y < self.gridLayer.renderables.length; y++) {
                    if (config[1] && !times[allTime[l]][1][y]) {
                        break;
                    }
                    var result;
                    var renderables = self.gridLayer.renderables;

                    var ref = renderables[y].attributes.id;

                    for (var x = 0; x < length - 1; x++) {
                        var xTime = thisTime[x][0];

                        if (ref == xTime) {
                            result = renderables[y];


                            if (result && result._boundaries) {
                                if (config[1]) {
                                    colorCube = [];
                                    info = [];
                                }


                                if (times[allTime[l]][1]) {
                                    num = times[allTime[l]][1][x][1].split(".").join("");
                                    var max1 = this.myData[1].bounds[0];
                                    var min1 = this.myData[1].bounds[1];
                                    colors = this.colors;
                                    var col1 = GlobeHelper.getColor(((num - min1) / (max1 - min1)) * 100, colors);
                                    colorCube.push("rgb(" + col1[0] + "," + col1[1] + "," + col1[2] + ")");
                                    info.push(times[allTime[l]][1][x]);
                                    data1 = num;
                                }
                                if (config[0].separator) {
                                    num = times[allTime[l]][number][x][1].split(config[0].separator).join("");
                                } else {
                                    num = times[allTime[l]][number][x][1];
                                }
                                data = num;
                                var max = this.myData[0].bounds[0];
                                var min = this.myData[0].bounds[1];
                                colors = this.colors;
                                var col = GlobeHelper.getColor(((num - min) / (max - min)) * 100, colors);

                                if (config[1]) {
                                    colorCube.push("rgb(" + col[0] + "," + col[1] + "," + col[2] + ")");
                                    info.push(times[allTime[l]][0][x]);
                                } else {
                                    colorCube = WorldWind.Color.colorFromBytes(col[0], col[1], col[2], col[3]);
                                    info = times[allTime[l]][number][x];

                                }

                                coords = GlobeHelper.getCoords(result);
                                coords.altitude = this.startHeight + (l * this.heightCube);
                                coords.height = this.heightCube;

                                if (config[0].heightExtrusion) {
                                    var num;
                                    if (config[0].separator) {
                                        num = times[allTime[l]][number][x][2].split(config[0].separator).join("");
                                    } else {
                                        num = times[allTime[l]][number][x][2];
                                    }

                                    var max = this.myData[0].bounds1[0];
                                    var min = this.myData[0].bounds1[1];
                                    var val = ((num - min) / (max - min)) * 100;
                                    coords.height = this.heightCube + val * this.heightCube / 10;
                                }
                                id = result.attributes.id;

                                var cube = new Cube(coords, colorCube);

                                cube.enabled = true;
                                cube.info = info;
                                cube.heightLayer = l;
                                cube.data = [];
                                cube.data.push(data);
                                if (config[1]) {
                                    cube.data.push(data1);
                                }
                                cube.filtered = false;
                                cube.latlongfilter = false;
                                cube.id = id;
                                cubes.push(cube);
                            }
                        }
                    }
                }
                this.smallVoxels.layers[l].addRenderables(cubes);


            }

        };
        GlobeInterface.prototype.assignCubes = function (rect, gridRenderables, layers) {
            for (var x in gridRenderables) {
                for (var y = 0; y < rect.length; y++) {
                    layers.forEach(function (layer) {
                        if (layer.renderables[x]) {
                            if (rect[y].containsPoint(layer.renderables[x].point)) {
                                rect[y].cubes.push(layer.renderables[x]);
                            }
                        }
                    });
                }
            }
        };
        GlobeInterface.prototype.getBigVoxels = function (rect, z, color) {
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
            gridLayer.renderables.forEach(function (r) {

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

            });

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
            this.assignCubes(resultRect[1], this.gridLayer.renderables, this.smallVoxels.layers);
            this.UI.start();

        };

        /** Filters **/
        GlobeInterface.prototype.changeSize = function (size, dir) {
            var lengthTemp;
            var dim = this.dim;
            var movingTemplate = this.movingTemplate;
            var sub = this.sub;
            var gridLayer = this.gridLayer;

            if (dir) {
                movingTemplate.y = gridLayer.bounds.minLng + size[0];
                lengthTemp = (dim.y * sub) - size[0];
                movingTemplate.height = lengthTemp;
                movingTemplate.height = lengthTemp - (dim.y * sub - size[1]);
            } else {
                movingTemplate.x = gridLayer.bounds.minLat + size[0];
                lengthTemp = (dim.x * sub) - size[0];
                movingTemplate.width = lengthTemp;
                movingTemplate.width = lengthTemp - (dim.x * sub - size[1]);
            }
        };
        GlobeInterface.prototype.changeAltitude = function (values) {

            this.smallVoxels.setAll.call(this.smallVoxels, {"enabled": false});
            this.bigVoxels.setAllRend.call(this.bigVoxels, {"enabled": false, "showAlt": false});

            var norm = [Math.floor((this.heightDim * values[0]) / this.activeLayers), Math.floor((this.heightDim * values[1]) / this.activeLayers)];

            var bigCubes = this.bigVoxels.layers;
            var n;
            for (n = norm[0]; n < norm[1]; n++) {
                if (bigCubes[n]) {
                    bigCubes[n].renderables.forEach(function (renderable) {
                        if (renderable.active) {
                            if (renderable.bigShow) {
                                renderable.enabled = true;
                            }
                            renderable.showAlt = true;
                        } else {
                            renderable.showAlt = false;
                        }
                    });
                }
            }
            var layers = this.smallVoxels.layers;
            for (n = values[0] + this.minTime; n < values[1] + this.minTime; n++) {
                if (layers[n].active) {
                    layers[n].enabled = true;
                }
            }
            this.globe.redraw();
        };
        GlobeInterface.prototype.setOpacity = function (value) {
            this.smallVoxels.setAllRend.call(this.smallVoxels, {"_attributes.interiorColor.alpha": value});
            this.bigVoxels.setAllRend.call(this.bigVoxels, {"_attributes.interiorColor.alpha": value});
        };
        GlobeInterface.prototype.filterValues = function (values) {
            var compare = this.compare;
            var layers = this.smallVoxels.layers;
            layers.forEach(function (layer) {
                layer.renderables.forEach(function (renderable) {
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
                });
            });
        };
        GlobeInterface.prototype.changeTime = function (val) {
            this.minTime = val;
            var x;
            var h = this.startHeight;
            layers = this.smallVoxels.layers;
            layers.forEach(function (layer, i) {

                layer.renderables.forEach(function (rend, j) {
                    var bottom = rend.positions[0].altitude;
                    var top = rend.positions[7].altitude;

                    var positions = rend.positions;
                    positions.forEach(function (p) {
                        var current = p.altitude;
                        var height = top - bottom;
                        var additional = Number(h + (height * Number(i)) - (val * height));
                        if (current == bottom) {
                            additional += 0;
                        } else {
                            additional += top - bottom;
                        }
                        p.altitude = additional;
                    });
                    layer.renderables[j].reset();
                });
            });


            layers.forEach(function (layer) {
                layer.enabled = false;
                layer.active = false;
            });
            for (x = val; x <= (this.activeLayers - 1) + val; x++) {
                layers[x].enabled = true;
                layers[x].active = true;
            }
            this.globe.redraw();
        };
        GlobeInterface.prototype.moveWindow = function (direction) {
            var rects = this.rect;
            var layers = this.smallVoxels.layers;
            var bigCubes = this.bigVoxels.layers;
            var movingTemplate = this.movingTemplate;
            if (direction) {
                layers.forEach(function (layer) {
                    layer.renderables.forEach(function (renderable) {
                        if (movingTemplate.containsPoint(renderable.point) && renderable.enabled === false) {
                            rects.forEach(function (rect, i) {
                                if (renderable) {
                                    if (rect.cubes.indexOf(renderable) !== -1) {
                                        if (movingTemplate.intersects(rect)) {
                                            if (bigCubes.length > 0) {
                                                bigCubes.forEach(function (bigCube) {
                                                    if (bigCube.renderables[i].active) {
                                                        if (bigCube.renderables[i].showAlt) {
                                                            bigCube.renderables[i].enabled = true;
                                                            bigCube.renderables[i].bigShow = true;
                                                        }
                                                    } else {
                                                        renderable.latlongfilter = false;
                                                        if (!renderable.filtered) {
                                                            renderable.enabled = true;
                                                        }
                                                    }
                                                });
                                            } else {
                                                renderable.latlongfilter = false;
                                                if (!renderable.filtered) {
                                                    renderable.enabled = true;
                                                }
                                            }
                                        }
                                    }
                                }
                            });
                        }
                    });
                });
            } else {
                layers.forEach(function (layer) {
                    layer.renderables.forEach(function (renderable) {
                        if (!movingTemplate.containsPoint(renderable.point)) {
                            rects.forEach(function (rect, i) {
                                if (renderable) {
                                    if (rect.cubes.indexOf(renderable) !== -1) {
                                        if (bigCubes.length > 0) {
                                            bigCubes.forEach(function (bigCube) {
                                                if (bigCube.renderables[i].active) {
                                                    bigCube.renderables[i].enabled = false;
                                                    bigCube.renderables[i].bigShow = false;
                                                } else {
                                                    renderable.enabled = false;
                                                    renderable.latlongfilter = true;
                                                }
                                            });
                                        } else {
                                            renderable.enabled = false;
                                            renderable.latlongfilter = true;

                                        }
                                    }
                                }
                            });
                        }
                    });
                });
            }
        };

        return GlobeInterface;
    }
)
;