define(['./Transformation',
    '../csvToGrid/Converter',
    './simpleheat'], function (Transformation, Converter) {

    var HeatmapPanel = function (wwd, navigator, controls) {
        this.wwd = wwd;
        this.navigator = navigator;
        this.controls = controls;
        this.myHeatmap = {};
        this.heats = {};
        var self = this;
        this.index = 0;
        $("#loadHeatmapBtn").on("click", function () {
            self.requestData();
        })
    };

    HeatmapPanel.prototype.requestData = function () {

        $("#loading").show();
        var self = this;
        var resourcesUrl = document.getElementById("HeatmapTxtArea").value;
        //var points = [[15.0877591, 37.5012762], [15.0877591, 37.5213762], [15.8877591, 36]];
        var delimiter = document.getElementById("HeatmapTxtDelimiter").value;
        var latColumn = Number(document.getElementById("latCSV").value);
        var lonColumn = Number(document.getElementById("lonCSV").value);
        var intensityColumn = Number(document.getElementById("intensityCSV").value);

        try {
            var promiseLoad = new Promise(function (resolve) {
                Converter.loadData(resourcesUrl, resolve, delimiter);
            });
        } catch (e) {
            $("#loading").hide();
            alert("Error occurred:" + e)
        }

        var points = [];
        var intensities = [];
        var min = Infinity;
        var max = -Infinity;

        promiseLoad.then(function (data) {
            $("#loading").hide();
            data.forEach(function (d) {
                var lat = Number(d[latColumn]);
                var lon = Number(d[lonColumn]);
                if (intensityColumn) {
                    var intensity = Number(d[intensityColumn]);
                    if (!isNaN(intensity)) {
                        intensities.push(intensity);
                        max = Math.max(intensity, max);
                        min = Math.min(intensity, min);
                    }
                }
                if (!isNaN(lat) && !isNaN(lon)) {
                    points.push([lat, lon]);
                }

            });

            intensities = intensities.map(function (i) {
                return ((i - min) / (max - min)) * 100;
            });

            self.addHeatmap(points, intensities);
        });
    };

    HeatmapPanel.prototype.addHeatmap = function (points, intensities) {

        var self = this;
        var wwd = this.wwd;


        var canvas = document.createElement("canvas");

        var c = wwd.canvas;
        canvas.width = c.width;
        canvas.height = c.height;
        var heat = simpleheat(canvas);


        heat.points = points;
        heat.intensities = intensities;
        heat.canvas = canvas;

        var heatmap = new WorldWind.SurfaceImage(new WorldWind.Sector(-90, 90, -180, 180),
            new WorldWind.ImageSource(canvas));


        var heatmapLayer = new WorldWind.RenderableLayer();


        this.heats[this.index] = heat;

        heatmapLayer.index = this.index++;
        heat.index = this.index;

        this.myHeatmap[this.index] = heatmapLayer;
        heatmapLayer.displayName = "Heatmap";
        heatmapLayer.addRenderable(heatmap);
        wwd.addLayer(heatmapLayer);

        var navigator = this.navigator;

        wwd.redraw();

        self.createInterface(wwd);

        navigator.handleWheelEvent = function (event) {
            this.worldWindow.navigator.getAsLookAt(this.worldWindow.globe, this.lookAt);

            var normalizedDelta;
            if (event.deltaMode == WheelEvent.DOM_DELTA_PIXEL) {
                normalizedDelta = event.deltaY;
            } else if (event.deltaMode == WheelEvent.DOM_DELTA_LINE) {
                normalizedDelta = event.deltaY * 40;
            } else if (event.deltaMode == WheelEvent.DOM_DELTA_PAGE) {
                normalizedDelta = event.deltaY * 400;
            }
            var scale = 1 + (normalizedDelta * 2 / 1000);

            // Apply the scale to this navigator's properties.
            this.lookAt.range *= scale;
            this.applyLimits();
            this.worldWindow.navigator.setAsLookAt(this.worldWindow.globe, this.lookAt);
            this.worldWindow.redraw();
            self.drawHeatmap(this.lookAt.range);
        };
        this.controls.heatmap = this.drawHeatmap.bind(this);

        wwd.goTo(new WorldWind.Position(points[0][1], points[0][0]),function(){
            self.drawHeatmap(navigator.lookAt.range);
        });
    };

    HeatmapPanel.prototype.drawHeatmap = function (range) {
        var wwd = this.wwd;
        var heats = this.heats;
        var canvas = wwd.canvas;

        for (var key in heats) {
            if (heats[key].canvas.height != canvas.height || heats[key].canvas.width != canvas.width) {
                heats[key].canvas.height = canvas.height;
                heats[key].canvas.width = canvas.width;
            }
        }
        var center = wwd.pickTerrain(new WorldWind.Vec2(canvas.width / 2, canvas.height / 2));

        if (!center.objects || !center.objects[0])
            return;
        center = center.objects[0].position;
        if (range > 10000000) {
            range = 10000000;
        }

        var l = range / Math.cos(Math.PI / 8);
        var base = Math.sqrt(Math.pow(l, 2) - Math.pow(range, 2));

        base = base / 100000;

        var minLat = center.latitude - base;
        var maxLat = center.latitude + base;
        var minLng = center.longitude - base;
        var maxLng = center.longitude + base;




        var ratio=canvas.width/canvas.height;

        while(ratio>((maxLng - minLng)/(maxLat - minLat))){

            maxLng+=0.1;
            minLng-=0.1;
        }

        while(ratio<((maxLng - minLng)/(maxLat - minLat))){
            maxLat+=0.1;
            minLat-=0.1;
        }

        var bufferLng = (maxLng - minLng) / 5;
        var bufferLat = (maxLat - minLat) / 5;

        var minLat = minLat - bufferLat,
            minLng = minLng - bufferLng,
            maxLat = maxLat + bufferLat,
            maxLng = maxLng + bufferLng;



        var bbox = {
            minLat: minLat,
            minLng: minLng,
            maxLat: maxLat,
            maxLng: maxLng
        };

        for (var key in this.myHeatmap) {
            var layerH = this.myHeatmap[key];
            layerH.renderables[0].sector.minLatitude = minLat;
            layerH.renderables[0].sector.minLongitude = minLng;
            layerH.renderables[0].sector.maxLatitude = maxLat;
            layerH.renderables[0].sector.maxLongitude = maxLng;
        }

        for (key in heats) {
            var heat = heats[key];

            var t = new Transformation();
            t.setPoints([[0, canvas.height], [0, 0], [canvas.width, 0], [canvas.width, canvas.height]],
                [[bbox.minLng, bbox.minLat], [bbox.minLng, bbox.maxLat], [bbox.maxLng, bbox.maxLat], [bbox.maxLng, bbox.minLat]]);

            heat.clear();
            heat.points.forEach(function (p, i) {
                if (bbox.minLat <= p[1] && p[1] <= bbox.maxLat && bbox.minLng <= p[0] && p[0] <= bbox.maxLng) {
                    var out = t.transform(p);
                    var x = out[0];
                    var y = out[1];
                    var int = heat.intensities[i];
                    heat.add([x, y, int]);
                }

            });
            heat.draw(0);
        }


        for (key in this.myHeatmap) {
            layerH = this.myHeatmap[key];
            layerH.renderables[0].imageSourceWasUpdated = true;
        }


    };

    HeatmapPanel.prototype.createInterface = function (wwd) {
        $("#HeatmapList").html("");
        var self = this;
        for (var key in self.myHeatmap) {
            var name = self.myHeatmap[key].displayName + " " + key;
            var myDiv = $("<div key=" + key + " class='listJson'>&#10060;" + name + "</div>");
            $("#HeatmapList").append(myDiv);
            myDiv.on('click', function () {
                var myKey = $(this).attr("key");
                wwd.removeLayer(self.myHeatmap[myKey]);
                wwd.redraw();
                $(this).remove();
                delete(self.myHeatmap[myKey]);
                delete(self.heats[myKey]);
            })

        }
    };

    return HeatmapPanel;
})
;
