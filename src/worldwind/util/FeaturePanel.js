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
 * @exports FeaturePanel
 */
define(function () {
    "use strict";

    /**
     * Constructs a servers panel.
     * @alias FeaturePanel
     * @constructor
     * @classdesc Provides a list of collapsible panels that indicate the features associated with a wfs or other
     * image server. Currently only wfs is supported. The user can select a server's features and they will be added to
     * the WorldWindow's layer list.
     * @param {WorldWindow} worldWindow The WorldWindow to associate this features panel with.
     * @param {featuresPanel} featuresPanel The features panel managing the specified WorldWindows layer list.
     */
    var FeaturePanel = function (worldWindow, featuresPanel, timeSeriesPlayer) {
        var thisFeaturePanel = this;

        this.wwd = worldWindow;
        this.featuresPanel = thisFeaturePanel;


        this.idCounter = 1;

        this.legends = {};

        $("#addServerBox1").find("button").on("click", function (e) {
            thisFeaturePanel.onAddServerButton(e);
        });

        $("#addServerText1").on("keypress", function (e) {
            thisFeaturePanel.onAddServerTextKeyPress($(this), e);
        });
    };

    FeaturePanel.prototype.onAddServerButton = function (event) {
        this.attachServer($("#addServerText1")[0].value);
        $("#addServerText1").val("");
    };

    FeaturePanel.prototype.onAddServerTextKeyPress = function (searchInput, event) {
        if (event.keyCode === 13) {
            searchInput.blur();
            this.attachServer($("#addServerText1")[0].value);
            $("#addServerText1").val("");
        }
    };

    FeaturePanel.prototype.attachServer = function (serverAddress) {
        if (!serverAddress) {
            return;
        }

        serverAddress = serverAddress.trim();

        // Search for 'https' or 'http' (case insensitive) and substitute it for lowercase 'https'
        serverAddress = serverAddress.replace(/https|http/i, "http");
        if (serverAddress.lastIndexOf("http", 0) != 0) {
            serverAddress = "http://" + serverAddress;
        }
console.log(serverAddress);
        var thisWfs = this,
            request = new XMLHttpRequest();
          // url = WorldWind.wfsUrlBuilder.fixGetMapString(serverAddress);
     var url=serverAddress;
    url += "/ows?service=wfs&version=2.0.0&request=getCapabilities";
 //   console.log(url);

        request.open("GET", url, true);
        request.onreadystatechange = function () {
            if (request.readyState === 4 && request.status === 200) {
                var xmlDom = request.responseXML;

                if (!xmlDom && request.responseText.indexOf("<?xml") === 0) {
                    xmlDom = new window.DOMParser().parseFromString(request.responseText, "text/xml");
                }

                if (!xmlDom) {
                    alert(serverAddress + " retrieval failed. It is probably not a wfs server.");
                    return;
                }

                var wfsCapsDoc = new WorldWind.WfsCapabilities(xmlDom);

                if (wfsCapsDoc.version) { // if no version, then the URL doesn't point to a caps doc.
                    thisWfs.addFeaturePanel(serverAddress, wfsCapsDoc);
                } else {
                    alert(serverAddress +
                        " wfs capabilities document invalid. The server is probably not a wfs server.");
                }
            } else if (request.readyState === 4) {
                if (request.statusText) {
                    alert(request.responseURL + " " + request.status + " (" + request.statusText + ")");
                } else {
                    alert("Failed to retrieve wfs capabilities from " + serverAddress + ".");
                }
            }
        };

        request.send(null);
    };



    var shapeConfigurationCallback = function (geometry, properties) {
        var configuration = {};

        if (geometry.isPointType() || geometry.isMultiPointType()) {
            configuration.attributes = new WorldWind.PlacemarkAttributes(placemarkAttributes);

            if (properties && (properties.name || properties.Name || properties.NAME)) {
                configuration.name = properties.name || properties.Name || properties.NAME;
            }
            if (properties && properties.POP_MAX) {
                var population = properties.POP_MAX;
                configuration.attributes.imageScale = 0.01 * Math.log(population);
            }
        }
        else if (geometry.isLineStringType() || geometry.isMultiLineStringType()) {
            configuration.attributes = new WorldWind.ShapeAttributes(null);
            configuration.attributes.drawOutline = true;
            configuration.attributes.outlineColor = new WorldWind.Color(
                0.1 * configuration.attributes.interiorColor.red,
                0.3 * configuration.attributes.interiorColor.green,
                0.7 * configuration.attributes.interiorColor.blue,
                1.0);
            configuration.attributes.outlineWidth = 1.0;
        }
        else if (geometry.isPolygonType() || geometry.isMultiPolygonType()) {
            configuration.attributes = new WorldWind.ShapeAttributes(null);

            // Fill the polygon with a random pastel color.
            configuration.attributes.interiorColor = new WorldWind.Color(
                255,
                255,
                255,
                1);
            // Paint the outline in a darker variant of the interior color.
            configuration.attributes.outlineColor = new WorldWind.Color(
                255 ,
                0,
                0,
                1.0);
        }

        return configuration;
    };

    var parserCompletionCallback = function (layer) {
        wwd.addLayer(layer);
    };

    FeaturePanel.prototype.addFeaturePanel = function (serverAddress, wfsCapsDoc) {

        var treeId = this.idCounter++,
            headingID = this.idCounter++,
            collapseID = this.idCounter++,
            panelTitle = "WFS"//wfsCapsDoc.serviceWfsIdentification.titles[0].value && wfsCapsDoc.serviceWfsIdentification.titles[0].value.length > 0 ? wfsCapsDoc.serviceWfsIdentification.titles[0].value : serverAddress;
        //
        //var html = '<div class="panel panel-default">';
        //html += '<div class="panel-heading" role="tab" id="' + headingID + '">';
        //html += '<h4 class="panel-title wrap-panel-heading">';
        ////html += '<a data-toggle="collapse" data-parent="#servers"';
        //html += '<a data-toggle="collapse"';
        //html += ' href="#' + collapseID + '"';
        //html += ' aria-expanded="true" aria-controls="' + collapseID + '">';
        //html += serverAddress;
        //html += '</a></h4></div>';
        //html += '<div id="' + collapseID + '" class="panel-collapse collapse in"';
        //html += ' role="tabpanel" aria-labelledby="' + headingID + '">';
        //html += '<div class="panel-body">';
        //html += 'This is some text to display in the collapse panel.';
        //html += '</div></div></div>';

        var topDiv = $('<div class="panel panel-default"></div>'),
            heading = $('<div class="panel-heading" role="tab" id="' + headingID + '"></div>'),
            title = $('<h4 class="panel-title wrap-panel-heading"></h4>'),
            anchor = $('<a data-toggle="collapse" href="#' + collapseID + '"' +
                ' aria-expanded="true" aria-controls="' + collapseID + '">' + panelTitle + '</a>'),
            remove = $('<a href="#"><small><span class="pull-right glyphicon glyphicon-remove clickable_space"></span></small></a>'),
            bodyParent = $('<div id="' + collapseID + '" class="panel-collapse collapse in" role="tabpanel"' +
                ' aria-labelledby="' + headingID + '"></div>'),
            body = $('<div style="max-height: 250px; overflow-y: scroll; -webkit-overflow-scrolling: touch;"></div>'),
            treeDiv = this.makeTree(serverAddress, treeId);

        remove.on("click", function () {
            topDiv.remove();
        });

        title.append(anchor);
        title.append(remove);
        heading.append(title);
        topDiv.append(heading);
        body.append(treeDiv);
        bodyParent.append(body);
        topDiv.append(bodyParent);

        var serversItem = $("#servers");
        serversItem.append(topDiv);

        var treeRoot = treeDiv.fancytree("getRootNode");

        // Don't show the top-level layer if it's a grouping layer with the same title as the server title.
        // The NEO server is set up this way, for example.
        var features = wfsCapsDoc.featureType;
         treeRoot.addChildren(this.assemblefeatures(features, []));

        // Collapse grouping nodes if there are many of them.
        var numNodes = 0;
        treeRoot.visit(function (node) {
            ++numNodes;
        });
        if (numNodes > 10) {
            treeRoot.visit(function (node) {
                node.setExpanded(false);
            });
        }
    };

    FeaturePanel.prototype.makeTree = function (serverAddress, treeId) {
        var thisFeaturePanel = this,
            treeDivId = "treeDiv" + treeId,
            treeDataId = "treeData" + treeId,
            treeDiv = $('<div id="' + treeDivId + '">'),
            treeUl = $('<ul id="' + treeDataId + 'style="display: none;">');

        treeDiv.append(treeUl);

        treeDiv.fancytree({
            click: function (event, data) {
                var node = data.node,
                    layer = node.data.layer;

                if (layer) {
                    node.setSelected(false); // only an argument of false causes the select method to be called?
                    return false;
                }
            },
            select: function (event, data) {
                var node = data.node,
                    layer = node.data.layer;

                if (layer) {
                    if (!node.selected) {
                        node.data.layer = null;
                        thisFeaturePanel.removeLayer(layer);
                    }
                    //layer.enabled = node.selected;
                } else if (node.selected && node.data.layerCaps && node.data.layerCaps.name) {
                    node.data.layer = thisFeaturePanel.addLayer(node.data.layerCaps,serverAddress);
                }

                thisFeaturePanel.wwd.redraw();
                return false;
            }
        });
        treeDiv.fancytree("option", "checkbox", true);
        treeDiv.fancytree("option", "icons", false);

        $("form").submit(false);

        return treeDiv;
    };

    FeaturePanel.prototype.assemblefeatures = function (features, result) {

        for (var i = 0; i < features.length; i++) {
            var layer = features[i],
                subfeatures = null,
                node = {
                    title: layer.title,
                    tooltip: layer.title,
                    layerCaps: layer
                };

            if (layer.features && layer.features.length > 0) {
                subfeatures = this.assemblefeatures(layer.features, []);
            }

            if (!layer.name) {
                node.expanded = true;
                node.unselectable = true;
                node.hideCheckbox = true;
                node.folder = true;
            }

            if (subfeatures) {
                node.children = subfeatures;
            }

            result.push(node);
        }

        return result;
    };

    FeaturePanel.prototype.addLayer = function (layerCaps,serverAddress) {
        if (layerCaps.name) {
            var resourcesUrl1 =serverAddress+"/wfs?request=GetFeature&outputFormat=application/json&version=1.1.0&typeName="+layerCaps.name;
            var wfsLayer = new WorldWind.RenderableLayer(layerCaps.name);
            var wfsGetFeature = new WorldWind.GeoJSONParser(resourcesUrl1);
            wfsGetFeature.load(null, shapeConfigurationCallback, wfsLayer);

            var thisglobe=this.wwd
            wfsLayer.enabled = true;
            this.wwd.addLayer(wfsLayer);
            try {
                setTimeout(function () {
                    thisglobe.layers[thisglobe.layers.length - 1].renderables[0]._boundaries[0][0].altitude=10000
                    thisglobe.goTo(thisglobe.layers[thisglobe.layers.length - 1].renderables[0]._boundaries[0][0])
                }, 2000)
            }catch(e){
                console.log(e)
            }
            this.wwd.redraw();

            this.featuresPanel.synchronizeLayerList();

            return wfsLayer;
        }

        return null;
    };

    FeaturePanel.prototype.removeLayer = function (layer) {
        this.removeLegend(layer.companionLayer);

        this.wwd.removeLayer(layer);
        //if (layer.companionLayer) {
        //    this.wwd.removeLayer(layer.companionLayer);
        //}

        if (this.timeSeriesPlayer && this.timeSeriesPlayer.layer === layer) {
            this.timeSeriesPlayer.timeSequence = null;
            this.timeSeriesPlayer.layer = null;
        }

        this.wwd.redraw();
        this.featuresPanel.synchronizeLayerList();
    };

    FeaturePanel.prototype.addLegend = function (legendCaps) {
        var legend = this.legends[legendCaps.url];

        if (legend) {
            ++legend.refCount;
            legend.layer.enabled = true;
        } else {
            legend = {refCount: 1, legendCaps: legendCaps};
            legend.layer = new WorldWind.RenderableLayer();

            var dummyOffset = new WorldWind.Offset(WorldWind.OFFSET_FRACTION, 0, WorldWind.OFFSET_FRACTION, 0),
                screenImage = new WorldWind.ScreenImage(dummyOffset, legendCaps.url);
            screenImage.imageOffset =
                new WorldWind.Offset(WorldWind.OFFSET_FRACTION, 0, WorldWind.OFFSET_INSET_PIXELS, 0);
            legend.layer.addRenderable(screenImage);
            legend.layer.hide = true;
            legend.layer.refCount = 0;
            this.wwd.addLayer(legend.layer);

            this.legends[legendCaps.url] = legend;

            this.updateLegendOffsets();
        }

        ++legend.layer.refCount;

        return legend.layer;
    };

    FeaturePanel.prototype.removeLegend = function (legendLayer) {
        for (var legendKey in this.legends) {
            if (this.legends.hasOwnProperty(legendKey)) {
                var legend = this.legends[legendKey];
                if (legend.layer === legendLayer) {
                    --legend.refCount;
                    --legend.layer.refCount;
                    if (legend.refCount <= 0) {
                        this.wwd.removeLayer(legend.layer);
                        delete this.legends[legend.legendCaps.url];
                    }
                    break;
                }
            }
        }

        this.updateLegendOffsets();
    };

    FeaturePanel.prototype.updateLegendOffsets = function () {
        var yOffset = 0,
            verticalMargin = 5;

        for (var legendKey in this.legends) {
            if (this.legends.hasOwnProperty(legendKey)) {
                var legend = this.legends[legendKey],
                    screenImage = legend.layer.renderables[0];

                screenImage.screenOffset =
                    new WorldWind.Offset(WorldWind.OFFSET_FRACTION, 0, WorldWind.OFFSET_INSET_PIXELS, yOffset);

                yOffset += legend.legendCaps.height + verticalMargin;

            }
        }
    };

    return FeaturePanel;
});