/*
 * Copyright 2018 WorldWind Contributors
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
 * @exports WfsService
 */
define([
        '../../error/ArgumentError',
        '../../util/Logger',
        '../../util/Promise',
        '../../ogc/wfs/wfsCapabilities',
        '../../ogc/wfs/wfsGetFeature',
    ],
    function (ArgumentError,
              Logger,
              Promise,
              wfsCapabilities,
              wfsGetFeature,
              ) {
        "use strict";

        /**
         * Provides a list of Features from a Web Feature Service including the capabilities and Feature description
         * documents. For automated configuration, utilize the create function which provides a Promise with a fully
         * configured WfsService.
         * @constructor
         */
        var WfsService = function () {

            /**
             * The URL for the Web Feature Service
             */
            this.serviceAddress = null;

            /**
             * A collection of the Features available from this service. Not populated until service is initialized by
             * the connect method.
             * @type {Array}
             */
            this.Features = [];

            /**
             * The wfs GetCapabilities document for this service.
             * @type {wfsCapabilities}
             */
            this.capabilities = null;

            /**
             * A map of the Features to their corresponding DescribeFeature documents.
             * @type {wfsFeatureDescriptions}
             */
            this.FeatureDescriptions = null;
        };

        /**
         * The XML namespace for wfs version 1.0.0.
         * @type {string}
         */
        WfsService.wfs_XLMNS = "http://www.opengis.net/wfs";

        /**
         * The XML namespace for wfs version 2.0.0 and 2.0.1.
         * @type {string}
         */
        WfsService.wfs_2_XLMNS = "http://www.opengis.net/wfs/2.0";

        /**
         * Contacts the Web Feature Service specified by the service address. This function handles version negotiation
         * and capabilities and describe Feature document retrieval. The return is a Promise to a fully initialized
         * WfsService which includes an array of wfsFeature objects available from this service.
         * @param serviceAddress the url of the WfsService
         * @returns {PromiseLike<WfsService>}
         */
        WfsService.create = function (serviceAddress) {
            if (!serviceAddress) {
                throw new ArgumentError(
                    Logger.logMessage(Logger.LEVEL_SEVERE, "WfsService", "constructor", "missingUrl"));
            }

            var service = new WfsService();
            service.serviceAddress = serviceAddress;

            return service.retrieveCapabilities()
                .then(function (wfsCapabilities) {
                    service.capabilities = wfsCapabilities;
                    return service.retrieveFeatureDescriptions(wfsCapabilities);
                })
                .then(function (Features) {
                    service.parseFeatures(Features);
                    return service;
                });
        };

        /**
         * Returns the Feature associated with the provided id or name
         * @param FeatureId the requested Feature id or name
         * @returns {wfsFeature}
         */
        WfsService.prototype.getFeature = function (FeatureId) {
            // TODO
        };

        // Internal use only
        WfsService.prototype.retrieveCapabilities = function () {
            var self = this, version;

            return self.retrieveXml(self.buildCapabilitiesXmlRequest("2.0.1"))
                .then(function (xmlDom) {
                    // Check if the server supports our preferred version of 2.0.1
                    version = xmlDom.documentElement.getAttribute("version");
                    if (version === "2.0.1" || version === "2.0.0") {
                        return xmlDom;
                    } else {
                        // If needed, try the server again with a 1.0.0 request
                        return self.retrieveXml(self.buildCapabilitiesXmlRequest("1.0.0"));
                    }
                })
                // Parse the result
                .then(function (xmlDom) {
                    return new wfsCapabilities(xmlDom);
                });
        };

        // Internal use only
        WfsService.prototype.retrieveFeatureDescriptions = function () {
            return this.retrieveXml(this.buildDescribeFeatureXmlRequest());
        };

        // Internal use only
        WfsService.prototype.parseFeatures = function (xmlDom) {
            this.FeatureDescriptions = new wfsFeatureDescriptions(xmlDom);
            var FeatureCount = this.FeatureDescriptions.Features.length;

            for (var i = 0; i < FeatureCount; i++) {
                this.Features.push(this.FeatureDescriptions.Features[i]);
            }
        };

        // Internal use only
        WfsService.prototype.retrieveXml = function (request) {
            return new Promise(function (resolve, reject) {
                var xhr = new XMLHttpRequest();
                xhr.open("POST", request.url);
                xhr.onreadystatechange = function () {
                    if (xhr.readyState === 4) {
                        if (xhr.status === 200) {
                            resolve(xhr.responseXML);
                        } else {
                            reject(new Error(
                                Logger.logMessage(Logger.LEVEL_WARNING,
                                    "XML retrieval failed (" + xhr.statusText + "): " + request.url)));
                        }
                    }
                };
                xhr.onerror = function () {
                    reject(new Error(
                        Logger.logMessage(Logger.LEVEL_WARNING, "XML retrieval failed: " + request.url)));
                };
                xhr.ontimeout = function () {
                    reject(new Error(
                        Logger.logMessage(Logger.LEVEL_WARNING, "XML retrieval timed out: " + request.url)));
                };
                xhr.send(request.body);
            });
        };

        // Internal use only
        WfsService.prototype.buildCapabilitiesXmlRequest = function (version) {
            var capabilitiesElement = this.createBasewfsElement("GetCapabilities", version);

            return {
                url: this.serviceAddress,
                body: new XMLSerializer().serializeToString(capabilitiesElement)
            };
        };

        // Internal use only
        WfsService.prototype.buildDescribeFeatureXmlRequest = function () {
            var version = this.capabilities.version, describeElement, FeatureElement, requestUrl,
                FeatureCount = this.capabilities.Features.length;

            describeElement = this.createBasewfsElement("DescribeFeature", version);
            if (version === "1.0.0") {
                requestUrl = this.capabilities.capability.request.describeFeature.get;
            } else if (version === "2.0.1" || version === "2.0.0") {
                requestUrl = this.capabilities.operationsMetadata.getOperationMetadataByName("DescribeFeature").dcp[0].getMethods[0].url;
            }

            for (var i = 0; i < FeatureCount; i++) {
                if (version === "1.0.0") {
                    FeatureElement = document.createElementNS(WfsService.wfs_XLMNS, "Feature");
                    FeatureElement.appendChild(document.createTextNode(this.capabilities.Features[i].name));
                } else if (version === "2.0.1" || version === "2.0.0") {
                    FeatureElement = document.createElementNS(WfsService.wfs_2_XLMNS, "FeatureId");
                    FeatureElement.appendChild(document.createTextNode(this.capabilities.Features[i].FeatureId));
                }
                describeElement.appendChild(FeatureElement);
            }

            return {
                url: requestUrl,
                body: new XMLSerializer().serializeToString(describeElement)
            };
        };

        // Internal use only
        WfsService.prototype.createBasewfsElement = function (elementName, version) {
            var el;

            if (version === "1.0.0") {
                el = document.createElementNS(WfsService.wfs_XLMNS, elementName);
                el.setAttribute("version", "1.0.0");
            } else if (version === "2.0.1" || version === "2.0.0") {
                el = document.createElementNS(WfsService.wfs_2_XLMNS, elementName);
                el.setAttribute("version", version);
            }

            el.setAttribute("service", "wfs");

            return el;
        };

        return WfsService;
    });
