define(function () {
        var KMLPanel = function (wwd, KmlFile) {
            this.wwd = wwd;
            this.KmlFile = KmlFile;
            this.myKML = {};
            var self = this;
            this.index = 0;

            this.fileTypeKML = 1;
            $("#fileTypeKML").change(function () {
                var val = $("#fileTypeKML").val();
                if (val == "0") {
                    $("#csv-KML").show();
                    $("#KMLTxtArea").hide();
                    self.fileTypeKML = 0;
                } else if (val == "1") {
                    $("#csv-KML").hide();
                    $("#KMLTxtArea").show();
                    self.fileTypeKML = 1;
                }
            });

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
            try {

                if (this.fileTypeKML === 0) {
                    var resourcesUrl = $("#csv-KML").get(0).files[0];
                } else {
                    var resourcesUrl = document.getElementById("KMLTxtArea").value;
                }

                var kmlFilePromise = new this.KmlFile(resourcesUrl);
            } catch (e) {
                $("#loading").hide();
                alert("Error occurred:" + e)
            }

            kmlFilePromise.then(function (kmlFile) {

                KMLLayer.addRenderable(kmlFile);
                wwd.addLayer(KMLLayer);

                wwd.redraw();
                $("#loading").hide();
                self.createInterface(wwd);
                try {
                    var el = kmlFile.node.children[0];
                    el = $(el).find("Folder").children();
                    el = $(el).find("LookAt").children();
                    var lng = el[0].textContent;
                    var lat = el[1].textContent;
                    wwd.goTo(new WorldWind.Position(lat, lng));
                } catch (e) {
                    console.log("cannot find psoition of KML")
                }

            }).catch(function (e) {
                $("#loading").hide();
                alert("Error occurred:" + e)
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
                    wwd.redraw();
                })

            }
        };

        return KMLPanel;
    }
);
