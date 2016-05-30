define(['myScripts/Correlation'], function (Correlation) {

    var UserInterface = function (parent) {
        this.parent = parent;
    };
    UserInterface.prototype.start = function () {
        var gInterface = this.parent;
        this.oldValLng = [0, gInterface.dim.y * gInterface.sub];
        this.oldValLat = [0, gInterface.dim.x * gInterface.sub];
        this.oldValAlt = [0, gInterface.activeLayers];
        this.oldValTime = 0;
        this.startSlider(gInterface);


        var correlation;

        if (gInterface.config[0].data.length > 1) {
            var promiseCorrelation = new Promise(function (resolve) {
                Correlation.getCorrelationDatasets(resolve, gInterface.times, gInterface.config);
            });

            promiseCorrelation.then(function (correlation) {
                var correlationVal = Number(Math.round(correlation + 'e7') + 'e-7');
                if (!correlationVal) {
                    correlationVal = "unavailable";
                }
                var text;
                if (gInterface.config[1]) {
                    text = "datasets";
                } else {
                    text = "variables";
                }
                $("#correlation").text("Correlation between " + text + ": " + correlationVal);
            });
        }





    };
    UserInterface.prototype.disableNewData = function () {
        $("#compare").attr("disabled", true);
        $("#compareOptions").hide();
    };
    UserInterface.prototype.resetTime = function (val) {
        var gInterface = this.parent;
        gInterface.startHeight = val;
        gInterface.changeAltitude(this.oldValAlt);
        gInterface.changeTime(0);
        $('#sliderTime').slider("value", 0);
        $("#timeSpan").html(gInterface.allTime[0]);
    };
    UserInterface.prototype.alert = function (text) {
        var alertBox = $("#alert");
        alertBox.css("visibility", "visible");
        alertBox.css("opacity", 1);
        $("#alertContent").html(text);
    };
    UserInterface.prototype.startSlider = function (gInterface) {
        var self = this;
        var rect = gInterface.rect;

        var sliderLng = $("#sliderLng");
        var spanLng = $('#LngSpan');

        var sliderLat = $("#sliderLat");
        var spanLat = $('#LatSpan');

        var sliderAlt = $("#sliderAlt");
        var spanAlt = $('#AltSpan');

        var sliderTime = $("#sliderTime");
        var spanTime = $('#TimeSpan');

        var sliderOpacity = $("#sliderOpacity");
        var spanOpacity = $('#OpacitySpan');

        var sliderValues = $("#sliderValues");
        var spanValues = $('#ValuesSpan');
        var max = 0;
        for (var x = 0; x < rect.length; x++) {
            max = Math.max(rect[x].cubes.length, max);
        }
        max = Math.floor(Math.sqrt(max));
        sliderLng.slider({
            min: 0,
            max: gInterface.dim.y * gInterface.sub,
            range: true,
            step: gInterface.dim.y / max,
            values: [0, gInterface.dim.y * gInterface.sub],
            slide: function (event, ui) {
                if (ui.values[0] == ui.values[1]) {
                    return;
                }

                spanLng.html(Math.floor(ui.values[0] / (gInterface.dim.y * gInterface.sub) * 100) + " - " + Math.floor(ui.values[1] / (gInterface.dim.y * gInterface.sub) * 100) + "%");
                gInterface.changeSize(ui.values, 1);
                var direction;
                if (ui.values[0] > self.oldValLng[0] || ui.values[1] < self.oldValLng[1]) {
                    direction = 0;
                } else {
                    direction = 1;
                }
                gInterface.moveWindow(direction);
                gInterface.globe.redraw();
                self.oldValLng = ui.values;

            }
        });
        sliderLat.slider({
            min: 0,
            max: gInterface.dim.x * gInterface.sub,
            range: true,
            step: gInterface.dim.x / max,
            values: [0, gInterface.dim.x * gInterface.sub],
            slide: function (event, ui) {
                if (ui.values[0] == ui.values[1]) {
                    return;
                }


                spanLat.html(Math.floor(ui.values[0] / (gInterface.dim.x * gInterface.sub) * 100) + " - " + Math.floor(ui.values[1] / (gInterface.dim.x * gInterface.sub) * 100) + "%");
                gInterface.changeSize(ui.values, 0);
                var direction;
                if (ui.values[0] > self.oldValLat[0] || ui.values[1] < self.oldValLat[1]) {
                    direction = 0;
                } else {
                    direction = 1;
                }
                gInterface.moveWindow(direction);
                gInterface.globe.redraw();
                self.oldValLat = ui.values;

            }
        });
        spanValues.html(gInterface.myData[0].bounds[1] + " - " + gInterface.myData[0].bounds[0]);
        sliderValues.slider({
            min: gInterface.myData[0].bounds[1],
            max: gInterface.myData[0].bounds[0],
            range: true,
            step: (gInterface.myData[0].bounds[0] - gInterface.myData[0].bounds[1]) / 100,
            values: [gInterface.myData[0].bounds[1], gInterface.myData[0].bounds[0]],
            slide: function (event, ui) {

                if (ui.values[0] == ui.values[1]) {
                    return;
                }
                spanValues.html(ui.values[0] + " - " + ui.values[1]);
                gInterface.filterValues(ui.values);
                gInterface.globe.redraw();
            }
        });
        sliderAlt.slider({

            min: 0,
            max: gInterface.activeLayers,
            step: 1,
            range: true,
            values: [0, gInterface.activeLayers],
            slide: function (event, ui) {
                if (ui.values[0] == ui.values[1]) {
                    return;
                }

                spanAlt.html(ui.values[0] + " - " + ui.values[1]);
                gInterface.changeAltitude(ui.values);
                self.oldValAlt = ui.values;

            }
        });
        var timeLength = gInterface.smallVoxels.layers.length - (gInterface.allTime.slice(0, gInterface.activeLayers).length);
        var timeVal = gInterface.allTime[0];
        spanTime.html(timeVal);

        sliderTime.slider({
            min: 0,
            max: timeLength,
            range: false,
            step: 1,
            slide: function (event, ui) {

                var timeVal = gInterface.allTime[ui.value];
                spanTime.html(timeVal);

                gInterface.changeTime(ui.value);
                if (gInterface.autoTime) {
                    var compare = $("#checkCompare").is(':checked') ? 1 : 0;
                    gInterface.compare = compare;
                    gInterface.UI.resetFilter();
                    gInterface.makeBigDoxels();

                }
                gInterface.changeAltitude(self.oldValAlt);
                self.oldValTime = ui.value;

            }
        });

        sliderOpacity.slider({
            min: 0,
            max: 100,
            range: false,
            step: 1,
            value: 0,
            slide: function (event, ui) {
                var val = ui.value;
                if (ui.value < 100 && ui.value > 95) {
                    val = 95;
                }
                if (ui.value < 5 && ui.value > 0) {
                    val = 0;
                }

                spanOpacity.html(100 - ui.value + "%");
                gInterface.setOpacity((100 - val) / 100);
            }
        });
        $("#loading").hide();
        //gInterface.globe.goTo(new WorldWind.Position(gInterface.gridLayer.renderables[1].point[0],gInterface.gridLayer.renderables[1].point[1],200000));
        gInterface.globe.navigator.lookAtLocation.latitude = gInterface.gridLayer.renderables[1].point[0];
        gInterface.globe.navigator.lookAtLocation.longitude = gInterface.gridLayer.renderables[1].point[1];
        gInterface.globe.navigator.range = 200000;
    };
    UserInterface.prototype.resetFilter = function () {
        gInterface = this.parent;
        var compare = gInterface.compare;
        gInterface.filterValues([gInterface.myData[compare].bounds[1], gInterface.myData[compare].bounds[0]]);
        $("#sliderValues").slider("values", [gInterface.myData[compare].bounds[1], gInterface.myData[compare].bounds[0]]);
        $("#ValuesSpan").html(gInterface.myData[compare].bounds[1] + " - " + gInterface.myData[compare].bounds[0]);
    };

    return UserInterface;
});




