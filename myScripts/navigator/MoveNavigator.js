define(['../map/VisibleArea'], function (VisibleArea) {
    var LookAtNavigator = WorldWind.LookAtNavigator;

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

        options.wwd.navigator = this;
        this._lastRange = 0;
        this._zoomLevelListeners = options.zoomLevelListeners || [];
        this._viewPortChangeListeners = options.viewPortChangedListeners || [];
        this._zoomLevel = 10;


        this.range = 23440143;
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
    MoveNavigator.prototype.handlePanOrDrag = function (recognizer) {
        LookAtNavigator.prototype.handlePanOrDrag.apply(this, arguments);

        var state = recognizer.state;

        if (state == WorldWind.ENDED) {
            this.callListeners(this._viewPortChangeListeners);
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
});