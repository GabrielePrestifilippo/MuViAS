define([], function () {
    "use strict";

    var CoordConversions = function(){
    };

    /**
     * Check if the dateline (or its part) is visible in viewport
     * @param coordinates - geographic coordinates of viewport border/grid
     * @returns {boolean}
     */
    CoordConversions.prototype.isDatelineInViewport = function (coordinates) {
        var previous = 0;
        var ans = false;

        for(var i=0;i<coordinates.length;i++){
            if(Math.abs(coordinates[i][1] - previous) > 180){
                ans = true;
            }
            previous = coordinates[i][1];
        }

        return ans;
    };

    /**
     * Check if the pole (and determines which one) is visible in current viewport
     * @param coordinates
     * @returns {String}
     */
    CoordConversions.prototype.isPoleInViewport = function (coordinates){
        var length = coordinates.length;
        var topCenter = coordinates[length/8];
        var bottomCenter = coordinates[5*length/8];

        if ((Math.abs(topCenter[1])+Math.abs(bottomCenter[1]))==180){
            if((topCenter[0] > 0) && (bottomCenter[0] > 0)){
                return "north";
            }
            else if ((topCenter[0] < 0) && (bottomCenter[0] < 0)){
                return "south";
            }
            return "none";
        }
        return "none";
    };

    CoordConversions.prototype.isPoleVisible = function(coordinates){
        if (coordinates[0][1]-coordinates[coordinates.length/2][1] == 0){
            return "none";
        }
        else {
            if ((Math.abs(coordinates[coordinates.length/2][0])>=Math.abs(coordinates[0][0]))&&(coordinates[coordinates.length/2][0]>0)){
                return "north";
            }
            else {
                return "south";
            }
        }
    };

    /**
     * Transform coordinate to fit into -180,180
     * @param coordinate
     * @returns {*}
     */
    CoordConversions.prototype.transformVisibleToBoundaries = function (coordinate) {
        if (coordinate < -180) {
            return 360 + coordinate;
        } else if (coordinate > 180) {
            return -360 + coordinate;
        }
        return coordinate;
    };

    /**
     * Convert cartographic coordinates of the visible area boundary to real geographic (lat, lon) coordinates
     * @param centerRealLat - the center point of view in geographic coordinates - latitude
     * @param centerRealLon - the center point of view in geographic coordinates - longitude
     * @param maxCartoLat - max visible cartographic latitude
     * @param maxCartoLon - cartographic longitude - from 0 to 360 degrees
     * @param afterBreakpoint - boolean value
     * @returns {Array} geographic coordinates of the visible area boundary
     */
    CoordConversions.prototype.carto2geoConversion = function (centerRealLat, centerRealLon, maxCartoLat, maxCartoLon, afterBreakpoint) {
        centerRealLat = centerRealLat * Math.PI / 180;
        centerRealLon = centerRealLon * Math.PI / 180;
        maxCartoLon = maxCartoLon * Math.PI / 180;


        var convertedCoord = [];
        var lat = Math.asin(Math.sin(centerRealLat) * Math.sin(maxCartoLat) - Math.cos(maxCartoLat) * Math.cos(centerRealLat) * Math.cos(maxCartoLon));
        var lon;

        if ((this.poleVisibility(maxCartoLat, centerRealLat) === true) && (centerRealLat >= 0)) {
            if ((afterBreakpoint === true)) {
                lon = Math.PI + Math.asin(Math.sin(maxCartoLon) * Math.cos(maxCartoLat) / Math.cos(lat)) + centerRealLon;
            }
            else {
                lon = -Math.asin(Math.sin(maxCartoLon) * Math.cos(maxCartoLat) / Math.cos(lat)) + centerRealLon;
            }
        }
        else if ((this.poleVisibility(maxCartoLat, centerRealLat) === true) && (centerRealLat < 0)) {
            if ((this.poleVisibility(maxCartoLat, centerRealLat) === true) && (afterBreakpoint === true)) {
                lon = Math.asin(Math.sin(maxCartoLon) * Math.cos(maxCartoLat) / Math.cos(lat)) + centerRealLon;
            }
            else {
                lon = Math.PI - Math.asin(Math.sin(maxCartoLon) * Math.cos(maxCartoLat) / Math.cos(lat)) + centerRealLon;
            }
        }
        else {
            lon = -Math.asin(Math.sin(maxCartoLon) * Math.cos(maxCartoLat) / Math.cos(lat)) + centerRealLon;
        }

        lat = Math.round(lat * 180 / Math.PI *10)/10;
        lon = Math.round(lon * 180 / Math.PI*10)/10;
        convertedCoord.push(lat, lon);
        return convertedCoord;
    };

    /**
     * Determines if the north pole or south pole is visible
     * @param maxCartoLat - max visible cartographic latitude
     * @param centerRealLat - the center point of view in geographic coordinates
     * @returns {boolean}
     */
    CoordConversions.prototype.poleVisibility = function (maxCartoLat, centerRealLat) {
        var maxCarto = maxCartoLat * 180 / Math.PI;
        var centerReal = centerRealLat * 180 / Math.PI;

        if (centerReal >= 0) {
            return 90 - maxCarto + centerReal > 90;
        }
        else {
            return 90 - maxCarto - centerReal > 90;
        }
    };
    return CoordConversions;
});