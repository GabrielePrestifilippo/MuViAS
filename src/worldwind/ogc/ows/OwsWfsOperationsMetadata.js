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
 * @exports OwsWfsOperationsMetadata
 */
define([
        '../../error/ArgumentError',
        '../../util/Logger',
        '../../ogc/ows/OwsWfsConstraint'
    ],
    function (ArgumentError,
              Logger,
              OwsWfsConstraint) {
        "use strict";

        /**
         * Constructs an OWS Operations Metadata instance from an XML DOM.
         * @alias OwsWfsOperationsMetadata
         * @constructor
         * @classdesc Represents an OWS Operations Metadata section of an OGC capabilities document.
         * This object holds as properties all the fields specified in the OWS Operations Metadata section.
         * Most fields can be accessed as properties named according to their document names converted to camel case.
         * For example, "operations".
         * @param {Element} element An XML DOM element representing the OWS Service Provider section.
         * @throws {ArgumentError} If the specified XML DOM element is null or undefined.
         */
        var OwsWfsOperationsMetadata = function (element) {
            if (!element) {
                throw new ArgumentError(
                    Logger.logMessage(Logger.LEVEL_SEVERE, "OwsWfsOperationsMetadata", "constructor", "missingDomElement"));
            }

            var children = element.children || element.childNodes;
            for (var c = 0; c < children.length; c++) {
                var child = children[c];

                if (child.localName === "Operation") {
                    this.operation = this.operation || [];
                    this.operation.push(OwsWfsOperationsMetadata.prototype.assembleOperation(child));
                }
                else if (child.localName === "Constraint") {
                    this.Constraint = this.Constraint || [];
                    this.Constraint.push(new OwsWfsConstraint(child));
                }
            }

        };


        OwsWfsOperationsMetadata.prototype.assembleOperation = function (element) {
            var operation = {};

            operation.name = element.getAttribute("name");
            var children = element.children || element.childNodes;
            for (var c = 0; c < children.length; c++) {
                var child = children[c];

                if (child.localName === "DCP") {
                    operation.dcp = operation.dcp || [];
                    operation.dcp.push(OwsWfsOperationsMetadata.prototype.assembleDcp(child));
                }

                else if (child.localName === "Parameter") {
                    operation.Parameter = operation.Parameter || [];
                    operation.Parameter.push(OwsWfsOperationsMetadata.prototype.assembleParameterVal(child));
                }
                else if (child.localName === "Constraints") {
                    operation.Constraints = operation.Constraints || [];
                    operation.Constraints.push(new OwsWfsConstraint(child));
                }

            }

            return operation;
        };

        OwsWfsOperationsMetadata.prototype.assembleDcp = function (element) {
            var dcp = {};

            var children = element.children || element.childNodes;
            for (var c = 0; c < children.length; c++) {
                var child = children[c];

                if (child.localName === "HTTP") {
                    var httpMethods = child.children || child.childNodes;
                    for (var c2 = 0; c2 < httpMethods.length; c2++) {
                        var httpMethod = httpMethods[c2];

                        if (httpMethod.localName === "Get") {
                            dcp.getMethods = dcp.getMethods || [];
                            dcp.getMethods.push(OwsWfsOperationsMetadata.prototype.assembleMethod(httpMethod));
                        } else if (httpMethod.localName === "Post") {
                            dcp.postMethods = dcp.postMethods || [];
                            dcp.postMethods.push(OwsWfsOperationsMetadata.prototype.assembleMethod(httpMethod));
                        }
                    }
                }
            }

            return dcp;
        };

        OwsWfsOperationsMetadata.prototype.assembleMethod = function (element) {
            var result = {};

            result.url = element.getAttribute("xlink:href");

            var children = element.children || element.childNodes;
            for (var c = 0; c < children.length; c++) {
                var child = children[c];

                if (child.localName === "Constraint") {
                    result.constraint = result.constraint || [];
                    result.constraint.push(new OwsConstraint(child));
                }
            }

            return result;
        };
        OwsWfsOperationsMetadata.prototype.assembleParameterVal = function (element) {
            var children = element.children || element.childNodes, parVal = {};
            parVal.name = element.getAttribute("name");
            for (var c = 0; c < children.length; c++) {
                var child = children[c];
                parVal.allowedValues = new OwsWfsConstraint(child);
            }
            return parVal;
        };

        return OwsWfsOperationsMetadata;
    });