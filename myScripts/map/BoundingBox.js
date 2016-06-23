define([
], function () {
    "use strict";

    /**
     * It represents bounding box. In current level, the bounding box is represented as a rectangle.
     * @constructor
     * @param top Latitude of top left corner of this box
     * @param left Longitude of top left corner of this box
     * @param bottom Latitude of the bottom right corner of this box
     * @param right Longitude of the bottom right corner of this box
     */
    var BoundingBox = function (bottom, left, top, right) {
        this._top = top;
        this._left = left;
        this._bottom = bottom;
        this._right = right;
    };

    Object.defineProperties(BoundingBox.prototype, {
        /**
         * Latitude representing the top of the rectangle
         * @memberof BoundingBox.prototype
         * @type {String}
         * @readonly
         */
        top: {
            get: function () {
                return this._top;
            }
        },

        /**
         * Longitude representing the left of the rectangle
         * @memberof BoundingBox.prototype
         * @type {String}
         * @readonly
         */
        left: {
            get: function () {
                return this._left;
            }
        },

        /**
         * Latitude representing the bottom of the rectangle
         * @memberof BoundingBox.prototype
         * @type {String}
         * @readonly
         */
        bottom: {
            get: function () {
                return this._bottom;
            }
        },

        /**
         * Longitude representing the right of the rectangle
         * @memberof BoundingBox.prototype
         * @type {String}
         * @readonly
         */
        right: {
            get: function () {
                return this._right;
            }
        }
    });

    /**
     * It returns true if the current bbox is partially in area enclosed by the passed in bbox
     * @param bbox {BoundingBox} Bounding box of the area to compare with this one.
     */
    BoundingBox.prototype.isPartiallyInArea = function (bbox) {
        return this.isFullyInArea(bbox) ||
            this.isFullyInAreaCrossingDateline(bbox) ||
            this.isEnclosedByArea(bbox) ||
            this.isPartInArea(bbox);
    };

    /**
     * If any part of the rectangular bounding box is in the area.
     * @param bbox {BoundingBox} Bounding Box of the area to compare with this one.
     * @returns {boolean} True if part of the Bounding Box is in the area.
     */
    BoundingBox.prototype.isPartInArea = function(bbox){
        var isPartInArea = !(
            (this.left >= bbox.right || bbox.left >= this.right) ||
            (this.top <= bbox.bottom || bbox.top <= this.bottom)
        );
        return isPartInArea;
    };

    /**
     * Passed in bbox is fully in area represented by current bbox.
     * @param bbox {BoundingBox} Box to compare with this one.
     * @returns {boolean} True if the passed in bbox is fullly in current area.
     */
    BoundingBox.prototype.isFullyInArea = function(bbox){
        var isFully = this.top < bbox.top &&
            this.left > bbox.left &&
            this.right < bbox.right &&
            this.bottom > bbox.bottom;

        return isFully;
    };

    BoundingBox.prototype.isFullyInAreaCrossingDateline = function(bbox){
        var isFullyDateline = (this.top < bbox.top &&
            this.bottom > bbox.bottom  &&
            this.left > bbox.left &&
            (this.right > bbox.right && bbox.right < bbox.left)) ||
            (this.top < bbox.top &&
            this.bottom > bbox.bottom  &&
            this.right < bbox.right &&
            (this.left < bbox.left && bbox.right < bbox.left));
        return isFullyDateline;
    };

    /**
     * It returns true if the current bbox is fully in area enclosed by the passed in bbox
     * @param bbox {BoundingBox} Bounding box of the area to compare with this one.
     */
    BoundingBox.prototype.isEnclosedByArea = function (bbox) {
        var isEnclosed = this.top > bbox.top &&
            this.left < bbox.left &&
            this.right > bbox.right &&
            this.bottom < bbox.bottom;
     
        return isEnclosed;
    };

    BoundingBox.prototype.toString = function() {
        return "[" + this.top + "," + this.left + "," + this.bottom + "," + this.right + "]";
    };

    return BoundingBox;
});