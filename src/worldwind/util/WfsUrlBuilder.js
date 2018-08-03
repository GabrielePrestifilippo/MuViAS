/*
 * Copyright 2015-2017 WorldWind Contributors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/**
 * @exports WfsUrlBuilder
 */
define([
        '../error/ArgumentError',
        '../util/Logger'
    ],
    function (ArgumentError,
              Logger) {
        "use strict";


        var WfsUrlBuilder = function (serviceAddress, propertyName,typeName, wfsVersion, outputFormat, FEATUREID, FILTER) {
            if (!serviceAddress || (serviceAddress.length === 0)) {
                throw new ArgumentError(
                    Logger.logMessage(Logger.LEVEL_SEVERE, "WfsUrlBuilder", "constructor",
                        "The Wfs service address is missing."));
            }

            if (!typeName || (typeName.length === 0)) {
                throw new ArgumentError(
                    Logger.logMessage(Logger.LEVEL_SEVERE, "WfsUrlBuilder", "constructor",
                        "The Wfs feature name are not specified."));
            }


            this.serviceAddress = serviceAddress;

            this.typeNames = typeName;

            this.wfsVersion = (wfsVersion && wfsVersion.length > 0) ? wfsVersion : "1.0.0";
            this.isWms110Greater = this.wfsVersion >= "2.0.0";

            if (this.isWms110Greater) {
                this.crs = "EPSG:4326";
            }

            this.propertyName = propertyName;
            this.outputFormat = outputFormat;
            this.FEATUREID = FEATUREID;
            this.FILTER = FILTER;
        };

        /**
         * Creates the URL string for a Wfs Get Map request.
         * @param {String} tile The tile for which to create the URL.
         * @param {String} imageFormat The image format to request.
         * @throws {ArgumentError} If the specified tile or image format are null or undefined.
         */
        WfsUrlBuilder.prototype.urlForGetFeature = function (typeName, outputFormat) {
            if (!typeName) {
                throw new ArgumentError(
                    Logger.logMessage(Logger.LEVEL_SEVERE, "WfsUrlBuilder", "urlForFeature", "missingtypeName"));
            }

            if (!outputFormat) {
                throw new ArgumentError(
                    Logger.logMessage(Logger.LEVEL_SEVERE, "WfsUrlBuilder", "urlForFeature",
                        "The output feature format is null or undefined."));
            }

         var sb = WfsUrlBuilder.fixGetFeatureString(this.serviceAddress);

            if (this.isWms110Greater) {
                if (sb.search(/service=Wfs/i) < 0) {
                    sb = sb + "service=wfs";
                }
                sb = sb + "&version=" + this.wfsVersion;
                sb = sb + "&typenames=" + this.typenames;
                sb = sb + "&filter=" + this.filter;
            }
            else {
                sb = sb + "&request=GetFeature";
                sb = sb + "&version=" + this.wfsVersion;
                sb = sb + "&typeName=" + typeName;
                sb = sb + "&propertyName=" + this.propertyName;
               // sb = sb + "&outputFormat=" + outputFormat;
              //  sb = sb + "&FEATUREID=" + this.FEATUREID;
             //   sb = sb + "&FILTER=" + this.FILTER;
       //         sb = sb + sector.minLongitude + "," + sector.minLatitude + ",";
         //       sb = sb + sector.maxLongitude + "," + sector.maxLatitude + ",";
              //  sb = sb + this.crs;
            }

        return sb;
    };

// Intentionally not documented.
     WfsUrlBuilder.fixGetFeatureString = function (serviceAddress) {
     if (!serviceAddress) {
          throw new ArgumentError(
            Logger.logMessage(Logger.LEVEL_SEVERE, "WfsUrlBuilder", "fixGetFeatureString",
                "The specified service address is null or undefined."));
    }

    var index = serviceAddress.indexOf("?");

    if (index < 0) { // if string contains no question mark
        serviceAddress = serviceAddress + "?"; // add one
    } else if (index !== serviceAddress.length - 1) { // else if question mark not at end of string
        index = serviceAddress.search(/&$/);
        if (index < 0) {
            serviceAddress = serviceAddress + "&"; // add a parameter separator
        }
    }

    return serviceAddress;
};

return WfsUrlBuilder;
});