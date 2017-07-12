define([
    './BoundingBox',
    './CoordConversions',
    '../../worldwind/WorldWind'
], function (BoundingBox,
             CoordConversions) {
    var Vec2 = WorldWind.Vec2;

    /**
     * Visible area of the globe according to current viewport
     * @param options {Object} Options object containing
     *  viewport {Function []}
     *  eyeGeoCoord {Function []}
     *  range {Function []}
     *  wwd {WorldWindow}
     *  globeRadius {Number}
     * @constructor
     */
    var VisibleArea = function (options) {
        this._viewport = options.viewport;

        // center point of viewport in geographic coordinates
        this._eyeGeoCoord = options.eyeGeoCoord;
        // distance from eye to globe surface
        this._range = options.range;
        this._worldWindow = options.wwd;
        this._conversions = new CoordConversions();
    };

    /**
     * Returns the intersection between viewport coordinates and globe represented by geographic coordinates, if there is any
     * @param point {Array}
     * @returns {*}
     */
    VisibleArea.prototype.getPosition = function(point) {
        var location = this._worldWindow.pickTerrain(point).objects;
        if (location.length > 0){
            return location[0].position;
        }
        else {
            return null;
        }
    };

    /**
     * Check if the viewport area fully contains the globe
     * @returns {Number}
     */
    VisibleArea.prototype.visibilityStatus = function () {
        var topLeft = this.getPosition([1,1]);
        var centerRight = this.getPosition([this._viewport().width-1,this._viewport().height/2]);
        var bottomCenter = this.getPosition([this._viewport().width/2,this._viewport().height-1]);
        var centerLeft = this.getPosition([1,this._viewport().height/2]);

        if (topLeft == null && centerRight == null && bottomCenter == null && centerLeft == null){
            return 0;
        }
        else if (topLeft != null && centerRight != null && bottomCenter != null && centerLeft != null){
            return 2;
        }
        else {
            return 1;
        }
    };

    /**
     * Returns visible area on the globe limited by viewport represented by bounding box
     * @returns {BoundingBox}
     */
    VisibleArea.prototype.getVisibleArea4FullViewport = function () {
        var viewport = this._viewport();
        var width = viewport.width - 2;
        var height = viewport.height - 2;
        var intervals = 2; //even number!
        var borderPoints = [];
        var coordinates = [];

        // extract the coordinates of viewport boundaries
        for(var i=0;i<intervals;i++){
            borderPoints[i] = new Vec2(1+i*(width/intervals),1); //top
            borderPoints[i+intervals] = new Vec2(1+width,1+i*(height/intervals)); //right
            borderPoints[i+2*intervals] = new Vec2((2+width)-(1+i*(width/intervals)),1+height); //bottom
            borderPoints[i+3*intervals] = new Vec2(1,(2+height)-(1+i*(height/intervals))); //left
        }

        for(var j=0;j<borderPoints.length;j++){
            var geoLocation = this.getPosition(borderPoints[j]);
            if (geoLocation != null){
                coordinates.push([Math.round(geoLocation.latitude*10)/10,Math.round(geoLocation.longitude*10)/10]);
            }
        }
        return this.inBoundingBox(coordinates);
    };

    /**
     * Returns visible area on the globe when space is visible in corners, represented bz bounding box
     * @returns {BoundingBox}
     */
    VisibleArea.prototype.getVisibleArea4PartGlobe = function () {
        var viewport = this._viewport();
        var width = viewport.width - 2;
        var height = viewport.height - 2;
        var intervals = 10;
        var gridPoints = [];

        for(var i = 0; i < (intervals+1); i++) {
            for(var j = 0; j < (intervals+1); j++) {
                var viewportPoint = new Vec2(1 + j*(width/intervals),1 + i*(height/intervals));
                var geoLocation = this.getPosition(viewportPoint);
                if (geoLocation != null){
                    gridPoints.push([Math.round(geoLocation.latitude),Math.round(geoLocation.longitude)]);
                }
            }
            //for(var k = 0; k < (intervals); k++) {
            //    var viewportPoint2 = new Vec2((width/(2*intervals)) + k*(width/intervals),(height/(2*intervals)) + i*(height/intervals));
            //    var geoLocation2 = this.getPosition(viewportPoint2);
            //    if (geoLocation2 != null){
            //        gridPoints.push([Math.round(geoLocation2.latitude),Math.round(geoLocation2.longitude)]);
            //    }
            //}
        }
        return this.inBoundingBox(gridPoints);
    };


    /**
     * Returns visible area on the globe represented as a BoundingBox.
     * @returns {BoundingBox}
     */
    VisibleArea.prototype.getVisibleArea4FullGlobe = function () {

        var globeRadius = 6378000;
        var centerReal = {
            lat: this._eyeGeoCoord().latitude,
            lon: this._eyeGeoCoord().longitude
        };
        var maxCarto = {
            lat: Math.asin(globeRadius / (globeRadius + this._range())),
            lon: [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 110, 120, 130, 140, 150, 160, 170, 180, 190, 200, 210, 220, 230, 240, 250, 260, 270, 280, 290, 300, 310, 320, 330, 340, 350]
        };
        var maxVisibleCoordinates = [];
        var afterBreakpoint = false;
        var prevLocation = 360;

        // maximum visible latitude in real (geographic) coordinates
        for (var i = 0; i < maxCarto.lon.length; i++) {
            maxVisibleCoordinates[i] = this._conversions.carto2geoConversion(centerReal.lat, centerReal.lon, maxCarto.lat, maxCarto.lon[i], afterBreakpoint);

            if (afterBreakpoint == false) {
                afterBreakpoint = maxVisibleCoordinates[i][1] > prevLocation;
            } else {
                afterBreakpoint = maxVisibleCoordinates[i][1] < prevLocation;
            }
            maxVisibleCoordinates[i] = this._conversions.carto2geoConversion(centerReal.lat, centerReal.lon, maxCarto.lat, maxCarto.lon[i], afterBreakpoint);
            prevLocation = maxVisibleCoordinates[i][1];

            maxVisibleCoordinates[i][1] = this._conversions.transformVisibleToBoundaries(maxVisibleCoordinates[i][1]);
        }
        return this.inBoundingBox(maxVisibleCoordinates);
    };

    VisibleArea.prototype.inBoundingBox = function (coordinates) {
        var top = -90;
        var bottom = 90;
        var left = 180;
        var right = -180;

        var visibilityStatus = this.visibilityStatus();

        // if there is a dateline in visible area
        if (this._conversions.isDatelineInViewport(coordinates)){
            left = 180;
            right = -180;

            coordinates.forEach(function (coordinate) {
                var latitude = coordinate[0];
                var longitude = coordinate[1];
                if (latitude > top) {
                    top = latitude;
                }
                if (latitude < bottom) {
                    bottom = latitude;
                }
                if (longitude < left && longitude > 0) {
                    left = longitude;
                }
                if (longitude > right && longitude < 0) {
                    right = longitude;
                }
            });

        } else {
            coordinates.forEach(function (coordinate) {
                var latitude = coordinate[0];
                var longitude = coordinate[1];
                if (latitude > top) {
                    top = latitude;
                }
                if (latitude < bottom) {
                    bottom = latitude;
                }
                if (longitude < left) {
                    left = longitude;
                }
                if (longitude > right) {
                    right = longitude;
                }
            });
        }

        if (visibilityStatus==2){
            if (this._conversions.isPoleInViewport(coordinates)=="north"){
                top = 90;
                left = -180;
                right = 180;
            }
            else if (this._conversions.isPoleInViewport(coordinates)=="south"){
                bottom = -90;
                left = -180;
                right = 180;
            }
        }

        else if (visibilityStatus==0){
            if (this._conversions.isPoleVisible(coordinates) =="north"){
                top = 90;
                left = -180;
                right = 180;
            }
            else if (this._conversions.isPoleVisible(coordinates)=="south"){
                bottom = -90;
                left = -180;
                right = 180;
            }
        }

        else if (visibilityStatus==1){
            top = top + 5;
            bottom = bottom - 5;
            left = left - 5;
            right = right + 5;

            if (top > 84){
                top = 90;
                left = -180;
                right = 180;
            }
            else if (bottom < -84){
                bottom = -90;
                left = -180;
                right = 180;
            }
        }
        return new BoundingBox(bottom, left, top, right);
    };

    return VisibleArea;
});