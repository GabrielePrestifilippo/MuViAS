define(['myScripts/Chart',
    'myScripts/Correlation'

], function (Chart,
             Correlation) {

    var HandlePicks = function () {
        this.chart = new Chart();
    };

    HandlePicks.prototype.getBig = function (rect, bigCubes, globe) {
        var handlePick = function (o) {

            var x = o.clientX,
                y = o.clientY;
            var h;
            var pickList = globe.pick(globe.canvasCoordinates(x, y)); //pick point

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
                                globe.redraw();
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
                                    globe.redraw();
                                    break;
                                }
                            }

                        }
                    }
                }
            }
        };
        return handlePick;
    };
    HandlePicks.prototype.getSmall = function (gInterface) {
        var self = this;
        var globe = gInterface.globe;
        var compare = gInterface.compare;
        var config = gInterface.config;
        var handlePick = function (o) {
            var x = o.clientX,
                y = o.clientY;

            var pickList = globe.pick(globe.canvasCoordinates(x, y)); //pick point


            if (pickList.objects.length > 0) { //if at least 1 object picked
                for (var p = 0; p < pickList.objects.length; p++) { //for each picked point
                    if (pickList.objects[p].isOnTop) {


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
                                var names = ["Time"];
                                var values = [config[0].data];

                                if (!config[1]) {
                                    for (var z = 0; z < config[0].data.length; z++) {
                                        names.push("Variable " + z);
                                    }
                                } else {
                                    names.push("Set 1", "Set 2");
                                    values = [config[0].data, config[1].data];
                                }
                                var configuration = {
                                    names: names,
                                    values: values,
                                    id: val
                                };
                                $("#infoPoint").show();

                                var min = gInterface.parent.myData[compare].bounds[1];

                                var arrayCorrelation = Correlation.getCorrelationVariables(configuration, gInterface.time, gInterface.config);
                                if (arrayCorrelation.length > 0) {
                                    var data = google.visualization.arrayToDataTable(arrayCorrelation);
                                }

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
                                self.chart.draw(data, options);

                                if (config[0] || (config[1].data.length > 0)) {
                                    var dataArray = [];
                                    dataArray[0] = [];
                                    dataArray[1] = [];
                                    for (x = 0; x < arrayCorrelation.length; x++) {
                                        if (x !== 0) {
                                            dataArray[0].push(arrayCorrelation[x][1]);
                                            dataArray[1].push(arrayCorrelation[x][2]);
                                        }
                                    }
                                    var correlation = Correlation.correlation(dataArray, 0, 1);
                                    correlation = Number(Math.round(correlation + 'e5') + 'e-5');
                                    var text = "variables";
                                    if (config[0]) {
                                        text = "datasets";
                                    }
                                    $("#correlationVoxel").text("Correlation between " + text + " in selected voxel: " + correlation);
                                }


                                var now = Number(gInterface.allTime[gInterface.UI.oldValTime]);
                                now = Correlation.toTime(now);
                                var actualTime = 0;
                                for (x in arrayCorrelation) {
                                    if (arrayCorrelation[x][0] == now) {
                                        actualTime = x - 1;
                                    }
                                }
                                self.chart.setPoint(actualTime, compare);


                                pickList.objects[p].userObject.reset();
                                pickList.objects[p].userObject._attributes._outlineColor = new WorldWind.Color(1, 1, 1, 0.65);

                                pickList.objects[p].userObject._attributes._drawOutline = true;
                                globe.redraw();
                            }
                        }
                        break;

                    }
                }
            }


        };
        return handlePick;
    };
    HandlePicks.prototype.resetSelected = function () {
        try {
            if (this.highLighted) {
                for (var y in this.highLighted.userObject._positions) {
                    this.highLighted.userObject._positions[y].altitude -= 500;
                }
                this.highLighted.userObject._attributes._drawOutline = false;
                this.highLighted.userObject.reset();
            }
            this.highLighted = "";
        } catch (e) {
        }
    };

    return HandlePicks;
});