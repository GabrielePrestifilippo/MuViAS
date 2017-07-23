define(['./MarkerCluster'], function (MarkerCluster) {
    var MarkersPanel = function (wwd, navigator, controls) {
        this.wwd = wwd;
        this.myMarkers = {};
        var self = this;
        this.index = 0;

        this.controls = controls;

        this.fileTypeMarkers = 0;
        $("#fileTypeMarkers").change(function () {
            var val = $("#fileTypeMarkers").val();
            if (val == "0") {
                $("#csv-Markers").hide();
                $("#markersUrl").show();
                self.fileTypeMarkers = 0;
            } else {
                $("#csv-Markers").show();
                $("#markersUrl").hide();
                self.fileTypeMarkers = 1;
            }

        });
        $("#loadMarkersBtn").on("click", function () {
            self.addMarkers(self.wwd);
        })


    };
    MarkersPanel.prototype.addMarkers = function (wwd) {

        var self = this;
        if (this.fileTypeMarkers == 1) {
            var resourcesUrl = $("#csv-Markers").get(0).files[0];
        } else {
            var resourcesUrl = document.getElementById("markersUrl").value;
        }
        resourcesUrl = resourcesUrl.replace(/ /g, '');


        var markerCluster = new MarkerCluster(wwd, {
            name: "Cluster",
            controls: self.controls,
            navigator: wwd.controller,
            maxLevel: 7,
            clusterSources: ["images/marker/low.png",
                "images/marker/medium.png",
                "images/marker/high.png",
                "images/marker/vhigh.png"]
        });

        this.myMarkers[this.index] = markerCluster.layer;

        getJSON(resourcesUrl, function (results) {
            markerCluster.generateJSONCluster(results);
        });

        function getJSON(url, callback) {
            var xhr = new XMLHttpRequest();
            xhr.open('GET', url, true);
            xhr.responseType = 'json';
            xhr.setRequestHeader('Accept', 'application/json');
            xhr.onload = function () {
                if (xhr.readyState === 4 && xhr.status >= 200 && xhr.status < 300 && xhr.response) {
                    callback(xhr.response);
                }
            };
            xhr.send();
        }

        wwd.redraw();
        this.createInterface(wwd);

    };

    MarkersPanel.prototype.createInterface = function (wwd) {
        $("#MarkersList").html("");
        var self = this;
        for (var key in self.myMarkers) {
            var name = self.myMarkers[key].displayName + " " + key;
            var myDiv = $("<div key=" + key + " class='listJson'>&#10060;" + name + "</div>");
            $("#MarkersList").append(myDiv);
            myDiv.on('click', function () {
                var myKey = $(this).attr("key");
                wwd.removeLayer(self.myMarkers[myKey]);
                $(this).remove();
                delete(self.myMarkers[myKey]);
                wwd.redraw();
            });

        }
    };

    return MarkersPanel;
});
