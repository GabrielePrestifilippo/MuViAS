define(['./supercluster.min', '../../worldwind/WorldWind'], function (supercluster, wwe) {

    /**
     * MarkerCLuster constructor
     * @param globe: The worldwind globe where to insert the cluster
     * @param options: options to customize the creation of the cluster
     * @constructor
     */
    var MarkerCluster = function (globe, options) {

        if (!options) {
            options = {
                maxLevel: 9,
                smooth: false,
                name: "MarkerCluster",
                maxCount: 3000,
                clusterSources: null,
                attributeColor: null,
            }
        }

        this.options = options;

        this.placemarks = [];
        var name = options.name || "MarkerCluster";
        this.layer = new WorldWind.RenderableLayer(name);
        this.displayName = name;
        this.globe = globe;
        this.controlLayer = options.controls;
        this.navigator = options.navigator;
        this.zoomLevel = 0;
        this.maxCount = options.maxCount || 1000;
        this.smooth = options.smooth || false;
        this.zoomLevels = options.maxLevel || 9;
        this.levels = [];
        this.maxReached = this.zoomLevels;
        this.minReached = 0;
        this.createZoomClusters(this.zoomLevels);
        if (globe) {
            globe.addLayer(this.layer);
            if (globe.controller || globe.navigator) {
                this.bindNavigator(globe.controller);
            }
        }

    };

    /**
     * Turn off the layer containing the markerCluster
     */
    MarkerCluster.prototype.off = function () {
        this.layer.enabled = false;
    };

    /**
     * Turn off the layer containing the markerCluster
     */
    MarkerCluster.prototype.on = function () {
        this.layer.enabled = true;
    };

    /**
     * Attach navigation function to markerCluster
     */
    MarkerCluster.prototype.bindNavigator = function (controller) {

        var navigator = controller || this.globe.navigator;
        var LookAtNavigator = controller || WorldWind.LookAtNavigator;
        var self = this;


        if (!navigator.clusters) {
            navigator.clusters = {};
        }
        navigator.clusters[self.options.name] = self;

        navigator.handleWheelEvent = function (event) {
            if (LookAtNavigator.prototype)
                LookAtNavigator.prototype.handleWheelEvent.apply(this, arguments);
            else
                LookAtNavigator.__proto__.handleWheelEvent.apply(this, arguments);
            var range;
            if (this.lookAt && this.lookAt.range)
                range = this.lookAt.range
            else
                range = this.range;


            if (self.options.smooth) {
                self.globe.goToAnimator.travelTime = 600;
                if (!this.busy) {
                    var normalizedDelta;
                    if (event.deltaMode == WheelEvent.DOM_DELTA_PIXEL) {
                        normalizedDelta = event.deltaY;
                    } else if (event.deltaMode == WheelEvent.DOM_DELTA_LINE) {
                        normalizedDelta = event.deltaY * 40;
                    } else if (event.deltaMode == WheelEvent.DOM_DELTA_PAGE) {
                        normalizedDelta = event.deltaY * 400;
                    }
                    normalizedDelta *= 5;
                    var scale = 1 + (normalizedDelta / 1000);
                    var nav = this;

                    var lat = this.lookAtLocation.latitude;
                    var lng = this.lookAtLocation.longitude;
                    var alt = range * scale;
                    var newPosition = new WorldWind.Position(lat, lng, alt);
                    nav.busy = true;
                    this.worldWindow.goTo(newPosition, function () {
                        setTimeout(function () {
                            nav.busy = false;
                        }, 300)

                    });
                    this.applyLimits();
                    this.worldWindow.redraw();
                }
            }

            for (var key in navigator.clusters) {
                navigator.clusters[key].handleClusterZoom(range)
            }

        };

        navigator.handlePanOrDrag = function (event) {
            if (LookAtNavigator.prototype)
                LookAtNavigator.prototype.handlePanOrDrag.apply(this, arguments);
            else
                LookAtNavigator.__proto__.handlePanOrDrag.apply(this, arguments);
            if (event.state == "ended") {//or changed
                var range;
                if (this.lookAt && this.lookAt.range)
                    range = this.lookAt.range
                else
                    range = this.range;
                for (var key in navigator.clusters) {
                    navigator.clusters[key].handleClusterZoom(range, true)
                }
            }
        };

        if (this.controlLayer) {
            if (!this.controlLayer.clusters) {
                this.controlLayer.clusters = {};
            }
            this.controlLayer.clusters[self.options.name] = self;

            this.controlLayer.handleZoomIn = function (e, control) {
                self.controlLayer.__proto__.handleZoomIn.apply(this, arguments);
                if (e.type == "mousedown") {
                    var range;
                    if (this.wwd.navigator.lookAt && this.wwd.navigator.lookAt.range)
                        range = this.wwd.navigator.lookAt.range
                    else
                        range = this.wwd.navigator.range;

                    for (var key in this.clusters) {
                        this.clusters[key].handleClusterZoom(range)
                    }
                }
            }
            this.controlLayer.handleZoomOut = function (e, control) {
                self.controlLayer.__proto__.handleZoomOut.apply(this, arguments);
                if (e.type == "mousedown") {
                    var range;
                    if (this.wwd.navigator.lookAt && this.wwd.navigator.lookAt.range)
                        range = this.wwd.navigator.lookAt.range
                    else
                        range = this.wwd.navigator.range;

                    for (var key in this.clusters) {
                        this.clusters[key].handleClusterZoom(range)
                    }
                }
            }

            this.controlLayer.handlePan = function (e, control) {
                self.controlLayer.__proto__.handlePan.apply(this, arguments);
                if (e.type == "mousedown") {
                    var range;
                    if (this.wwd.navigator.lookAt && this.wwd.navigator.lookAt.range)
                        range = this.wwd.navigator.lookAt.range
                    else
                        range = this.wwd.navigator.range;

                    for (var key in this.clusters) {
                        this.clusters[key].handleClusterZoom(range, true)
                    }
                }

            }
        }
    };

    /**
     * Manage the clusters to show and hide based on the range
     * @param range the range of the navigator (distance from camera to terrain)
     * @param pan: Boolean. If the action is a pan or drag
     */
    MarkerCluster.prototype.handleClusterZoom = function (range, pan) {
        var self = this;
        var ranges = [100000000, 5294648, 4099739, 2032591, 1650505, 800762, 500000, 100000, 7000];

        var res;
        if (range >= ranges[0]) {
            res = 1;
        } else if (range <= ranges[ranges.length - 1]) {
            res = ranges.length;
        } else {
            for (var x = 0; x < ranges.length; x++) {
                if (range <= ranges[x] && range >= ranges[x + 1]) {
                    res = x + 1;
                    break;
                }
            }
        }
        self.oldZoom = self.zoomLevel || 0;
        self.zoomLevel = res;

        if (res < self.minReached) {
            self.hideAllLevels();
            self.showZoomLevel(self.minReached);//possible overhead
        } else if (res > self.maxReached) {
            self.hideAllLevels();
            self.showInRange(self.maxReached, range);
        } else {
            if (self.levels[self.oldZoom] && self.levels[res].length != self.levels[self.oldZoom].length || pan) {
                self.hideAllLevels();
                self.showInRange(res, range);
                self.globe.redraw();
            }

        }
    };

    /**
     * Add listeners for mouseover and click
     */
    MarkerCluster.prototype.picking = function () {
        var self = this;
        var highlightedItems = [];
        var handlePick = function (o) {
            var wwd = self.globe;
            var x = o.clientX,
                y = o.clientY;
            var redrawRequired = highlightedItems.length > 0;

            for (var h = 0; h < highlightedItems.length; h++) {
                highlightedItems[h].attributes.imageScale -= 0.2;
                highlightedItems[h].attributes.labelAttributes.font.size -= 10;
            }
            highlightedItems = [];

            var pickList = wwd.pick(wwd.canvasCoordinates(x, y));
            if (pickList.objects.length > 0) {
                redrawRequired = true;
            }

            if (pickList.objects.length > 0) {
                for (var p = 0; p < pickList.objects.length; p++) {
                    if (!pickList.objects[p].isTerrain) {
                        if (pickList.objects[p].userObject.attributes && pickList.objects[p].userObject.attributes.imageScale) {
                            pickList.objects[p].userObject.attributes.imageScale += 0.2;
                            pickList.objects[p].userObject.attributes.labelAttributes.font.size += 10;
                            highlightedItems.push(pickList.objects[p].userObject);
                        }
                    }
                }
            }

            if (redrawRequired) {
                wwd.redraw(); // redraw to make the highlighting changes take effect on the screen
            }
        };
        var handleClick = function (o) {
            var wwd = self.globe;
            var x = o.clientX,
                y = o.clientY;
            var navigator = self.globe.navigator;
            var pickList = wwd.pick(wwd.canvasCoordinates(x, y));
            if (pickList.objects.length > 0) {
                for (var p = 0; p < pickList.objects.length; p++) {
                    if (!pickList.objects[p].isTerrain) {
                        if (pickList.objects[p].userObject.options.zoomLevel) {
                            if (!navigator.lookAtLocation) {
                                navigator.latitude = pickList.objects[p].userObject.position.latitude;
                                navigator.longitude = pickList.objects[p].userObject.position.longitude;
                                navigator.altitude /= 2;
                            } else {
                                navigator.lookAtLocation.latitude = pickList.objects[p].userObject.position.latitude;
                                navigator.lookAtLocation.longitude = pickList.objects[p].userObject.position.longitude;
                                navigator.range /= 2;
                            }
                            var clusters = navigator.clusters || self.globe.controller.clusters;
                            for (var key in clusters) {
                                clusters[key].handleClusterZoom(navigator.range || navigator.altitude);
                                //self.handleClusterZoom(self.globe.navigator.range, true);
                            }

                            break;
                        }
                    }
                }
            }

        };
        if (!self.globe.eventListeners.addedListeners) {
            self.globe.eventListeners.addedListeners = true;
            self.globe.addEventListener("mousemove", handlePick);
            self.globe.addEventListener("click", handleClick);
        }
    };

    /**
     * Shows the marker in the current area at a certain level
     * @param level: Integer. Current level of the camera (matched clusters levels)
     */
    MarkerCluster.prototype.showInRange = function (level, range) {
        var h = document.getElementById("canvasOne").height;
        var w = document.getElementById("canvasOne").width;
        var wwd = this.globe;
        if (wwd.pickTerrain(new WorldWind.Vec2(w / 2, h / 2)).objects) {

            var center = wwd.pickTerrain(new WorldWind.Vec2(w / 2, h / 2));

            center = center.objects[0].position;

            var l = range / Math.cos(Math.PI / 8);
            var base = Math.sqrt(Math.pow(l, 2) - Math.pow(range, 2));

            base = base / 100000;
            var minLat = center.latitude - base;
            var maxLat = center.latitude + base;
            var minLng = center.longitude - base;
            var maxLng = center.longitude + base;
            var buffer = (maxLat - minLat) / 10;
            var bb = {
                ix: minLat - buffer,
                iy: minLng - buffer,
                ax: maxLat + buffer,
                ay: maxLng + buffer
            };
            var count = 0;
            for (var x = 0; x < this.levels[level].length; x++) {
                var point = this.placemarks[this.levels[level][x]];
                var p = point.position;

                if (bb.ix <= p.latitude && p.latitude <= bb.ax && bb.iy <= p.longitude && p.longitude <= bb.ay) {
                    if (count >= this.maxCount) {
                        return;
                    }
                    this.show(point);
                    count++;
                }
            }
        } else {
            this.showZoomLevel(level);
        }
    };

    /**
     * Generates clusters from placemarks
     */
    MarkerCluster.prototype.generateCluster = function () {
        this.hideAllSingle();
        var myJSON = '{"type": "FeatureCollection","features":[';
        newFeature = function (position, label) {
            return '{"type": "Feature","properties": {"name":"' + label + '"},"geometry": {"type": "Point","coordinates": [' +
                +position.longitude + ',' +
                +position.latitude + ']}}';
        };

        this.placemarks.forEach(function (p, i) {
            myJSON += newFeature(p.position, p.label) + ",";
        });
        myJSON = myJSON.slice(0, -1);
        myJSON += ']}';

        this.generateJSONCluster(JSON.parse(myJSON));
        this.showZoomLevel(this.zoomLevel);
    };

    /**
     * Generate clusters from a geojson of points
     * @param geojson
     */
    MarkerCluster.prototype.generateJSONCluster = function (geojson) {
        var self = this;
        cluster = supercluster({
            log: true,
            radius: 70,//should be dynamic
            extent: 128,
            maxZoom: self.zoomLevels
        }).load(geojson.features);

        this.cluster = cluster;
        var end = this.zoomLevels;

        for (var y = 0; y <= end; y++) {
            var res = cluster.getClusters([-180, -90, 180, 90], y + 1);
            var self = this;

            if (this.minReached == 0 && res.length > 0) {
                this.minReached = y;
            }

            if (res.length == geojson.features.length && y > 0 && res.length > 0 && res.length == this.levels[y - 1].length) {
                this.maxReached = y - 1;
                break;
            } else {
                var label, imageSource;

                var max = 0;
                var min = Infinity;
                res.forEach(function (r) {
                    max = Math.max(max, r.properties.point_count || 0);
                    min = Math.min(max, r.properties.point_count || Infinity);
                });
                res.forEach(function (f) {
                    if (f.properties.cluster) {

                        var normalizedCount;
                        if (self.options.attributeColor) {
                            normalizedCount = self.options.attributeColor;
                        } else {
                            normalizedCount = (f.properties.point_count - min) / (max - min);
                        }
                        var sources;
                        if (self.options.clusterSources) {
                            sources = self.options.clusterSources;
                        } else {
                            sources = ["src/images/low.png", "src/images/medium.png",
                                "src/images/high.png", "src/images/vhigh.png"];
                        }


                        switch (true) {
                            case normalizedCount < 0.25:
                                imageSource = sources[0];
                                break;
                            case normalizedCount < 0.55:
                                imageSource = sources[1];
                                break;
                            case normalizedCount < 0.75:
                                imageSource = sources[2];
                                break;
                            default:
                                imageSource = sources[3];
                                break;
                        }

                        label = "" + f.properties.point_count_abbreviated;
                        var offsetText =
                            new WorldWind.Offset(
                                WorldWind.OFFSET_PIXELS, 5,
                                WorldWind.OFFSET_PIXELS, -40);
                        var imageScale = 0.5;
                        var zoomLevel = y + 1;
                    } else {
                        label = f.properties.name;
                        imageSource = WorldWind.configuration.baseUrl + "images/pushpins/push-pin-red.png";
                        var zoomLevel = false;
                    }
                    var options = {
                        imageSource: imageSource,
                        enabled: false,
                        label: label,
                        offsetText: offsetText,
                        imageScale: imageScale,
                        zoomLevel: zoomLevel
                    };
                    var coords = [f.geometry.coordinates[1], f.geometry.coordinates[0]];
                    var p = self.newPlacemark(coords, null, options);

                    self.add(p);
                    self.addToZoom(y, p.index);
                });
            }
        }
        if (!this.maxReached) {
            this.maxReached = end;
        }
        this.picking();
    };

    /**
     * Initialize the levels containing the clusters
     * @param n:Integer. The number of levels for the clusters.
     * @returns {Array}. The initialized empty levels
     */
    MarkerCluster.prototype.createZoomClusters = function (n) {
        for (var x = 0; x <= n; x++) {
            this.levels[x] = [];
        }
        return this.levels;
    };

    /**
     * Add a specified index of a marker to a specified level
     * @param level: Integer. Specifies the level that should contain the marker
     * @param index. The identifier for the marker
     */
    MarkerCluster.prototype.addToZoom = function (level, index) {
        this.levels[level].push(index);
    };

    /**
     * Initialize the level corresponding to the markerCluster
     * @param layer. The layer associated to this instance of markerCluster.
     */
    MarkerCluster.prototype.setLayer = function (layer) {
        this.layer = layer;
    };

    /**
     * Add a new placemark or a list of placemarks to the markerlcuster container.
     * @param placemark. The placemark to add or an array of placemarks.
     */
    MarkerCluster.prototype.add = function (placemark) {
        if (Object.prototype.toString.call(placemark) === '[object Array]') {
            var self = this;
            placemark.forEach(function (place) {
                placemark.index = self.placemarks.length;
                self.layer.addRenderable(place);
                self.placemarks.push(place);
            })
        } else {
            placemark.index = this.placemarks.length;
            this.layer.addRenderable(placemark);
            this.placemarks.push(placemark);
        }
    };

    /**
     * Generate a standard placemark
     * @param coordinates: Coordinates of the placemark
     * @param placemarkAttributes: Attributes to associate to the placemark
     * @param options: Options to assign to the placemark
     * @returns {*}
     */
    MarkerCluster.prototype.generatePlacemarks = function (coordinates, placemarkAttributes, options) {
        var lat, lng, alt;
        if (typeof(coordinates[0]) !== "undefined" && typeof(coordinates[1]) !== "undefined") {
            lat = Number(coordinates[0]);
            lng = Number(coordinates[1]);
        } else if (typeof(coordinates.lat) !== "undefined" && typeof(coordinates.lng) !== "undefined") {
            lat = Number(coordinates.lat);
            lng = Number(coordinates.lng);
        } else {
            throw ("Error in coordinates");
        }

        if (!options) {
            options = {};
        }

        alt = coordinates[2] ? coordinates[2] : 0;
        alt = coordinates.alt ? coordinates.alt : alt;

        var position = new WorldWind.Position(lat, lng, alt);


        if (!placemarkAttributes) {
            placemarkAttributes = new WorldWind.PlacemarkAttributes(null);
            placemarkAttributes.imageScale = options.imageScale ? options.imageScale : 1;
            placemarkAttributes.imageOffset = new WorldWind.Offset(
                WorldWind.OFFSET_FRACTION, 0.3,
                WorldWind.OFFSET_FRACTION, 0.0);

            if (options.offsetText) {
                placemarkAttributes.labelAttributes.offset = options.offsetText;
            } else {
                placemarkAttributes.labelAttributes.offset = new WorldWind.Offset(
                    WorldWind.OFFSET_FRACTION, 0.5,
                    WorldWind.OFFSET_FRACTION, 1.0);
            }
            placemarkAttributes.labelAttributes.color = WorldWind.Color.WHITE;
            placemarkAttributes.labelAttributes.font.size = 30;
        }

        var placemark = new WorldWind.Placemark(position, true, null);
        placemark.label = options.label ? options.label : "MyMarker " + lat + " - " + lng;
        placemark.altitudeMode = options.altitudeMode ? options.altitudeMode : WorldWind.RELATIVE_TO_GROUND;
        placemarkAttributes = new WorldWind.PlacemarkAttributes(placemarkAttributes);
        placemarkAttributes.imageSource = options.imageSource ? options.imageSource : WorldWind.configuration.baseUrl + "images/pushpins/push-pin-red.png";
        placemark.attributes = placemarkAttributes;
        placemark.imageTilt = 5;
        placemark.eyeDistanceScaling = true;
        placemark.eyeDistanceScalingThreshold = 3e6;
        placemark.eyeDistanceScalingLabelThreshold = 1e20;
        placemark.options = options;
        placemark.enabled = false;

        return placemark;
    };

    /**
     * Create a new placemark from a pair of coordinates or a coordinates array
     * @param coordinates: The coordinate fot the placemark
     * @param placemarkAttributes: Attributes to associate to the placemark
     * @param options: Options to assign to the placemark
     * @returns {*}
     */
    MarkerCluster.prototype.newPlacemark = function (coordinates, placemarkAttributes, options) {
        if (!coordinates) {
            throw ("No coordinates provided");
        }
        var placemark;
        if (typeof (coordinates[0]) == "object") {
            placemark = [];
            for (var index in coordinates) {
                placemark.push(this.generatePlacemarks(coordinates[index], placemarkAttributes, options));
            }
        } else {
            placemark = this.generatePlacemarks(coordinates, placemarkAttributes, options)
        }
        return placemark;
    };

    /**
     * Hides a specified placemark
     * @param placemark: the placemark to hide
     * @returns {*}
     */
    MarkerCluster.prototype.hide = function (placemark) {
        var index = placemark.index;
        this.placemarks[index].enabled = false;
        return placemark;
    };

    /**
     * Shows a specified placemark
     * @param placemark: the placemark to show
     * @returns {*}
     */
    MarkerCluster.prototype.show = function (placemark) {
        var index = placemark.index;
        this.placemarks[index].enabled = true;
        return placemark;
    };

    /**
     * Hides all placemark inserted
     */
    MarkerCluster.prototype.hideAllSingle = function () {
        for (var x = 0; x <= this.placemarks; x++) {
            this.placemarks[x].enabled = false;
        }
    };

    /**
     * Hides all placemark at all zoom levels
     */
    MarkerCluster.prototype.hideAllLevels = function () {
        for (var x = 0; x <= this.zoomLevels && x <= this.maxReached; x++) {
            this.hideZoomLevel(x);
        }
    };

    /**
     * Hides the placemarks at a specified zoom level
     * @param level: the level in which the placemark will be hidden
     */
    MarkerCluster.prototype.hideZoomLevel = function (level) {
        if (this.levels[level]) {
            for (var x = 0; x < this.levels[level].length; x++) {
                this.hide(this.placemarks[this.levels[level][x]]);
            }
        }
    };

    /**
     * Shows the placemarks at a specified zoom level
     * @param level: the level in which the placemark will be shown
     */
    MarkerCluster.prototype.showZoomLevel = function (level) {
        if (this.levels[level]) {
            for (var x = 0; x < this.levels[level].length; x++) {
                this.show(this.placemarks[this.levels[level][x]]);
            }
        }
    };

    /**
     * Removes a placemark from the cluster
     * @param placemark: The placemark that needs to be removed
     */
    MarkerCluster.prototype.removePlacemark = function (placemark) {
        this.layer.removeRenderable(placemark);
        this.placemarks.splice(this.placemarks.indexOf(placemark));
    };

    return MarkerCluster;
})
;

