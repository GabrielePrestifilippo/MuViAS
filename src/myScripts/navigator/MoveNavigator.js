define(['../map/VisibleArea','../../worldwind/navigate/LookAt'], function (VisibleArea,LookAt) {
    var LookAtNavigator = LookAt;

    /**
     * Specific navigator for movement. It allows us to add logic to handling of the mouse wheel.
     * @constructor
     * @param options {Object} Options object containing
     *  wwd {WorldWindow}
     *  zoomLevelListeners {Function[]} accepting two arguments. First is zoom level and second is viewport.
     *  viewPortChangedListeners {Function[]} accepting two arguments. First is zoom level and second is viewport.
     * @augments LookAtNavigator
     */
    var MoveNavigator = function (options) {
        LookAtNavigator.call(this, options.wwd);
        //options.wwd.navigator = this;

        this._lastRange = 0;
        this._zoomLevelListeners = options.zoomLevelListeners || [];

        this._zoomLevel = 10;

        this._viewPortChangeListeners = options.viewPortChangedListeners || [];
        this.range = 23440143;
        this.worldWindow=options.wwd;
        this.lookAtLocation={};
        this.lookAtLocation.latitude = 10;
        this.lookAtLocation.longitude = 15;


        var self = this;
        this._visibleArea = new VisibleArea({
            viewport: function () {
                return self.worldWindow.viewport
            },
            eyeGeoCoord: function () {
                return self.lookAtLocation
            },
            range: function () {
                return self.range
            },
            wwd: self.worldWindow
        });

    };

    MoveNavigator.prototype = Object.create(LookAtNavigator.prototype);

    /**
     * Overrides the method from descendant and adds the functionality for modifying shown SurfacePolygons
     * showing the choropleth.
     * @inheritDoc
     */
    MoveNavigator.prototype.handleWheelEvent = function (event) {
        LookAtNavigator.prototype.handleWheelEvent.apply(this, arguments);

        var previousZoomLevel = this._zoomLevel;
        if (previousZoomLevel != this.getZoomLevel()) {
            this.callListeners(this._zoomLevelListeners);
        }

        this._lastRange = this.range;
    };

    /**
     * It returns current range. Shouldn't be used from outside.
     * @returns {Number} Number representing current distance from the Earth surface. // I am not sure about this
     * statement.
     */
    MoveNavigator.prototype.getRange = function () {
        return this.range;
    };

    /**
     * It returns current zoom level.
     * @returns {Number} Number representing current level. This number represents how many rectangles one * one
     * should be grouped together.
     */
    MoveNavigator.prototype.getZoomLevel = function () {
        var MILLION = 1000000;
        var ranges = [
            0.8 * MILLION,
            2 * MILLION,
            5 * MILLION,
            10 * MILLION
        ];

        // First
        if (this.getRange() < ranges[0] && this._lastRange > ranges[0]) {
            this._zoomLevel = 1;
        }

        if ((this.getRange() > ranges[0] && this.getRange() < ranges[1])
            && (this._lastRange < ranges[0] || this._lastRange > ranges[1])) {
            this._zoomLevel = 2;
        }

        if ((this.getRange() > ranges[1] && this.getRange() < ranges[2])
            && (this._lastRange < ranges[1] || this._lastRange > ranges[2])) {
            this._zoomLevel = 5;
        }

        if ((this.getRange() > ranges[2] && this.getRange() < ranges[3])
            && (this._lastRange < ranges[2] || this._lastRange > ranges[3])) {
            this._zoomLevel = 10;
        }

        //Last
        if (this.getRange() > ranges[ranges.length - 1] && this._lastRange < ranges[ranges.length - 1]) {
            this._zoomLevel = 20;
        }
        return this._zoomLevel;
    };


    /**
     * @inheritDoc
     * Also call listeners waiting for the change in the visible viewport. It happens whenever user ends with
     * current panning or dragging.
     */
    LookAtNavigator.prototype.handlePanOrDrag = function (recognizer) {
        if (this.worldWindow.globe.is2D()) {

            this.handlePanOrDrag2D(recognizer);
        } else {
            this.handlePanOrDrag3D(recognizer);
        }
    };

// Intentionally not documented.
    LookAtNavigator.prototype.handlePanOrDrag3D = function (recognizer) {
        var state = recognizer.state,
            tx = recognizer.translationX,
            ty = recognizer.translationY;

        if (state == WorldWind.BEGAN) {
            this.lastPoint.set(0, 0);
        } else if (state == WorldWind.CHANGED) {
            // Convert the translation from screen coordinates to arc degrees. Use this navigator's range as a
            // metric for converting screen pixels to meters, and use the globe's radius for converting from meters
            // to arc degrees.
            var canvas = this.worldWindow.canvas,
                globe = this.worldWindow.globe,
                globeRadius = WorldWind.WWMath.max(globe.equatorialRadius, globe.polarRadius),
                distance = WorldWind.WWMath.max(1, this.range),
                metersPerPixel = WorldWind.WWMath.perspectivePixelSize(canvas.clientWidth, canvas.clientHeight, distance),
                forwardMeters = (ty - this.lastPoint[1]) * metersPerPixel,
                sideMeters = -(tx - this.lastPoint[0]) * metersPerPixel,
                forwardDegrees = (forwardMeters / globeRadius) * WorldWind.Angle.RADIANS_TO_DEGREES,
                sideDegrees = (sideMeters / globeRadius) * WorldWind.Angle.RADIANS_TO_DEGREES;

            // Apply the change in latitude and longitude to this navigator, relative to the current heading.
            var sinHeading = Math.sin(this.heading * WorldWind.Angle.DEGREES_TO_RADIANS),
                cosHeading = Math.cos(this.heading * WorldWind.Angle.DEGREES_TO_RADIANS);

            this.lookAtLocation.latitude += forwardDegrees * cosHeading - sideDegrees * sinHeading;
            this.lookAtLocation.longitude += forwardDegrees * sinHeading + sideDegrees * cosHeading;
            this.lastPoint.set(tx, ty);
            this.applyLimits();
            this.worldWindow.redraw();
        }
    };

// Intentionally not documented.
    LookAtNavigator.prototype.handlePanOrDrag2D = function (recognizer) {
        var state = recognizer.state,
            x = recognizer.clientX,
            y = recognizer.clientY,
            tx = recognizer.translationX,
            ty = recognizer.translationY;

        if (state == WorldWind.BEGAN) {
            this.beginPoint.set(x, y);
            this.lastPoint.set(x, y);
        } else if (state == WorldWind.CHANGED) {
            var x1 = this.lastPoint[0],
                y1 = this.lastPoint[1],
                x2 = this.beginPoint[0] + tx,
                y2 = this.beginPoint[1] + ty;
            this.lastPoint.set(x2, y2);

            var navState = this.currentState(),
                globe = this.worldWindow.globe,
                ray = navState.rayFromScreenPoint(this.worldWindow.canvasCoordinates(x1, y1)),
                point1 = new Vec3(0, 0, 0),
                point2 = new Vec3(0, 0, 0),
                origin = new Vec3(0, 0, 0);
            if (!globe.intersectsLine(ray, point1)) {
                return;
            }

            ray = navState.rayFromScreenPoint(this.worldWindow.canvasCoordinates(x2, y2));
            if (!globe.intersectsLine(ray, point2)) {
                return;
            }

            // Transform the original navigator state's modelview matrix to account for the gesture's change.
            var modelview = Matrix.fromIdentity();
            modelview.copy(navState.modelview);
            modelview.multiplyByTranslation(point2[0] - point1[0], point2[1] - point1[1], point2[2] - point1[2]);

            // Compute the globe point at the screen center from the perspective of the transformed navigator state.
            modelview.extractEyePoint(ray.origin);
            modelview.extractForwardVector(ray.direction);
            if (!globe.intersectsLine(ray, origin)) {
                return;
            }

            // Convert the transformed modelview matrix to a set of navigator properties, then apply those
            // properties to this navigator.
            var params = modelview.extractViewingParameters(origin, this.roll, globe, {});
            this.lookAtLocation.copy(params.origin);
            this.range = params.range;
            this.heading = params.heading;
            this.tilt = params.tilt;
            this.roll = params.roll;
            this.applyLimits();
            this.worldWindow.redraw();
        }
    };
    /**
     * It returns currently visible area of the Earth as a Bounding Box, which definitely surrounds the whole area.
     * @returns {BoundingBox} Bounding Box of visible area.
     */
    MoveNavigator.prototype.getVisibleAreaBoundaries = function () {
        var status = this._visibleArea.visibilityStatus();

        if (status == 0) {
            return this._visibleArea.getVisibleArea4FullGlobe();
        }
        else if (status == 1) {
            return this._visibleArea.getVisibleArea4PartGlobe();
        }
        else {
            return this._visibleArea.getVisibleArea4FullViewport();
        }
    };

    /**
     * It calls all listeners. No information is passed to them. They must query the state somehow.
     */
    MoveNavigator.prototype.callListeners = function (listeners) {
        listeners.forEach(function (listener) {
            listener();
        })
    };

    return MoveNavigator;
})
;