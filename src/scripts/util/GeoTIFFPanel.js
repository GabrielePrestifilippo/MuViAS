define(function () {
        var GeoTIFFPanel = function (wwd) {
            this.wwd = wwd;
            this.myTiff = {};
            var self = this;
            this.index = 0;

            $("#loadGeoTIFFBtn").on("click", function () {
                self.addTIFF(self.wwd);
            })
        };
        GeoTIFFPanel.prototype.addTIFF = function (wwd) {

            var self = this;

            var geoTiffLayer = new WorldWind.RenderableLayer("GeoTiff");
            geoTiffLayer.index = this.index++;
            this.myTiff[this.index] = geoTiffLayer;

            $("#loading").show();


            var resourcesUrl = document.getElementById("geoTIFFTxtArea").value;


            var geotiffObject = new WorldWind.GeoTiffReader(resourcesUrl);
            try {
                var geoTiffImage = geotiffObject.readAsImage(function (canvas) {
                    var surfaceGeoTiff = new WorldWind.SurfaceImage(
                        geotiffObject.metadata.bbox,
                        new WorldWind.ImageSource(canvas)
                    );

                    geoTiffLayer.addRenderable(surfaceGeoTiff);
                    wwd.addLayer(geoTiffLayer);
                    wwd.redraw();
                    $("#loading").hide();
                    self.createInterface(wwd);
                    wwd.goTo(new WorldWind.Position(geotiffObject.metadata.bbox.minLatitude, geotiffObject.metadata.bbox.minLongitude));
                });
            } catch (e) {
                $("#loading").hide();
                alert("Error occurred:" + e)
            }
        };

        GeoTIFFPanel.prototype.createInterface = function (wwd) {
            $("#GeoTIFFList").html("");
            var self = this;
            for (var key in self.myTiff) {
                var name = self.myTiff[key].displayName + " " + key;
                var myDiv = $("<div key=" + key + " class='listJson'>&#10060;" + name + "</div>");
                $("#GeoTIFFList").append(myDiv);
                myDiv.on('click', function () {
                    var myKey = $(this).attr("key");
                    wwd.removeLayer(self.myTiff[myKey]);
                    $(this).remove();
                    delete(self.myTiff[myKey]);
                    wwd.redraw();
                });
            }
        };

        return GeoTIFFPanel;
    }
);
