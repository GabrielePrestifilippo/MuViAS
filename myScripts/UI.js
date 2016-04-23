/* global define:true*/
///* jshint -W117 */
/* global $:true, google:true*/

define([
    'src/WorldWind'

], function(WorldWind) {

    var UI = function(parent) {
        this.parent = parent;
        google.charts.load('current', {
            'packages': ['corechart']
        });
        google.charts.setOnLoadCallback();

    };

    UI.prototype.start = function() {

        var parent = this.parent;
        this.oldValLng = [0, parent.globeInterface.dim.y * parent.globeInterface.sub];
        this.oldValLat = [0, parent.globeInterface.dim.x * parent.globeInterface.sub];
        this.oldValAlt = [0, parent.globeInterface.activeLayers];
        this.oldValTime = 0;
        this.startSlider(this);

        if (this.parent.config[1]) {
            var corr = this.parent.globeInterface.getCorrelation();
            corr=Number(Math.round(corr+'e5')+'e-5');
            $("#correlation").text("Correlation between datasets: " + corr);
        }
    };

    UI.prototype.disableNewData = function() {
        $("#compare").attr("disabled", true);
        $("#compareOptions").hide();
    };

    UI.prototype.drawChart = function(config) {
        var parent = this.parent;
        var interface = this.parent.globeInterface;
        var compare = interface.compare;

        var id = config.id;
        var names = config.names;
        var arraio = [
            names
        ];
        var config0 = parent.config[0];
        var config1 = parent.config[1];
        var values = config.values;
        var x, y, z, entry, entryArray, entryData;
        for (x in interface.time) {
            var specTime = interface.time[x];
            if (!config1) {
                for (y in specTime[0]) {
                    if (specTime[0][y][0] == id) {
                        entry = [];
                        entryArray = [this.toTime(Number(x))];
                        entryData = specTime[0][y][1];
                        if (config0.separator) {
                            entryData = Number(entryData.split(config0.separator).join(""));
                        }
                        entryArray.push(entryData);
                        arraio.push(entryArray);
                    }

                }
            } else {
                if (specTime[0] && specTime[1]) {
                    for (y in specTime[0]) {
                        if (specTime[0][y][0] == id) {
                            entry = [];
                            entryArray = [this.toTime(Number(x))];
                            entryData = specTime[0][y][1];
                            if (config0.separator) {
                                entryData = Number(entryData.split(config0.separator).join(""));
                            }
                            entryArray.push(entryData);
                            for (z in specTime[1]) {
                                if (specTime[1][z][config1.id] == id) {
                                    entryData = specTime[1][y][config1.data[0]];
                                    if (config1.separator) {
                                        entryData = Number(entryData.split(config1.separator).join(""));
                                    }
                                }

                            }
                            entryArray.push(entryData);
                            arraio.push(entryArray);
                        }
                    }

                }
            }
        }

        if (arraio.length > 1) {
            var data = google.visualization.arrayToDataTable(arraio);
            var min = parent.myData[compare].bounds[1];
            var options = {
                title: 'Voxel Data',
                hAxis: {
                    title: 'Timestamp',
                    titleTextStyle: {
                        color: '#333'
                    }
                },
                vAxis: {
                    minValue: min
                }
            };

            var chart = new google.visualization.AreaChart($('#chart_div')[0]);
            chart.draw(data, options);


            var now = Number(this.parent.globeInterface.allTime[this.oldValTime]);
            now = this.toTime(now);
            var actualTime = 0;
            for (x in arraio) {
                if (arraio[x][0] == now) {
                    actualTime = x - 1;
                }
            }
            chart.setSelection([{
                row: actualTime,
                column: compare + 1
            }]);
        }

        if (config1) {
            var dataArray = [];
            dataArray[0] = [];
            dataArray[1] = [];
            for (x = 0; x < arraio.length; x++) {
                if (x !== 0) {
                    dataArray[0].push(arraio[x][1]);
                    dataArray[1].push(arraio[x][2]);
                }
            }
            var correlation = interface.correlation(dataArray, 0, 1);
            correlation=Number(Math.round(correlation+'e5')+'e-5');
            $("#correlationVoxel").text("Correlation between dataset in selected voxel: " + correlation);
        }


    };

    UI.prototype.resetTime = function(val) {
        var parent = this.parent;
        parent.globeInterface.startHeight = val;
        parent.globeInterface.changeAlt(this.oldValAlt);
        parent.globeInterface.changeTime(0, 0);
        $('#sliderTime').slider("value", 0);
        $("#timeSpan").html(parent.globeInterface.allTime[0]);
    };

    UI.prototype.alert = function(text) {
        $("#alert").css("visibility", "visible");
        $("#alert").css("opacity", 1);
        $("#alertContent").html(text);
    };

    UI.prototype.startSlider = function() {
        var parent = this.parent;
        var self = this;
        var rect = parent.globeInterface.rect;

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
        for (var x in rect) {
            max = Math.max(rect[x].cubes.length, max);
        }
        max = Math.floor(Math.sqrt(max));

        sliderLng.slider({
            min: 0,
            max: parent.globeInterface.dim.y * parent.globeInterface.sub,
            range: true,
            step: parent.globeInterface.dim.y / max,
            values: [0, parent.globeInterface.dim.y * parent.globeInterface.sub],
            slide: function(event, ui) {
                if (ui.values[0] == ui.values[1]) {
                    return;
                }

                spanLng.html(Math.floor(ui.values[0] / (parent.globeInterface.dim.y * parent.globeInterface.sub) * 100) + " - " + Math.floor(ui.values[1] / (parent.globeInterface.dim.y * parent.globeInterface.sub) * 100) + "%");
                parent.globeInterface.changeSize(ui.values, 1);
                var direction;
                if (ui.values[0] > self.oldValLng[0] || ui.values[1] < self.oldValLng[1]) {
                    direction = 0;
                } else {
                    direction = 1;
                }
                parent.globeInterface.moveWindow(direction);
                parent.wwd.redraw();
                self.oldValLng = ui.values;

            }
        });

        sliderLat.slider({
            min: 0,
            max: parent.globeInterface.dim.x * parent.globeInterface.sub,
            range: true,
            step: parent.globeInterface.dim.x / max,
            values: [0, parent.globeInterface.dim.x * parent.globeInterface.sub],
            slide: function(event, ui) {
                if (ui.values[0] == ui.values[1]) {
                    return;
                }


                spanLat.html(Math.floor(ui.values[0] / (parent.globeInterface.dim.x * parent.globeInterface.sub) * 100) + " - " + Math.floor(ui.values[1] / (parent.globeInterface.dim.x * parent.globeInterface.sub) * 100) + "%");
                parent.globeInterface.changeSize(ui.values, 0);
                var direction;
                if (ui.values[0] > self.oldValLat[0] || ui.values[1] < self.oldValLat[1]) {
                    direction = 0;
                } else {
                    direction = 1;
                }
                parent.globeInterface.moveWindow(direction);
                parent.wwd.redraw();
                self.oldValLat = ui.values;

            }
        });

        spanValues.html(parent.myData[0].bounds[1] + " - " + parent.myData[0].bounds[0]);

        sliderValues.slider({
            min: parent.myData[0].bounds[1],
            max: parent.myData[0].bounds[0],
            range: true,
            step: (parent.myData[0].bounds[0] - parent.myData[0].bounds[1]) / 100,
            values: [parent.myData[0].bounds[1], parent.myData[0].bounds[0]],
            slide: function(event, ui) {

                if (ui.values[0] == ui.values[1]) {
                    return;
                }
                spanValues.html(ui.values[0] + " - " + ui.values[1]);
                parent.globeInterface.filterValues(ui.values);
                parent.wwd.redraw();
            }
        });

        sliderAlt.slider({

            min: 0,
            max: parent.globeInterface.activeLayers,
            step: 1,
            range: true,
            values: [0, parent.globeInterface.activeLayers],
            slide: function(event, ui) {
                if (ui.values[0] == ui.values[1]) {
                    return;
                }

                spanAlt.html(ui.values[0] + " - " + ui.values[1]);
                parent.globeInterface.changeAlt(ui.values);
                self.oldValAlt = ui.values;

            }
        });

        var timeLength = parent.globeInterface.layers.length - (parent.globeInterface.allTime.slice(0, parent.globeInterface.activeLayers).length);
        var direction;

        var timeVal = parent.globeInterface.allTime[0];
        spanTime.html(self.toTime(timeVal));

        sliderTime.slider({
            min: 0,
            max: timeLength,
            range: false,
            step: 1,
            slide: function(event, ui) {
                if (ui.value > self.oldValTime) {
                    direction = 1;
                } else {
                    direction = 0;
                }
                var timeVal = parent.globeInterface.allTime[ui.value];
                spanTime.html(self.toTime(timeVal));

                parent.globeInterface.changeTime(ui.value, direction);
                if (parent.globeInterface.autoTime) {
                    var compare = $("#checkCompare").is(':checked') ? 1 : 0;
                    parent.globeInterface.UI.resetFilter();
                    parent.globeInterface.makeBigCubes();

                }
                parent.globeInterface.changeAlt(self.oldValAlt);
                self.oldValTime = ui.value;

            }
        });

        sliderOpacity.slider({
            min: 0,
            max: 100,
            range: false,
            step: 1,
            value: 0,
            slide: function(event, ui) {
                var val = ui.value;
                if (ui.value < 100 && ui.value > 95) {
                    val = 95;
                }
                if (ui.value < 5 && ui.value > 0) {
                    val = 0;
                }

                spanOpacity.html(100 - ui.value + "%");
                parent.globeInterface.setOpacity((100 - val) / 100);
            }
        });

        //self.wwd.goTo(new WorldWind.Position(gridLayer.renderables[0].point[0],gridLayer.renderables[0].point[1],200000));
        parent.wwd.navigator.lookAtLocation.latitude = parent.globeInterface.gridLayer.renderables[100].point[0];
        parent.wwd.navigator.lookAtLocation.longitude = parent.globeInterface.gridLayer.renderables[100].point[1];
        parent.wwd.navigator.range = 200000;
    };

    UI.prototype.resetFilter = function() {
        var parent = this.parent;
        var compare = parent.globeInterface.compare;
        parent.globeInterface.filterValues([parent.myData[compare].bounds[1], parent.myData[compare].bounds[0]]);
        $("#sliderValues").slider("values", [parent.myData[compare].bounds[1], parent.myData[compare].bounds[0]]);
        $("#ValuesSpan").html(parent.myData[compare].bounds[1] + " - " + parent.myData[compare].bounds[0]);
    };

    UI.prototype.toTime = function(timeVal) {
        var date = new Date(0);
        date.setMilliseconds(Number(timeVal + "000"));
        timeVal = date.getDate() + "/" + date.getMonth() + "/" + date.getFullYear() + " " + date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();
        return timeVal;
    };

    UI.prototype.bigHandlePick = function() {
        var self = this;
        var parent = self.parent;

        if (parent.wwd.eventListeners.dblclick) {
            parent.wwd.removeEventListener("dblclick", this.handlePick);
        }

        var handlePick = function(o) {
            var rect = parent.globeInterface.rect;
            var bigCubes = parent.globeInterface.bigCubes;
            var x = o.clientX,
                y = o.clientY;
            var h;
            var pickList = parent.wwd.pick(parent.wwd.canvasCoordinates(x, y)); //pick point

            if (pickList.objects.length > 0) { //if at least 1 object picked
                for (var p = 0; p < pickList.objects.length; p++) { //for each picked point
                    if (pickList.objects[p].isOnTop) {

                        for (x in rect) { //for each rectangle
                            if (rect[x].cubes.indexOf(pickList.objects[p].userObject) != -1) {
                                for (h in bigCubes) {
                                    bigCubes[h].renderables[x].enabled = true;
                                    bigCubes[h].renderables[x].active = true;
                                }
                                var z;
                                for (z in rect[x].cubes) {
                                    if (rect[x].cubes[z]) {
                                        rect[x].cubes[z].enabled = false;
                                        rect[x].cubes[z].bigCubed = true;
                                    }
                                }
                                parent.wwd.redraw();
                                break;
                            }
                        }

                        for (h in bigCubes) {
                            for (x in bigCubes[h].renderables) {
                                if (bigCubes[h].renderables[x] == pickList.objects[p].userObject) {
                                    for (var h1 in bigCubes) {
                                        bigCubes[h1].renderables[x].enabled = false;
                                        bigCubes[h1].renderables[x].active = false;
                                    }
                                    for (var l in rect[x].cubes) {
                                        if (rect[x].cubes[l]) {
                                            rect[x].cubes[l].enabled = true;
                                            rect[x].cubes[l].bigCubed = false;
                                        }
                                    }
                                    parent.wwd.redraw();
                                    break;
                                }
                            }

                        }
                    }
                }
            }


        };
        parent.wwd.addEventListener("dblclick", handlePick);
        this.handlePick = handlePick;
    };

    UI.prototype.resetSelected = function() {
        try {
            if (this.highLighted) {
                for (var y in this.highLighted.userObject._positions) {
                    this.highLighted.userObject._positions[y].altitude -= 500;
                }
                this.highLighted.userObject._attributes._drawOutline = false;
                this.highLighted.userObject.reset();
            }
            this.highLighted = "";
        } catch (e) {}
    };

    UI.prototype.smallHandlePick = function() {
        var self = this;
        var parent = self.parent;

        if (parent.wwd.eventListeners.dblclick) {
            parent.wwd.removeEventListener("dblclick", this.handlePick);
        }

        var handlePick = function(o) {
            var rect = parent.globeInterface.rect;
            var bigCubes = parent.globeInterface.bigCubes;
            var x = o.clientX,
                y = o.clientY;
            var h;
            var pickList = parent.wwd.pick(parent.wwd.canvasCoordinates(x, y)); //pick point
            var config = parent.config;


            if (pickList.objects.length > 0) { //if at least 1 object picked
                for (var p = 0; p < pickList.objects.length; p++) { //for each picked point
                    if (pickList.objects[p].isOnTop) {
                        //console.log(pickList.objects[p].userObject.data);



                        if (self.highLighted && self.highLighted.userObject == pickList.objects[p].userObject) {
                            self.resetSelected();

                        } else {
                            self.resetSelected();
                            self.highLighted = pickList.objects[p];



                            for (x in pickList.objects[p].userObject._positions) {
                                pickList.objects[p].userObject._positions[x].altitude += 500;
                            }
                            var val = pickList.objects[p].userObject.id;
                            if (val) {
                                var names = ["Time", "Set 1"];
                                var values = [config[0].data];

                                if (config[1]) {
                                    names.push("Set 2");
                                    values.push([config[1].data]);
                                }
                                var configuration = {
                                    names: names,
                                    values: values,
                                    id: val
                                };
                                $("#infoPoint").show();
                                self.drawChart(configuration);

                                pickList.objects[p].userObject.reset();
                                pickList.objects[p].userObject._attributes._outlineColor = new WorldWind.Color(1, 1, 1, 0.65);

                                pickList.objects[p].userObject._attributes._drawOutline = true;
                                parent.wwd.redraw();
                            }
                        }
                        break;

                    }
                }
            }



        };
        this.handlePick = handlePick;
        parent.wwd.addEventListener("dblclick", handlePick);
    };

    return UI;
});