/*
 * Copyright 2015-2017 WorldWind Contributors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use OwsWfsConst file except in compliance with the License.
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
 * @exports OwsWfsConstraint
 */
define([
        '../../error/ArgumentError',
        '../../util/Logger'
    ],
    function (ArgumentError,
              Logger) {
        "use strict";

        /**
         * Constructs an OWS Constraint instance from an XML DOM.
         * @alias OwsWfsConstraint
         * @constructor
         * @classdesc Represents an OWS Constraint element of an OGC capabilities document.
         * OwsWfsConst object holds as properties all the fields specified in the OWS Constraint definition.
         * Fields can be accessed as properties named according to their document names converted to camel case.
         * For example, "operation".
         * @param {Element} element An XML DOM element representing the OWS Constraint element.
         * @throws {ArgumentError} If the specified XML DOM element is null or undefined.
         */
        var OwsWfsConstraint = function (element) {
            if (!element) {
                throw new ArgumentError(Logger.logMessage(Logger.LEVEL_SEVERE, "OwsWfsConstraint", "constructor", "missingDomElement"));
            }
            //console.log(element);
            if (element.hasAttribute("name")) {
                this.name = element.getAttribute("name");
            }

            var children = element.children || element.childNodes;
//            console.log(children.length);
            for (var c = 0; c < children.length; c++) {
                var child = children[c];
                if (child.localName === "AllowedValues") {
                    var childrenValues = child.children || child.childNodes;
                    for (var cc = 0; cc < childrenValues.length; cc++) {
                        if (childrenValues[cc].localName === "Value") {
                            this.allowedValues = this.allowedValues || [];
                            this.allowedValues.push(childrenValues[cc].textContent);
                        }
                    }
                } else if (child.localName === "DefaultValue") {
                    // console.log("DefaultValue");
                    //console.log(this.child.textContent);
                    this.defaultValue = child.textContent;
                    //console.log(this.defaultValue);
                } else if (child.localName === "NoValues") {
                    this.NoValues = "true";
                }
                // TODO: ValuesReference

            }

        };

        return OwsWfsConstraint;
    });