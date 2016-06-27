var quad;
define(['myScripts/csvToGrid/CSVReader'
    ]
    , function (CSVReader) {

        var Converter = Converter || {};


        Converter.loadData = function (url, resolve, delimiter) {
            CSVReader.getData(url, resolve, delimiter);

        };

        Converter.filterData = function (data, config, addCsv) {

            var newData = [];
            if (addCsv) {
                var minLat = addCsv._bottom;
                var maxLat = addCsv._top;
                var minLng = addCsv._left;
                var maxLng = addCsv._right;
            }
            else {
                boundaries = this.getBounds(data, config);

                var minLat = boundaries[0];
                var maxLat = boundaries[2];
                var minLng = boundaries[1];
                var maxLng = boundaries[3];
            }

            data.forEach(function (dataX) {
                if (Number(dataX[config.lat]) <= maxLat && Number(dataX[config.lat]) >= minLat
                    && Number(dataX[config.lng]) >= minLng && Number(dataX[config.lng]) <= maxLng && newData.length < 50000) {
                    newData.push(dataX)
                }
            });


            return newData;

        };

        Converter.initData = function (data, zone, config, number, source) {
            var allData = this.parseData(data, config, number);
            return allData;
        };


        Converter.getDataBounds = function (result, config, n) {
            var max = -Infinity;
            var min = Infinity;
            var tmp;
            for (var x = 1; x < result.length; x++) {
                tmp = result[x];
                if (isNaN(tmp[config.data[0]]) && tmp[config.data[0]].indexOf(config.separator) !== -1) {
                    if (!isNaN(max) && !isNaN(min)) {
                        max = Math.max(max, Number(tmp[config.data[n]].split(config.separator).join("")));
                        min = Math.min(min, Number(tmp[config.data[n]].split(config.separator).join("")));
                    }
                } else {
                    if (!isNaN(max) && !isNaN(min)) {
                        max = Math.max(max, tmp[config.data[n]]);
                        min = Math.min(min, tmp[config.data[n]]);
                    }
                }
            }
            return [max, min];
        };
        Converter.initJson = function (allData, zone, quadSub, source) {
            var boundaries = this.getBounds(allData.positions);
            var boundaries = this.convertBounds(boundaries, zone, source);
            var points = this.getPoints(allData.positions, 0, zone, source);
            minPoint = boundaries[0];
            maxPoint = boundaries[1];
            sizeW = maxPoint[0] - minPoint[0];
            sizeH = maxPoint[1] - minPoint[1];

            var pointQuad = true;
            var bounds = {
                x: minPoint[0],
                y: minPoint[1],
                width: sizeW,
                height: sizeH
            };
            quad = new QuadTree(bounds, pointQuad, quadSub, 1);
            quad = this.insertData(quad, points);

            var geojson = this.getJson(quad, zone, source);
            return geojson
        };

        Converter.setGridtoData = function (gridLayer, times, config) {

            gridLayer = JSON.parse(gridLayer);
            for (var x in times) {
                for (var y = 0; y < times[x].length; y++) {

                    for (var z = 0; z < times[x][y].length; z++) {
                        for (var w = 0; w < gridLayer.features.length; w++) {
                            var ob = times[x][y][z];
                            var r = gridLayer.features[w];
                            var position = [r.properties.lat, r.properties.lng];
                            if (position[0] !== 0 && position[1] !== 0) {
                                timePoint = [Number(ob[config.data.length + 1][0]), Number(ob[config.data.length + 1][1])];

                                if (position[0] == timePoint[0] && position[1] == timePoint[1]) {
                                    ob[0] = r.properties.id
                                }
                            }

                        }
                    }
                }
            }

        };
        Converter.parseData = function (data, config, number) {
            var allTime = [];
            var times = {};
            var size = data.length;
            var positions = [];
            for (var x = 0; x < size; x++) {
                var tmp = data[x];

                if (allTime.indexOf(tmp[config.time]) == -1) {
                    allTime.push(tmp[config.time]);
                }

                if (!times[tmp[config.time]]) {
                    times[tmp[config.time]] = [];
                }
                if (!times[tmp[config.time]][number]) {
                    times[tmp[config.time]][number] = [];
                }

                var pos = [tmp[config.lat], tmp[config.lng]];

                var tempArray = [];
                var existPos = [];


                if (existPos.length < 1) {
                    tempArray.push(-1);
                    positions.push(pos);
                }


                for (var y in config.data) {
                    tempArray.push(tmp[config.data[y]]);
                }
                tempArray.push(pos);
                times[tmp[config.time]][number].push(tempArray);
            }
            var allData = {allTime, positions, times};
            return allData;

        };
        Converter.insertData = function (quad, points) {
            var x, i;

            var newP = {};
            for (i = 0, n = points.length; i < n; i++) {
                var item = points[i];
                newP[item[0] + " - " + item[1]] = item;
            }
            var i = 0;
            var nonDuplicatedArray = [];
            for (var item in newP) {
                nonDuplicatedArray[i++] = newP[item];
            }

            for (x in newP) {
                quad.insert({
                    x: newP[x][0],
                    y: newP[x][1],
                    width: 10,
                    height: 10,
                    coords: [newP[x].coord[0], newP[x].coord[1]]
                });
            }
            return quad;
        };
        Converter.getPoints = function (data, period, zone, source) {
            var points = [];
            source = source || "+proj=longlat +ellps=WGS84 +datum=WGS84 +no_defs";
            var utm = "+proj=utm +zone=" + zone;

            for (var x = 0; x < data.length; x++) {
                var lat = data[x][0];
                var lng = data[x][1];
                if (!period) {
                    lat = lat;
                    lng = lng;
                }
                lat = Number(lat);
                lng = Number(lng);
                points[x] = proj4(source, utm, [lng, lat]);
                points[x].coord = [lat, lng];
            }
            return points;
        };
        Converter.convertBounds = function (bounds, zone, source) {

            var utm = "+proj=utm +zone=" + zone;
            source = source || "+proj=longlat +ellps=WGS84 +datum=WGS84 +no_defs";

            minLat = bounds[0];
            minLng = bounds[1];
            maxLat = bounds[2];
            maxLng = bounds[3];

            minPoint = proj4(source, utm, [minLng, minLat]);
            maxPoint = proj4(source, utm, [maxLng, maxLat]);
            maxLat32 = proj4(source, utm, maxLat);
            maxLng32 = proj4(source, utm, maxLng);

            return ([minPoint, maxPoint]);
        };
        Converter.getJson = function (quad, zone, source) {

            var geo = {
                "type": "FeatureCollection",
                "features": []
            };
            var boundChild = [];

            if (quad.root.children.length == 0 && quad.root.nodes.length > 0) {
                boundChild = this.explore(quad.root, boundChild);
            }
            else {
                boundChild.push([quad.root._bounds, [0, 0]]);
            }

            var utm = "+proj=utm +zone=" + zone;
            source = source || "+proj=longlat +ellps=WGS84 +datum=WGS84 +no_defs";
            var countFeature = 0;
            for (var x = 0; x < boundChild.length; x++) {
                //  if (boundChild[x][1][0] !== 0 && boundChild[x][1][1] !== 0) {

                var f = this.newFeature();
                f.properties.id = x;
                f.properties.lat = boundChild[x][1][0];
                f.properties.lng = boundChild[x][1][1];
                geo.features.push(f);

                var b = boundChild[x][0];
                var rect = [];

                rect[0] = rect[4] = [b.x, b.y];
                rect[1] = [b.x + b.width, b.y];
                rect[2] = [b.x + b.width, b.y + b.height];
                rect[3] = [b.x, b.y + b.height];
                for (var y = 0; y < rect.length; y++) {
                    rect[y] = proj4(utm, source, rect[y]);
                    geo.features[countFeature].geometry.coordinates[0].push([rect[y][0], rect[y][1]]);
                }
                countFeature++;
                //  }
            }
            return geo;
        };
        Converter.newFeature = function () {
            return {
                "type": "Feature",
                "properties": {
                    "id": "gridBound"
                },
                "geometry": {
                    "type": "Polygon",
                    "coordinates": [
                        []
                    ]
                }
            };
        };
        Converter.explore = function (root, boundChild) {

            if (root.children.length == 0 && root.nodes.length > 0) {
                for (var x = 0; x < root.nodes.length; x++) {
                    boundChild = this.explore(root.nodes[x], boundChild);
                }
            } else if (root.children.length == 0) {
                boundChild.push([root._bounds, [0, 0]]);
            } else {
                boundChild.push([root._bounds, root.children[0].coords]);
            }
            return boundChild;
        };
        Converter.getBounds = function (data, config) {
            var maxLat = -Infinity;
            var maxLng = -Infinity;
            var minLat = Infinity;
            var minLng = Infinity;
            for (var x = 0; x < data.length; x++) {
                if(config){
                    var lat = data[x][config.lat];
                    var lng = data[x][config.lng];
                }else {
                    var lat = data[x][0];
                    var lng = data[x][1];
                }
                lat = Number(lat);
                lng = Number(lng);
                if (lat && lng) {
                    minLat = Math.min(minLat, lat);
                    minLng = Math.min(minLng, lng);
                    maxLat = Math.max(maxLat, lat);
                    maxLng = Math.max(maxLng, lng);
                }
            }
            return [minLat, minLng, maxLat, maxLng];
        };


        return Converter;
    }
)
;

