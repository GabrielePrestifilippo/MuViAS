define(function () {
        var SurfaceImagePanel = function (wwd) {
            this.wwd = wwd;
            this.mySurfaceImage = {};
            var self = this;
            this.index = 0;
            $("#loadSurfaceImageBtn").on("click", function () {
                self.addTIFF(self.wwd);
            })
        };
        SurfaceImagePanel.prototype.addTIFF = function (wwd) {

            var self = this;

            var SurfaceImageLayer = new WorldWind.RenderableLayer("SurfaceImage");
            SurfaceImageLayer.index = this.index++;
            this.mySurfaceImage[this.index] = SurfaceImageLayer;

            $("#loading").show();
            try{
            var resourcesUrl = document.getElementById("SurfaceImageTxtArea").value;
            var minLat = document.getElementById("minLat").value;
            var maxLat = document.getElementById("maxLat").value;
            var minLng = document.getElementById("minLng").value;
            var maxLng = document.getElementById("maxLng").value;
            var surfaceImage = new WorldWind.SurfaceImage(new WorldWind.Sector(minLat, maxLat, minLng, maxLng),
                resourcesUrl);
            SurfaceImageLayer.addRenderable(surfaceImage);
            wwd.addLayer(SurfaceImageLayer);
            wwd.redraw();
            } catch (e) {
                $("#loading").hide();
                alert("Error occurred:" + e)
            }
            $("#loading").hide();
            self.createInterface(wwd);
            wwd.goTo(new WorldWind.Position(minLat,minLng));

        };

        SurfaceImagePanel.prototype.createInterface = function (wwd) {
            $("#SurfaceImageList").html("");
            var self = this;
            for (var key in self.mySurfaceImage) {
                var name = self.mySurfaceImage[key].displayName + " " + key;
                var myDiv = $("<div key=" + key + " class='listJson'>&#10060;" + name + "</div>");
                $("#SurfaceImageList").append(myDiv);
                myDiv.on('click', function () {
                    var myKey = $(this).attr("key");
                    wwd.removeLayer(self.mySurfaceImage[myKey]);
                    $(this).remove();
                    delete(self.mySurfaceImage[myKey]);
                })

            }
        };

        return SurfaceImagePanel;
    }
);
