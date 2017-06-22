define(function () {
        var KMLPanel = function (wwd,KmlFile) {
            this.wwd = wwd;
            this.KmlFile=KmlFile;
            this.myKML = {};
            var self = this;
            this.index = 0;
            $("#loadKMLBtn").on("click", function () {
                self.addTIFF(self.wwd);
            })
        };
        KMLPanel.prototype.addTIFF = function (wwd) {

            var self = this;

            var KMLLayer = new WorldWind.RenderableLayer("KML");
            KMLLayer.index = this.index++;
            this.myKML[this.index] = KMLLayer;

            $("#loading").show();
            var resourcesUrl = document.getElementById("KMLTxtArea").value;
            var kmlFilePromise = new this.KmlFile(resourcesUrl);
            kmlFilePromise.then(function (kmlFile) {

                KMLLayer.addRenderable(kmlFile);

                wwd.addLayer(KMLLayer);
                wwd.redraw();
                $("#loading").hide();
                self.createInterface(wwd);
            });
        };

        KMLPanel.prototype.createInterface = function (wwd) {
            $("#KMLList").html("");
            var self = this;
            for (var key in self.myKML) {
                var name = self.myKML[key].displayName + " " + key;
                var myDiv = $("<div key=" + key + " class='listJson'>&#10060;" + name + "</div>");
                $("#KMLList").append(myDiv);
                myDiv.on('click', function () {
                    var myKey = $(this).attr("key");
                    wwd.removeLayer(self.myKML[myKey]);
                    $(this).remove();
                    delete(self.myKML[myKey]);
                })

            }
        };

        return KMLPanel;
    }
);
