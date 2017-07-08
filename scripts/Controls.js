define(['../src/navigate/LookAt'], function (LookAt) {
    "use strict";

    /**
     * Constructs a view controls layer.
     * @alias Controls
     * @constructor
     * @param {WorldWindow} worldWindow The World Window associated with these controls.
     */
    var Controls = function (worldWindow) {


        /**
         * The World Window associated with controls.
         * @type {WorldWindow}
         * @readonly
         */
        this.wwd = worldWindow;

        /**
         * The incremental vertical exaggeration to apply each cycle.
         * @type {Number}
         * @default 0.01
         */
        this.exaggerationIncrement = 0.01;

        /**
         * The incremental amount to increase or decrease the eye distance (for zoom) each cycle.
         * @type {Number}
         * @default 0.04 (4%)
         */
        this.zoomIncrement = 0.08;

        /**
         * The incremental amount to increase or decrease the heading each cycle, in degrees.
         * @type {Number}
         * @default 1.0
         */
        this.headingIncrement = 1.0;

        /**
         * The incremental amount to increase or decrease the tilt each cycle, in degrees.
         * @type {Number}
         */
        this.tiltIncrement = 1.0;

        /**
         * The incremental amount to narrow or widen the field of view each cycle, in degrees.
         * @type {Number}
         * @default 0.1
         */
        this.fieldOfViewIncrement = 0.1;

        /**
         * The scale factor governing the pan speed. Increased values cause faster panning.
         * @type {Number}
         * @default 0.001
         */
        this.panIncrement = 0.001;

        // Establish event handlers.
        this.setupInteraction();
    };

    // Intentionally not documented.
    Controls.prototype.setupInteraction = function () {
        //// Add the mouse listeners.
        $("#zoom-plus-control").on({
            "mousedown": this.handleMouseEvent.bind(this, this.handleZoomIn),
            "mouseup": this.handleMouseEvent.bind(this, this.handleZoomIn)
        });
        $("#zoom-minus-control").on({
            "mousedown": this.handleMouseEvent.bind(this, this.handleZoomOut),
            "mouseup": this.handleMouseEvent.bind(this, this.handleZoomOut)
        });
        $("#tilt-less-control").on({
            "mousedown": this.handleMouseEvent.bind(this, this.handleTiltUp),
            "mouseup": this.handleMouseEvent.bind(this, this.handleTiltUp)
        });
        $("#tilt-more-control").on({
            "mousedown": this.handleMouseEvent.bind(this, this.handleTiltDown),
            "mouseup": this.handleMouseEvent.bind(this, this.handleTiltDown)
        });
        $("#rotate-right-control").on({
            "mousedown": this.handleMouseEvent.bind(this, this.handleHeadingRight),
            "mouseup": this.handleMouseEvent.bind(this, this.handleHeadingRight)
        });
        $("#rotate-left-control").on({
            "mousedown": this.handleMouseEvent.bind(this, this.handleHeadingLeft),
            "mouseup": this.handleMouseEvent.bind(this, this.handleHeadingLeft)
        });
        $("#rotate-needle-control").on({
            "mouseup": this.handleHeadingReset.bind(this)
        });
        this.wwd.addEventListener("mousemove", this.handleManualRedraw.bind(this));
    };

    Controls.prototype.handleMouseEvent = function (operation, e) {
        if (
            e.type &&
            (
                (e.type === "mouseup" && e.which === 1) ||
                e.type === "touchend" ||
                e.type === "touchcancel"
            )
        ) {
            this.handleOperationEnd(e);
        } else {
            this.handleOperationStart(operation, e);
        }
    };

    Controls.prototype.handleOperationStart = function (operation, e) {
        if ((e.type === "mousedown" && e.which === 1) || (e.type === "touchstart")) {

            this.activeOperation = operation;
            e.preventDefault();

            var self = this;
            var runOperation = function () {
                if (self.activeOperation) {
                    operation.call(self);
                    setTimeout(runOperation, 50);
                }
            };
            setTimeout(runOperation, 50);
        }
    };

    Controls.prototype.handleOperationEnd = function (e) {
        this.activeOperation = null;
        e.preventDefault();
    };

    Controls.prototype.handleZoomIn = function () {
        var lookAt = new LookAt();
        this.wwd.navigator.getAsLookAt(this.wwd.globe, lookAt);
        var thisLayer = this; // capture 'this' for use in the function
        var setRange = function () {
            lookAt.range *= (1 - thisLayer.zoomIncrement);
            thisLayer.wwd.navigator.setAsLookAt(thisLayer.wwd.globe, lookAt);
            thisLayer.wwd.redraw();
        };
        if(this.heatmap){
            this.heatmap(lookAt.range);
        }
        setTimeout(setRange, 5);

    };

    Controls.prototype.handleZoomOut = function () {
        var lookAt = new LookAt();
        this.wwd.navigator.getAsLookAt(this.wwd.globe, lookAt);
        var thisLayer = this; // capture 'this' for use in the function
        var setRange = function () {
            lookAt.range *= (1 + thisLayer.zoomIncrement);
            thisLayer.wwd.navigator.setAsLookAt(thisLayer.wwd.globe, lookAt);
            thisLayer.wwd.redraw();
        };
        if(this.heatmap){
            this.heatmap(lookAt.range);
        }
        setTimeout(setRange, 5);
    };

    Controls.prototype.handleHeadingRight = function () {
        this.wwd.navigator.heading -= this.headingIncrement;
        this.wwd.redraw();
        this.redrawHeadingIndicator();
    };

    Controls.prototype.handleHeadingLeft = function () {
        this.wwd.navigator.heading += this.headingIncrement;
        this.wwd.redraw();
        this.redrawHeadingIndicator();
    };

    Controls.prototype.handleHeadingReset = function () {
        var headingIncrement = 1.0;
        if (Math.abs(this.wwd.navigator.heading) > 60) {
            headingIncrement = 2.0;
        } else if (Math.abs(this.wwd.navigator.heading) > 120) {
            headingIncrement = 3.0;
        }
        if (this.wwd.navigator.heading > 0) {
            headingIncrement = -headingIncrement;
        }
        var self = this;
        var runOperation = function () {
            if (Math.abs(self.wwd.navigator.heading) > Math.abs(headingIncrement)) {
                self.wwd.navigator.heading += headingIncrement;
                self.wwd.redraw();
                self.redrawHeadingIndicator();
                setTimeout(runOperation, 10);
            } else {
                self.wwd.navigator.heading = 0;
                self.wwd.redraw();
                self.redrawHeadingIndicator();
            }
        };
        setTimeout(runOperation, 10);
    };

    Controls.prototype.redrawHeadingIndicator = function () {
        var initialAngle = 45;
        var currentHeading = this.wwd.navigator.heading;
        var rotateAngle = 0 - currentHeading - initialAngle;
        $("#rotate-needle-control").find('i').css('transform', 'rotate(' + rotateAngle + 'deg)');
    };

    Controls.prototype.handleTiltUp = function () {
        this.wwd.navigator.tilt =
            Math.max(0, this.wwd.navigator.tilt - this.tiltIncrement);
        this.wwd.redraw();
    };

    Controls.prototype.handleTiltDown = function () {
        this.wwd.navigator.tilt =
            Math.min(90, this.wwd.navigator.tilt + this.tiltIncrement);
        this.wwd.redraw();
    };

    Controls.prototype.handleManualRedraw = function (e) {
        if (e.which) { //we only care if mouse button is down todo will this work for touch?

            // redraw heading indicator
            this._lastHeading = this._lastHeading || 0;
            if (this.wwd.navigator.heading != this._lastHeading) {
                this.redrawHeadingIndicator();
            }
            this._lastHeading = this.wwd.navigator.heading;
        }
    };

    return Controls;
});