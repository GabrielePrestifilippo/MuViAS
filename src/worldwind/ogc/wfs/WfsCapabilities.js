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
 * @exports WfsCapabilities
 */

define([
        '../../error/ArgumentError',
        '../../util/Logger',
        '../../ogc/ows/OwsWfsOperationsMetadata',
        '../../ogc/ows/OwsWfsServiceIdentification',
        '../../ogc/ows/OwsWfsServiceProvider',
        '../../ogc/ows/OwsWfsKeywords',
        '../../ogc/ows/OwsWfsConstraint'
    ],

    function (ArgumentError,
              Logger,
              OwsWfsOperationsMetadata,
              OwsWfsServiceIdentification,
              OwsWfsServiceProvider,
              OwsWfsKeywords,
              OwsWfsConstraint) {
        "use strict";

        /**
         * Constructs an OGC Wfs Capabilities instance from an XML DOM.
         * @alias WfsCapabilities
         * @constructor
         * @classdesc Represents the common properties of a Wfs Capabilities document. Common properties are parsed and
         * mapped to a plain javascript object model. Most fields can be accessed as properties named according to their
         * document names converted to camel case. This model supports version 1.0.0, 1.1.0 and 2.0.0 of the Wfs specification.
         * Not all properties are mapped to this representative javascript object model, but the provided XML dom is
         * maintained in xmlDom property for reference.
         * @param {{}} xmlDom an XML DOM representing the Wfs Capabilities document.
         * @throws {ArgumentError} If the specified XML DOM is null or undefined.
         */
        var WfsCapabilities = function (xmlDom) {
            if (!xmlDom) {
                throw new ArgumentError(
                    Logger.logMessage(Logger.LEVEL_SEVERE, "WfsCapabilities", "constructor", "missingDom"));
            }

            /**
             * The original unmodified XML document. Referenced for use in advanced cases.
             * @type {{}}
             */
            this.xmlDom = xmlDom;

            this.assembleDocument();
        };


        WfsCapabilities.prototype.assembleDocument = function () {
            // Determine version and update sequence
            var root = this.xmlDom.documentElement;

            this.version = root.getAttribute("version");
            this.updateSequence = root.getAttribute("updateSequence");
        // Wfs 1.0.0 does not utilize OWS Common GetCapabilities service and capability descriptions.
            if (this.version === "1.0.0") {
                this.assembleDocument100(root);
            }
            else if (this.version === "1.1.0" || this.version === "2.0.0") {
                this.assembleDocument200x(root);
            }
            else {
                throw new ArgumentError(Logger.logMessage(Logger.LEVEL_SEVERE, "WfsCapabilities", "assembleDocument", "unsupportedVersion"));
            }
        };

        /**
         * It assembles Get Capability request for version 1.0.0
         @param {XmlElement} Root element of Capability request
         @private
         @returns null
         */
        WfsCapabilities.prototype.assembleDocument100 = function (root) {
            var children = root.children || root.childNodes;
            for (var c = 0; c < children.length; c++) {
                var child = children[c];
                if (child.localName === "Service") {
                    this.Service = this.assembleService100(child);
                } else if (child.localName === "Capability") {
                    this.capability = this.assembleCapability100(child);
                } else if (child.localName === "FeatureTypeList") {
                    this.assembleFeatureType(child);
                } else if (child.localName === "Filter_Capabilities") {
                    this.filterCapabilities = this.assembleContents100(child);
                }
            }
        };
        /**
         * It assembles Get Capability request for version 2.0.0 and 1.0.0
         @param {XmlElement} Root element of Capability request
         @private
         @returns null
         */
        WfsCapabilities.prototype.assembleDocument200x = function (root) {
         //   console.log(root);
            var children = root.children || root.childNodes;

            for (var c = 0; c < children.length; c++) {
                 var child = children[c];
                if (child.localName === "ServiceIdentification") {
                    this.serviceWfsIdentification = new OwsWfsServiceIdentification(child);
                } else if (child.localName === "ServiceProvider") {
                    this.serviceProvider = new OwsWfsServiceProvider(child);
                } else if (child.localName === "OperationsMetadata") {
                    this.operationsMetadata = new OwsWfsOperationsMetadata(child);
                } else if (child.localName === "FeatureTypeList") {
                    this.assembleFeatureType(child);
                } else if (child.localName === "Filter_Capabilities") {
                    this.filterCapabilities = this.assembleFilterCapabilities(child);
                }
            }
        };

        /**
         * It assembles Feature Type List
         @param {XmlElement} FeatureTypeList
         @private
         @returns null
         */

        WfsCapabilities.prototype.assembleFeatureType = function (element) {
            var children = element.children || element.childNodes;
            for (var c = 0; c < children.length; c++) {
                var child = children[c];
                if (child.localName === "FeatureType") {
                    this.featureType = this.featureType || [];
                    this.featureType.push(this.assembleFeatureTypeAttributes(child));
                } else if (child.localName === "Operations") {
                    this.Operations = this.assembleOperations100(child);
                }
            }
        };

        /**
         * It assembles Operation for version 1.0.0
         @param {XmlElement} Operations
         @private
         @returns null
         */
        WfsCapabilities.prototype.assembleOperations100 = function (element) {

            var children = element.children || element.childNodes;
            for (var c = 0; c < children.length; c++) {
                var child = children[c];
                this.operations = this.operations || []
                this.operations.push(child.localName);
            }

        };


        /**
         * It assembles Filter_Capabilities
         @param {XmlElement} Filter_Capabilities
         @private
         @returns null
         */
        WfsCapabilities.prototype.assembleContents100 = function (element) {
            var children = element.children || element.childNodes;
            for (var c = 0; c < children.length; c++) {
                var child = children[c];
                if (child.localName === "Spatial_Capabilities") {
                    this.spatialCapabilities = this.assembleSpatialCapabilities(child);
                } else if (child.localName === "Scalar_Capabilities") {
                    this.scalarCapabilities = this.assembleScalarCapabilities(child);
                }
            }
        };

        /**
         * It assembles SpatialCapabilities
         @param {XmlElement} Spatial_Capabilities
         @private
         @returns {Object} spatialCap
         */

        WfsCapabilities.prototype.assembleSpatialCapabilities = function (element) {
            var children = element.children || element.childNodes, spatialCap = {};
            for (var c = 0; c < children.length; c++) {
                var child = children[c];
                if (child.localName === "Spatial_Operators") {
                    spatialCap.spop = this.assembleOperator100(child);
                } else if (child.localName === "GeometryOperands") {
                    spatialCap.geop = this.getOperatorName(child);
                } else if (child.localName === "SpatialOperators") {
                    spatialCap.spop = this.getOperatorName(child);
                }
            }
            return spatialCap;
        };

        /**
         * It assembles Spatial_Operators
         @param {XmlElement} Spatial_Operators
         @private
         @returns {Object} Operator
         */
        WfsCapabilities.prototype.assembleOperator100 = function (element) {
            var Operator = [];
            var children = element.children || element.childNodes;
            for (var c = 0; c < children.length; c++) {
                var child = children[c];
                Operator.name = Operator.name || [];
                Operator.name.push(child.localName);
            }
            return Operator;
        };

        /**
         * It assembles Scalar_Capabilities
         @param {XmlElement} Scalar_Capabilities
         @private
         @returns {Object} scalarCap
         */

        WfsCapabilities.prototype.assembleScalarCapabilities = function (element) {

            var children = element.children || element.childNodes, scalarCap = {};
            for (var c = 0; c < children.length; c++) {
                var child = children[c];
                if (child.localName === "Logical_Operators") {
                    scalarCap.logicalOperators = child.localName;
                } else if (child.localName === "Comparison_Operators") {
                    scalarCap.comparison_Operators = this.assembleOperator100(child);
                } else if (child.localName === "Arithmetic_Operators") {
                    scalarCap.arithmetic_Operators = this.assembleArthmeticOperator(child);
                } else if (child.localName === "ComparisonOperators") {
                    scalarCap.comparisonOperators = this.getOperatorName(child);
                } else if (child.localName === "LogicalOperators") {
                    scalarCap.logicalOperators = child.localName;
                } else if (child.localName === "ArithmeticOperators") {
                    scalarCap.arithmeticOperators = this.assembleArthmeticOperator(child);
                }
            }
            return scalarCap;
        };

        /**
         * It assembles Arthmetic Operator
         @param {XmlElement} ArithmeticOperators or Arithmetic_Operators
         @private
         @returns {Object} arithmeticOp
         */
        WfsCapabilities.prototype.assembleArthmeticOperator = function (element) {
            var children = element.children || element.childNodes, arithmeticOp = {};
            for (var c = 0; c < children.length; c++) {
                var child = children[c];
                if (child.localName === "Simple_Arithmetic") {
                    arithmeticOp.simpleArithmetic = child.localName;
                } else if (child.localName === "Functions") {
                    arithmeticOp.functions = this.assembleFunction100(child);
                }
            }
            return arithmeticOp;
        };

        /**
         * It assembles Functions for version 1.0.0
         @param {XmlElement} Functions
         @private
         @returns {Object} Name of function
         */
        WfsCapabilities.prototype.assembleFunction100 = function (element) {
            var children = element.children || element.childNodes, func = {};
            var child = children[0];
            var children1 = child.children1 || child.childNodes;
            for (var c = 0; c < children1.length; c++) {
                var child1 = children1[c];
                func.functionName = func.functionName || [];
                func.functionName.push(this.nameArgument(child1));
            }
            return func;
        };


        /**
         * It assembles Functions for version 1.0.0
         @param {XmlElement} Functions
         @private
         @returns func1{} Name of function and no of arguments
         */

        WfsCapabilities.prototype.nameArgument = function (element) {
            var func1 = {};
            func1.name = element.textContent;
            func1.nArgs = element.getAttribute("nArgs");
            return func1;
        };
        /**
         * It assembles Attributes of Feature Type
         @param {XmlElement} FeatureType
         @private
         @returns {Object} FeatureType(name,title,keywords,SRS,latLongBoundingBox,abstract,keywordList)
         */
        WfsCapabilities.prototype.assembleFeatureTypeAttributes = function (element) {
            var children = element.children || element.childNodes, FeatureType = {};
            for (var c = 0; c < children.length; c++) {
                var child = children[c];
                if (child.localName === "Name") {
                    FeatureType.name = child.textContent;
                } else if (child.localName === "Title") {
                    FeatureType.title = child.textContent;
                } else if (child.localName === "Keywords") {
                    FeatureType.keywords = new OwsWfsKeywords(child);
                } else if (child.localName === "SRS") {
                    FeatureType.SRS = child.textContent;
                } else if (child.localName === "LatLongBoundingBox") {
                    FeatureType.latLongBoundingBox = this.assembleLatLonBoundingBox(child);
                } else if (child.localName === "Abstract") {
                    FeatureType.abstract = child.textContent;
                } else if (child.localName === "KeywordList") {
                    FeatureType.keywordList = new OwsWfsKeywords(child);
                } else if (child.localName === "DefaultCRS") {
                    FeatureType.defaultCRS = child.textContent;
                } else if (child.localName === "DefaultSRS") {
                    FeatureType.defaultSRS = child.textContent;
                } else if (child.localName === "WGS84BoundingBox") {
                    FeatureType.wgs84BoundingBox = this.assembleBoundingBox(child);
                }
            }
            return FeatureType;
        };

        /**
         * It assembles Latitude and Longitude of BoundingBox
         @param {XmlElement} FeatureType
         @private
         @returns {Object} bBox(minx, miny, maxx, maxy)
         */
        WfsCapabilities.prototype.assembleLatLonBoundingBox = function (bboxElement) {
            var bBox = {};
            bBox.minx = bboxElement.getAttribute("minx");
            bBox.miny = bboxElement.getAttribute("miny");
            bBox.maxx = bboxElement.getAttribute("maxx");
            bBox.maxy = bboxElement.getAttribute("maxy");
            return bBox;
        };

        /**
         * It assembles Service for version 1.0.0
         @param {XmlElement} FeatureType
         @private
         @returns {Object} service(name, title, abstract, keywords, accessConstraints, fees, onlineResource)
         */
        WfsCapabilities.prototype.assembleService100 = function (element) {
            var children = element.children || element.childNodes, service = {};
            for (var c = 0; c < children.length; c++) {
                var child = children[c];
                if (child.localName === "Name") {
                    service.name = child.textContent;
                } else if (child.localName === "Title") {
                    service.title = child.textContent;
                } else if (child.localName === "Abstract") {
                    service.abstract = child.textContent;
                } else if (child.localName === "Keywords") {
                    service.keywords = child.textContent;
                } else if (child.localName === "AccessConstraints") {
                    service.accessConstraints = child.textContent;
                } else if (child.localName === "Fees") {
                    service.fees = child.textContent;
                } else if (child.localName === "OnlineResource") {
                    service.onlineResource = child.textContent;
                }
            }

            return service;
        };

        /**
         * It assembles Capability for version 1.0.0
         @param {XmlElement} Capability
         @private
         @returns {Object} Capability
         */
        WfsCapabilities.prototype.assembleCapability100 = function (element) {
            var children = element.children || element.childNodes, capability = {};
            for (var c = 0; c < children.length; c++) {
                var child = children[c];
                if (child.localName === "Request") {
                    capability.request = this.assembleRequestCapabilities100(child);
                }
            }
            return capability;
        };

        /**
         * It assembles RequestCapabilities for version 1.0.0
         @param {XmlElement} Capability
         @private
         @returns {Object) request name and request element
         */
        WfsCapabilities.prototype.assembleRequestCapabilities100 = function (element) {
            var children = element.children || element.childNodes, request = {};
            for (var c = 0; c < children.length; c++) {
                var child = children[c];

                request.name = request.name || [];
                request.name.push(child.localName);
                request.request = request.request || [];
                request.request.push(this.assembleDCPType100(child));
                }

            return request;
        };

        /**
         * It assembles DCP Type for version 1.0.0
         @param {XmlElement} request
         @private
         @returns {Object} dcpType
         */
        WfsCapabilities.prototype.assembleDCPType100 = function (element) {
            var children = element.children || element.childNodes, dcpType = {};
            for (var c = 0; c < children.length; c++) {
                var child = children[c];
                if (child.localName === "DCPType") {
                    this.assembleHttp100(child, dcpType);
                } else if (child.localName === "ResultFormat") {
                    dcpType.resultFormat = this.assembleResultFormat100(child);
                } else if (child.localName === "SchemaDescriptionLanguage") {
                    dcpType.schemaDescriptionLanguage = this.assembleSchemaDescriptionLanguage(child);
                }
            }
            return dcpType;
        };

        /**
         * It assembles Result Format for version 1.0.0
         @param {XmlElement} ResultFormat
         @private
         @returns {Object} resultFormat
         */
        WfsCapabilities.prototype.assembleResultFormat100 = function (element) {
            var resultFormat = {};
            var children = element.children || element.childNodes;
            for (var c = 0; c < children.length; c++) {
                var child = children[c];
                resultFormat.resfom = resultFormat.resfom || [];
                resultFormat.resfom.push(child.localName);
            }
            return resultFormat;
        };
        /**
         * It assembles Result Format for version 1.0.0
         @param {XmlElement} SchemaDescriptionLanguage
         @private
         @returns {String} name of SchemaDescriptionLanguage
         */
        WfsCapabilities.prototype.assembleSchemaDescriptionLanguage = function (element) {
            var SchemaDescriptionLanguage = {};
            var children = element.children || element.childNodes;
            var child = children[0];
            SchemaDescriptionLanguage.name = child.localName;
            return child.localName;

        };

        /**
         * It assembles HTTP for version 1.0.0
         @param {XmlElement} DCPType
         @private
         @returns {function} assembleMethod100
         */
        WfsCapabilities.prototype.assembleHttp100 = function (element, dcpType) {
            var children = element.children || element.childNodes;
            for (var c = 0; c < children.length; c++) {
                var child = children[c];
                if (child.localName === "HTTP") {
                    return this.assembleMethod100(child, dcpType);
                }
            }
        };

        /**
         * It assembles HTTP for version 1.0.0
         @param {XmlElement} HTTP
         @private
         @returns {function} assembleOnlineResource100
         */
        WfsCapabilities.prototype.assembleMethod100 = function (element, dcpType) {
            var children = element.children || element.childNodes;
            for (var c = 0; c < children.length; c++) {
                var child = children[c];
                if (child.localName === "Get") {
                    dcpType["get"] = this.assembleOnlineResource100(child);
                } else if (child.localName === "Post") {
                    dcpType["post"] = this.assembleOnlineResource100(child);
                }
            }
        };

        /**
         * It calculate name of Online Resources for version 1.0.0
         @param {XmlElement} Get or Post
         @private
         @returns {String} name of onlineResource
         */
        WfsCapabilities.prototype.assembleOnlineResource100 = function (element) {

            return element.getAttribute("onlineResource");
        };

        /**
         * It assembles Bounding box
         @param {XmlElement} WGS84BoundingBox
         @private
         @returns {Object} boundingBox
         */
        WfsCapabilities.prototype.assembleBoundingBox = function (element) {
            var boundingBox = {};
            var children = element.children || element.childNodes;
            for (var c = 0; c < children.length; c++) {
                var child = children[c];
                if (child.localName === "LowerCorner") {
                    var lc = child.textContent.split(" ");
                    boundingBox.lowerCorner = [parseFloat(lc[0]), parseFloat(lc[1])];
                } else if (child.localName === "UpperCorner") {
                    var uc = child.textContent.split(" ");
                    boundingBox.upperCorner = [parseFloat(uc[0]), parseFloat(uc[1])];
                }
            }

            return boundingBox;
        };

        /**
         * It assembles Filter Capabilities
         @param {XmlElement} Filter_Capabilities
         @private
         @returns {Object} filterCap
         */
        WfsCapabilities.prototype.assembleFilterCapabilities = function (element) {
            var filterCap = {};
            var children = element.children || element.childNodes;
            for (var c = 0; c < children.length; c++) {
                var child = children[c];
                if (child.localName === "Conformance") {
                    filterCap.conformance = this.assembleConformance(child);
                }
                else if (child.localName === "Id_Capabilities") {
                    filterCap.idCap = this.assembleIdCapabilities(child);
                }
                else if (child.localName === "Scalar_Capabilities") {
                    filterCap.assCap = this.assembleScalarCapabilities(child);
                }
                else if (child.localName === "Spatial_Capabilities") {
                    filterCap.assSpCap = this.assembleSpatialCapabilities(child);
                }
                else if (child.localName === "Temporal_Capabilities") {
                    filterCap.temporalCap = this.assembleTemporalCapabilities(child);
                }
                else if (child.localName === "Functions") {
                    filterCap.func = this.assembleFunctions(child);
                }

            }
            return filterCap;
        };
        /**
         * It assembles Conformance
         @param {XmlElement} Conformance
         @private
         @returns {Object} Constraints
         */
        WfsCapabilities.prototype.assembleConformance = function (element) {
            var Constraints = {};
            var children = element.children || element.childNodes;
            for (var c = 0; c < children.length; c++) {
                var child = children[c];
                Constraints.constraints = Constraints.constraints || [];
                Constraints.constraints.push(new OwsWfsConstraint(child));

            }
            return Constraints;
        };

        /**
         * It assembles Id Capabilities
         @param {XmlElement} IdCapabilities
         @private
         @returns {Object} ResourceIdentifier
         */
        WfsCapabilities.prototype.assembleIdCapabilities = function (element) {

            var children = element.children || element.childNodes, ResourceIdentifier = {};
            for (var c = 0; c < children.length; c++) {
                var children1 = children[c];
                if (children1.localName === "ResourceIdentifier") {
                    ResourceIdentifier.resourceIdentifierName = ResourceIdentifier.resourceIdentifierName || [];
                    ResourceIdentifier.resourceIdentifierName.push(children1.getAttribute("name"));
                }
            }
            return ResourceIdentifier;
        };

        /**
         * It assembles gives Names of the children of an element
         @param {XmlElement} Parent element
         @private
         @returns {Object} Operators
         */
        WfsCapabilities.prototype.getOperatorName = function (element) {

            var children = element.children || element.childNodes, Operators = {}, child;

            for (var c = 0; c < children.length; c++) {
                child = children[c];
                if (child.textContent) {
                    Operators.attributeName = Operators.attributeName || [];
                    Operators.attributeName.push(child.textContent);

                }
                else {
                    Operators.attributeName = Operators.attributeName || [];
                    Operators.attributeName.push(child.getAttribute("name"));
                }
            }
            return Operators;
        };

        /**
         * It assembles Temporal Capabilities
         @param {XmlElement} Temporal_Capabilities
         @private
         @returns {Object} Temporal Capabilities
         */
        WfsCapabilities.prototype.assembleTemporalCapabilities = function (element) {
            var tmpCap = {};
            var children = element.children || element.childNodes;
            for (var c = 0; c < children.length; c++) {
                var child = children[c];
                if (child.localName === "TemporalOperands") {
                    tmpCap.temporalOperands = this.getOperatorName(child);
                }
                else if (child.localName === "TemporalOperators") {
                    tmpCap.temporalOperator = this.getOperatorName(child);
                }
            }
            return tmpCap;
        };

        /**
         * It assembles Functions
         @param {XmlElement} Function
         @private
         @returns {Object} Function
         */
        WfsCapabilities.prototype.assembleFunctions = function (element) {
            var children = element.children || element.childNodes, Function = {Name: [], subChild: []};
            for (var c = 0; c < children.length; c++) {
                var child = children[c];
                Function.Name[c] = child.getAttribute("name");
                Function.subChild[c] = this.assembleFunctionsSubChild(child);
            }

            return Function;
        };

        /**
         * It assembles Functions Sub Childs
         @param {XmlElement} Function
         @private
         @returns {Object} subChild
         */
        WfsCapabilities.prototype.assembleFunctionsSubChild = function (element) {
            var children = element.children || element.childNodes, subChild = {};
            for (var c = 0; c < children.length; c++) {
                var Child = children[c];
                if (Child.localName === "Returns") {
                    subChild.retValue = Child.textContent;
                }
                else if (Child.localName === "Arguments") {
                    subChild.funcArg = this.assembleFunctionArguments(Child);
                }

            }
            return subChild;
        };

        /**
         * It assembles Functions Arguments
         @param {XmlElement} Arguments
         @private
         @returns {Object} argument
         */
        WfsCapabilities.prototype.assembleFunctionArguments = function (element) {

            var children = element.children || element.childNodes, argument = {name: [], type: []};
            for (var c = 0; c < children.length; c++) {
                var child = children[c];
                if (child.localName === "Argument") {
                    argument.name[c] = child.getAttribute("name");
                    var child1 = child.children || element.childNodes;
                    var child2 = child1[0]
                    argument.type[c] = child2.textContent;
                }
            }
            return argument;
        };
        return WfsCapabilities;
    });