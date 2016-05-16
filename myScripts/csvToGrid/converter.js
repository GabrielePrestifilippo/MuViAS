var quad;
define(['myScripts/csvToGrid/CSVReader'
    ]
    , function (CSVReader) {

        var Converter = Converter || {};


        Converter.loadData = function (url, resolve) {
            CSVReader.getData(url, resolve);

        };

        Converter.initData = function (data, zone, config, number, source) {
            var allData = this.parseData(data, config, number);
            return allData;
        };
        Converter.initJson = function (allData, zone, source) {
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
            quad = new QuadTree(bounds, pointQuad, 10, 1);
            quad = this.insertData(quad, points);

            var geojson = this.getJson(quad, zone, source);
            return geojson
        };
        Converter.parseData = function (data, config, number) {
            var allTime = [];
            var time = {};
            var size = data.length;
            var positions = [];
            for (var x = 1; x < size; x++) {
                var tmp = data[x];

                if (allTime.indexOf(tmp[config.time]) == -1) {
                    allTime.push(tmp[config.time]);
                }


                if (!time[tmp[config.time]]) {
                    time[tmp[config.time]] = [];
                }
                if (!time[tmp[config.time]][number]) {
                    time[tmp[config.time]][number] = [];
                }

                var pos = [tmp[config.lat], tmp[config.lng]];

                var tempArray = [];
                var existPos = [];
                for (y in positions) {
                    if (JSON.stringify(positions[y]) == JSON.stringify(pos)) {
                        existPos = positions[y];
                        tempArray.push(Number(y));

                    }
                }
                if (existPos.length < 1) {
                    tempArray.push(Number(positions.length));
                    positions.push(pos);
                }


                for (var y in config.data) {
                    tempArray.push(tmp[config.data[y]]);
                }

                time[tmp[config.time]][number].push(tempArray);
            }
            var allData = {allTime, positions, time};
            return allData;

        };
        Converter.insertData = function (quad, points) {
            var x;
            for (x in points) {
                quad.insert({x: points[x][0], y: points[x][1]});
            }
            return quad;
        };
        Converter.getPoints = function (data, period, zone, source) {
            var points = {};
            source = source || "+proj=longlat +ellps=WGS84 +datum=WGS84 +no_defs";
            var utm = "+proj=utm +zone=" + zone;

            for (var x = 1; x < data.length; x++) {
                var lat = data[x][0];
                var lng = data[x][1];
                if (!period) {
                    lat = lat.replace(/\D/g, '').replace(/(\d{2})(\d*)/, '$1.$2');
                    lng = lng.replace(/\D/g, '').replace(/(\d{1})(\d*)/, '$1.$2');
                }
                lat = Number(lat);
                lng = Number(lng);
                points[x] = proj4(source, utm, [lng, lat]);
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
                boundChild.push(quad.root._bounds);
            }

            var utm = "+proj=utm +zone=" + zone;
            source = source || "+proj=longlat +ellps=WGS84 +datum=WGS84 +no_defs";

            for (var x = 0; x < boundChild.length; x++) {
                var f = this.newFeature();
                f.properties.id = x;
                geo.features.push(f);

                var b = boundChild[x];
                var rect = [];

                rect[0] = rect[4] = [b.x, b.y];
                rect[1] = [b.x + b.width, b.y];
                rect[2] = [b.x + b.width, b.y + b.height];
                rect[3] = [b.x, b.y + b.height];
                for (var y = 0; y < rect.length; y++) {
                    rect[y] = proj4(utm, source, rect[y]);
                    geo.features[x].geometry.coordinates[0].push([rect[y][0], rect[y][1]]);
                }
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
            } else {
                boundChild.push(root._bounds);
            }
            return boundChild;
        };
        Converter.getBounds = function (data) {
            var maxLat = -Infinity;
            var maxLng = -Infinity;
            var minLat = Infinity;
            var minLng = Infinity;
            for (var x = 0; x < data.length; x++) {
                var lat = data[x][0].replace(/\D/g, '').replace(/(\d{2})(\d*)/, '$1.$2');
                var lng = data[x][1].replace(/\D/g, '').replace(/(\d{1})(\d*)/, '$1.$2');
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

