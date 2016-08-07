var quad;
define(['myScripts/csvToGrid/CSVReader'
    ]
    , function (CSVReader) {

        var Converter = Converter || {};

        /**
         *  Load the data using the CSV reader
         * @param url: url to load the data
         * @param resolve: fucntion to execute when finished
         * @param delimiter: delimiter for the CSV file
         */
        Converter.loadData = function (url, resolve, delimiter) {
            CSVReader.getData(url, resolve, delimiter);
        };

        /**
         * Filter the data, setting a bounding box or a limit of entries
         * @param data: the input data to filter
         * @param config: the configuration file, specifying the structure of the data
         * @param addCsv: specifies if we are adding data while moving on the globe
         * @returns {Array}
         */
        Converter.filterData = function (data, config, addCsv, maxTile) {

            if (!maxTile) {
                maxTile = 40000;
            }
            var newData = [];

            var minLat = addCsv._bottom;
            var maxLat = addCsv._top;
            var minLng = addCsv._left;
            var maxLng = addCsv._right;


            data.forEach(function (dataX) {
                if (Number(dataX[config.lat]) <= maxLat && Number(dataX[config.lat]) >= minLat
                    && Number(dataX[config.lng]) >= minLng && Number(dataX[config.lng]) <= maxLng && newData.length < maxTile) {
                    newData.push(dataX)
                }
            });


            return newData;

        };

        /**
         * Initialize the data, parsing them from the file structure
         * @param data: the input data
         * @param config: configuration file for parsing, it contains the structure of the data
         * @param number: specifies which variable are we parsing (if we have more than one)
         */
        Converter.initData = function (data, config, number) {
            var allData = this.parseData(data, config, number);
            return allData;
        };

        /**
         * Get the bounds of the values from the data
         * @param data: the input data in which we look for the bounds
         * @param config: configuration file for parsing, it contains the structure of the data
         * @param number: specifies the variable used to get the bounds
         * @returns {*[]}: array containing the minimum and maximum
         */
        Converter.getDataBounds = function (data, config, number) {
            var max = -Infinity;
            var min = Infinity;
            var tmp;
            for (var x = 1; x < data.length; x++) {
                tmp = data[x];
                if (isNaN(tmp[config.data[0]]) && tmp[config.data[0]].indexOf(config.separator) !== -1) {
                    if (!isNaN(max) && !isNaN(min)) {
                        max = Math.max(max, Number(tmp[config.data[number]].split(config.separator).join("")));
                        min = Math.min(min, Number(tmp[config.data[number]].split(config.separator).join("")));
                    }
                } else {
                    if (!isNaN(max) && !isNaN(min)) {
                        max = Math.max(max, tmp[config.data[number]]);
                        min = Math.min(min, tmp[config.data[number]]);
                    }
                }
            }
            return [max, min];
        };

        /**
         * Initialize the JSON file, setting the time zone,  getting the bounds
         * and creating a QuadTree
         * @param allData: the input data
         * @param zone: the time zone (if available)
         * @param maximumQuadSubdivisions: maximum number of Quadtree subdivisions
         * @param source: optional parameter representing the projection source
         */
        Converter.initJson = function (allData, zone, maximumQuadSubdivisions, source) {
            var pos = Math.floor(allData.positions.length / 2);
            var lon = Number(allData.positions[pos][1]);
            var lat = Number(allData.positions[pos][0]);
            zone = Math.floor((lon + 180) / 6) + 1;

            if (lat >= 56.0 && lat < 64.0 && lon >= 3.0 && lon < 12.0) {
                zone = 32;
            }

            if (lat >= 72.0 && lat < 84.0) {
                if (lon >= 0.0 && lon < 9.0) {
                    zone = 31;
                }
                else if (lon >= 9.0 && lon < 21.0) {
                    zone = 33;
                }
                else if (lon >= 21.0 && lon < 33.0) {
                    zone = 35;
                }
                else if (lon >= 33.0 && lon < 42.0) {
                    zone = 37;
                }
            }

            var boundaries = this.getCoordinatesBoundaries(allData.positions);
            var boundaries = this.convertBounds(boundaries, zone, source);
            var points = this.getPoints(allData.positions, zone, source);
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
            quad = new QuadTree(bounds, pointQuad, maximumQuadSubdivisions, 1);
            quad = this.insertData(quad, points);

            var geojson = this.getJson(quad, zone, source);
            return geojson
        };

        /**
         * Links the grid layer to the point data
         * @param gridLayer: grid layer in input
         * @param times: all the data sorted by time
         * @param config: configuration file, specifying the structure of the data
         */
        Converter.setGridtoData = function (gridLayer, times, config) {
            gridLayer = JSON.parse(gridLayer);
            for (var x in times) {
                var timesLength=times[x].length;
                for (var y = 0; y <timesLength ; y++) {
                    var timesXYlength=times[x][y].length;
                    for (var z = 0; z < timesXYlength; z++) {
                        var gridLength=gridLayer.features.length;
                        for (var w = 0; w < gridLength; w++) {
                            var ob = times[x][y][z];
                            var r = gridLayer.features[w];
                            var position = [r.properties.lat, r.properties.lng];
                            if (position[0] !== 0 && position[1] !== 0) {
                                var timePoint = [Number(ob[config.data.length + 1][0]), Number(ob[config.data.length + 1][1])];

                                if (position[0] == timePoint[0] && position[1] == timePoint[1]) {
                                    ob[0] = r.properties.id;
                                }
                            }
                        }
                    }
                }
            }
            return times;
        };

        /**
         * Parse the data from the file structure to a common format for the application
         * @param data: the inut data coming from the file
         * @param config: the configuration containing the structure of the data
         * @param number: the variable we want to parse
         * @returns {{allTime: Array, positions: Array, times: {}}}: An array containing:
         * the list of all the time steps available, the positions of the point data and the data sorted by time
         */
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

        /**
         * Insert the data in the QuadTree
         * @param quad: the quadtree in which we insert the data
         * @param points: the points to insert
         * @returns {*}: retrn the quadtree with the inserted data
         */
        Converter.insertData = function (quad, points) {
            var x, i;

            var newP = {};
            for (i = 0, n = points.length; i < n; i++) {
                var item = points[i];
                if(item[0]!=0){
                    newP[item[0] + " - " + item[1]] = item;
                }
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

        /**
         * Convert the points to UTM to be inserted in the quadtree
         * @param data: the input data to insert
         * @param zone: the zone to use for the conversion of the data into UTM
         * @param source: the source projection
         * @returns {Array}
         */
        Converter.getPoints = function (data, zone, source) {
            var points = [];
            source = source || "+proj=longlat +ellps=WGS84 +datum=WGS84 +no_defs";
            var utm = "+proj=utm +zone=" + zone;

            for (var x = 0; x < data.length; x++) {
                var lat = data[x][0];
                var lng = data[x][1];
                lat = Number(lat);
                lng = Number(lng);
                //points[x] = proj4(source, utm, [lng, lat]);
                points[x] = [lng, lat];
                points[x].coord = [lat, lng];
            }
            return points;
        };

        /**
         * Convert the bounds to UTM
         * @param bounds: the bounds to convert
         * @param zone: the zone for UTM conversion
         * @param source: the source projection
         * @returns {*[]}: return the converted bounds
         */
        Converter.convertBounds = function (bounds, zone, source) {

            var utm = "+proj=utm +zone=" + zone;
            source = source || "+proj=longlat +ellps=WGS84 +datum=WGS84 +no_defs";

            var minLat = bounds[0];
            var minLng = bounds[1];
            var maxLat = bounds[2];
            var maxLng = bounds[3];

            //var minPoint = proj4(source, utm, [minLng, minLat]);
            //var maxPoint = proj4(source, utm, [maxLng, maxLat]);
            //
            var minPoint = [minLng, minLat];
            var maxPoint = [maxLng, maxLat];
            return ([minPoint, maxPoint]);
        };

        /**
         * Create a GeoJSON object and insert all the features
         * @param quad: the quadtree to use for the feature
         * @param zone: the zone for the UTM conversion
         * @param source: the source projection
         * @returns {{type: string, features: Array}}: return the GeoJSON object
         */
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
                   // rect[y] = proj4(utm, source, rect[y]);
                    geo.features[countFeature].geometry.coordinates[0].push([rect[y][0], rect[y][1]]);
                }
                countFeature++;
            }
            return geo;
        };

        /**
         * Return a new empty feature for the GeoJSON object
         * @returns {{type: string, properties: {id: string}, geometry: {type: string, coordinates: *[]}}}
         */
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

        /**
         * Explore the QuadTree until it finds a branch without nodes
         * @param root: the root of the quadtree to explore (could be a sub-branch)
         * @param boundChild, the child to explore
         * @returns {*} returns a child with elements inside
         */
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

        /**
         * Get the coordinates boundaries from the data
         * @param data: input data from which we want the boundaries
         * @param config: configuration specifying the structure of the data
         * @returns {*[]}: returns an array with the bounding box of the data
         */
        Converter.getCoordinatesBoundaries = function (data, config) {
            var maxLat = -Infinity;
            var maxLng = -Infinity;
            var minLat = Infinity;
            var minLng = Infinity;
            for (var x = 0; x < data.length; x++) {
                if (config) {
                    var lat = data[x][config.lat];
                    var lng = data[x][config.lng];
                } else {
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

