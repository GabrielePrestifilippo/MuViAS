define(function () {
    var GeoJSONPanel = function (wwd) {
        this.wwd = wwd;
        this.myJsons = {};
        var self = this;
        this.index = 0;
        $("#loadGeoJsonBtn").on("click", function () {
            self.addJSON(self.wwd);
        })
    };
    GeoJSONPanel.prototype.addJSON = function (wwd) {

        // Set up the common placemark attributes.
        var placemarkAttributes = new WorldWind.PlacemarkAttributes(null);
        placemarkAttributes.imageScale = 0.05;
        placemarkAttributes.imageColor = WorldWind.Color.WHITE;
        placemarkAttributes.labelAttributes.offset = new WorldWind.Offset(
            WorldWind.OFFSET_FRACTION, 0.5,
            WorldWind.OFFSET_FRACTION, 1.5);
        placemarkAttributes.imageSource = WorldWind.configuration.baseUrl + "images/white-dot.png";

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
                    0.375 + 0.5 * Math.random(),
                    0.375 + 0.5 * Math.random(),
                    0.375 + 0.5 * Math.random(),
                    0.7);
                // Paint the outline in a darker variant of the interior color.
                configuration.attributes.outlineColor = new WorldWind.Color(
                    0.5 * configuration.attributes.interiorColor.red,
                    0.5 * configuration.attributes.interiorColor.green,
                    0.5 * configuration.attributes.interiorColor.blue,
                    1.0);
            }

            return configuration;
        };


        var geoJSONLayer = new WorldWind.RenderableLayer("GeoJSON");
        geoJSONLayer.index = this.index++;
        wwd.addLayer(geoJSONLayer);
        this.myJsons[this.index] = geoJSONLayer;


        function callback(l){
            var pos=l.renderables[0].boundaries[0];
            wwd.goTo(pos);
        }
        var geoJSON = new WorldWind.GeoJSONParser(document.getElementById("geoJsonTxtArea").value);
        geoJSON.load(callback, shapeConfigurationCallback, geoJSONLayer);
        wwd.redraw();
        this.createInterface(wwd);

    };

    GeoJSONPanel.prototype.createInterface = function (wwd) {
        $("#GeoJSONList").html("");
        var self = this;
        for (var key in self.myJsons) {
            var name =self.myJsons[key].displayName+" "+key;
            var myDiv = $("<div key="+key+" class='listJson'>&#10060;" + name + "</div>");
            $("#GeoJSONList").append(myDiv);
            myDiv.on('click', function () {
                var myKey=$(this).attr("key");
                wwd.removeLayer(self.myJsons[myKey]);
                $(this).remove();
                delete(self.myJsons[myKey]);
                wwd.redraw();
            });

        }
    };

    return GeoJSONPanel;
});
