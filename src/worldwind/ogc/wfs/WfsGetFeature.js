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
 * @exports WfsGetFeature
 */

define([
        '../../error/ArgumentError',
        '../../util/Logger',
    ],

    function (ArgumentError,
              Logger
    ) {
        "use strict";

        /**
         * Constructs an OGC Get Feature instance from an XML DOM.
         * @alias WfsGetFeature
         * @constructor
         * @classdesc Represents the common properties of a Wfs Capabilities document. Common properties are parsed and
         * mapped to a plain javascript object model. Most fields can be accessed as properties named according to their
         * document names converted to camel case. This model supports version 1.0.0 and 2.0.x of the Get Feature.
         * Not all properties are mapped to this representative javascript object model, but the provided XML dom is
         * maintained in xmlDom property for reference.
         * @param {{}} xmlDom an XML DOM representing the Wfs Capabilities document.
         * @throws {ArgumentError} If the specified XML DOM is null or undefined.
         */
        var WfsGetFeature = function (xmlDom) {
            if (!xmlDom) {
                throw new ArgumentError(
                    Logger.logMessage(Logger.LEVEL_SEVERE, "WfsGetFeature", "constructor", "missingDom"));
            }

            /**
             * The original unmodified XML document. Referenced for use in advanced cases.
             * @type {{}}
             */
            this.xmlDom = xmlDom;

            this.assembleDocument();


        };


        WfsGetFeature.prototype.assembleDocumentAttribute = function (element) {

            if (element.hasAttribute("numberMatched")) {
                this.numberMatched = element.getAttribute("numberMatched");
            }
            if (element.hasAttribute("numberReturned")) {
                this.numberReturned = element.getAttribute("numberReturned");
            }
            if (element.hasAttribute("timeStamp")) {
                this.timestamp = element.getAttribute("timeStamp");
            }
            if (element.hasAttribute("numberOfFeatures")) {
                this.numberOfFeatures = element.getAttribute("numberOfFeatures");
            }


        };

        WfsGetFeature.prototype.assembleDocument = function () {
            var root = this.xmlDom.documentElement;
            this.assembleDocumentAttribute(root);
            var members = {};
            var children = root.children || root.childNodes;
            for (var c = 0; c < children.length; c++) {
                var child = children[c];

                if (child.localName === "member") {
                    this.member = this.member || [];
                    this.member.push(this.assembleMember(child));
                }
                else if (child.localName === "featureMember") {

                    this.featureMembers = this.featureMembers || [];
                    this.featureMembers.push(this.assembleFeatureMembers(child));
                }
                else if (child.localName === "featureMembers") {

                    this.featureMembers = this.featureMembers || [];
                    this.featureMembers.push(this.assembleFeatureMembers(child));
                }
                else if (child.localName === "boundedBy") {
                    this.boundedBy = this.boundedBy || [];
                    this.boundedBy.push(this.assembleBoundedBy(child));
                    // console.log(this.boundedBy);
                }
            }
        };


        WfsGetFeature.prototype.assembleMember = function (element) {
            var member = {};
            var children = element.children || element.childNodes;
            for (var c = 0; c < children.length; c++) {
                var child = children[c];
                member.featureName = child.localName;
                member.id = child.getAttribute("gml:id");
                member.featuresAttributes = member.featuresAttributes || [];
                member.featuresAttributes.push(this.assembleFeatureAttributes(child));

            }
            return member;
        };


        WfsGetFeature.prototype.assembleFeatureMembers = function (element) {
            var fMember = {};
            var children = element.children || element.childNodes;
            for (var c = 0; c < children.length; c++) {
                var child = children[c];
                fMember.featuresAttributes = fMember.featuresAttributes || [];
                fMember.featuresAttributes.push(this.assembleFeatureMemberAttributes(child));

            }
            return fMember;
        };

        WfsGetFeature.prototype.assembleBoundedBy = function (element) {
            var boundedBy = {};
            var children = element.children || element.childNodes;
            for (var c = 0; c < children.length; c++) {
                var child = children[c];
                boundedBy.boundedBy = boundedBy.boundedBy || [];
                boundedBy.boundedBy.push(child.textContent);
            }
            return boundedBy;
        };

        WfsGetFeature.prototype.assembleFeatureAttributes = function (element) {

            var feature = {};
            var children = element.children || element.childNodes;
            for (var c = 0; c < children.length; c++) {

                var child = children[c];

                if (child.localName === "the_geom") {
                    feature.geom = this.assembleGeom(child);
                }
                else {
                    feature.subFeature = feature.subFeature || [];
                    feature.subFeature.push(this.assembleSubFeatures(child));
                }
            }
            return feature;
        };

        WfsGetFeature.prototype.assembleFeatureMemberAttributes = function (element) {

            var feature = {};
            feature.featureName = element.nodeName;
            //   console.log(element);
            var item = 0;
            feature.id = element.attributes.item(0).nodeValue;
            var children = element.children || element.childNodes;
            for (var c = 0; c < children.length; c++) {
                var child = children[c];
                if (child.localName === "the_geom") {
                    feature.geom = this.assembleMemberGeom(child);
                }
                else {
                    feature.subFeature = feature.subFeature || [];
                    feature.subFeature.push(this.assembleSubFeatures(child));
                }
            }
            return feature;
        };

        WfsGetFeature.prototype.assembleSubFeatures = function (element) {
            var temp = {};
            temp.name = element.localName
            temp.value = element.textContent;
            return temp;
        };


        WfsGetFeature.prototype.assembleGeom = function (element) {

            var geom = {};
            var children = element.children || element.childNodes;
            for (var c = 0; c < children.length; c++) {
                var child = children[c];
                if (child.localName === "Point") {
                    geom.srsName = child.getAttribute("srsName");
                    geom.srsDimension = child.getAttribute("srsDimension");
                }
                else if (child.localName === "pos") {
                    geom.pos = child.textContent;
                }
            }
            return geom;
        };

        WfsGetFeature.prototype.assembleMemberGeom = function (element) {

            var geom = {};
            var child = element.firstChild;
            if (child.localName === "MultiPolygon") {
                geom.polygonSrsName = child.getAttribute("srsName");
                var children = child.children || child.childNodes;
                for (var c = 0; c < children.length; c++) {
                    var child1 = children[c];
                    geom.cordList = geom.cordList || [];
                    geom.cordList.push(this.assembleList(child1));
                }
            }
            else if(child.localName ==="MultiSurface") {
                geom.surfaceSrsName = child.getAttribute("srsName");
                var children = child.children || child.childNodes;
                for (var c = 0; c < children.length; c++) {
                    var child1 = children[c];
                    geom.posList = geom.posList || [];
                    geom.posList.push(this.assembleList(child1));
                }
            }
            return geom;
        };

        WfsGetFeature.prototype.assembleList = function (element) {
            var list ={};
            var child = element.firstChild;
            while (child != null) {

                if (child.localName === "coordinates") {
                    list.cordinates = child.textContent;

                }
                else if (child.localName === "posList") {
                    list.posList = child.textContent;
                }
                child = child.firstChild;
            }
            return list;
        };
        return WfsGetFeature;
    }
);