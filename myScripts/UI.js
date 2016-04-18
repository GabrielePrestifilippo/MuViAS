/* global define:true*/
///* jshint -W117 */
/* global $:true*/
define([
    'src/WorldWind'

], function(WorldWind) {

    var UI = function(parent) {
        this.parent = parent;
        this.startSlider(this);


        this.oldValLng = [0, parent.dim.y * parent.sub];
        this.oldValLat = [0, parent.dim.x * parent.sub];
        this.oldValAlt = [0, parent.activeLayers];
        this.oldValTime = 0;
        this.highLighted = [];

    };



    UI.prototype.fillBox = function(object) {
        $("#infoPoint").show();
        var myString = "";
        if (object.info) {
            myString = JSON.stringify(object.info);
        } else {
            myString = object.data;
        }

        $("#textInfo").html(myString);
    };

    UI.prototype.resetTime = function(val) {
        var parent = this.parent;
        parent.startHeight = val;
        parent.changeAlt(this.oldValAlt);
        parent.changeTime(0, 0);
        $('#sliderTime').slider("value", 0);
        $("#timeSpan").html(parent.allTime[0]);
    };

    UI.prototype.startSlider = function() {
        var parent = this.parent;
        var self = this;
        var rect = parent.rect;
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


        var max = 0;
        for (var x in rect) {
            max = Math.max(rect[x].cubes.length, max);
        }
        max = Math.floor(Math.sqrt(max));

        sliderLng.slider({
            min: 0,
            max: parent.dim.y * parent.sub,
            range: true,
            step: parent.dim.y / max,
            values: [0, parent.dim.y * parent.sub],
            slide: function(event, ui) {
                if (ui.values[0] == ui.values[1]) {
                    return;
                }

                spanLng.html(Math.floor(ui.values[0] / (parent.dim.y * parent.sub) * 100) + " - " + Math.floor(ui.values[1] / (parent.dim.y * parent.sub) * 100) + "%");
                parent.changeSize(ui.values, 1);
                var direction;
                if (ui.values[0] > self.oldValLng[0] || ui.values[1] < self.oldValLng[1]) {
                    direction = 0;
                } else {
                    direction = 1;
                }
                parent.moveWindow(direction);
                parent.wwd.redraw();
                self.oldValLng = ui.values;

            }
        });

        sliderLat.slider({
            min: 0,
            max: parent.dim.x * parent.sub,
            range: true,
            step: parent.dim.x / max,
            values: [0, parent.dim.x * parent.sub],
            slide: function(event, ui) {
                if (ui.values[0] == ui.values[1]) {
                    return;
                }


                spanLat.html(Math.floor(ui.values[0] / (parent.dim.x * parent.sub) * 100) + " - " + Math.floor(ui.values[1] / (parent.dim.x * parent.sub) * 100) + "%");
                parent.changeSize(ui.values, 0);
                var direction;
                if (ui.values[0] > self.oldValLat[0] || ui.values[1] < self.oldValLat[1]) {
                    direction = 0;
                } else {
                    direction = 1;
                }
                parent.moveWindow(direction);
                parent.wwd.redraw();
                self.oldValLat = ui.values;

            }
        });


        sliderAlt.slider({

            min: 0,
            max: parent.activeLayers,
            step: 1,
            range: true,
            values: [0, parent.activeLayers],
            slide: function(event, ui) {
                if (ui.values[0] == ui.values[1]) {
                    return;
                }

                spanAlt.html(ui.values[0] + " - " + ui.values[1]);
                parent.changeAlt(ui.values);
                self.oldValAlt = ui.values;

            }
        });

        var timeLength = parent.layers.length - (parent.allTime.slice(0, parent.activeLayers).length);
        var direction;
        spanTime.html(parent.allTime[0]);
       
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
                spanTime.html(parent.allTime[ui.value]);

                parent.changeTime(ui.value, direction);
                if (parent.autoTime) {
                     var compare=$("#checkCompare").is(':checked')?1:0;
                    parent.makeBigCubes(compare);
                    //parent.UI.bigHandlePick();
                }
                parent.changeAlt(self.oldValAlt);
                self.oldValTime = ui.value;

            }
        });


        sliderOpacity.slider({
            min: 0,
            max: 100,
            range: false,
            step: 1,
            value: 100,
            slide: function(event, ui) {
                if(ui.value<100 && ui.value>90){
                    ui.value=90;
                }
                
                spanOpacity.html(ui.value+"%");
                parent.setOpacity(ui.value/100);
            }
        });



        //self.wwd.goTo(new WorldWind.Position(gridLayer.renderables[0].point[0],gridLayer.renderables[0].point[1],200000));
        parent.wwd.navigator.lookAtLocation.latitude = parent.gridLayer.renderables[0].point[0];
        parent.wwd.navigator.lookAtLocation.longitude = parent.gridLayer.renderables[0].point[1];
        parent.wwd.navigator.range = 200000;

    };


    UI.prototype.bigHandlePick = function() {
        var self = this;
        var parent = self.parent;

        if (parent.wwd.eventListeners.dblclick) {
            parent.wwd.removeEventListener("dblclick", this.handlePick);
        }

        var handlePick = function(o) {
            var rect = parent.rect;
            var bigCubes = parent.bigCubes;
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
        for (var x in this.highLighted) {
            for (var y in this.highLighted[x].userObject._positions) {
                this.highLighted[x].userObject._positions[y].altitude -= 500;
                this.highLighted[x].userObject._attributes._drawOutline = false;
                this.highLighted[x].userObject.reset();
            }
        }
        this.highLighted = [];
    };

    UI.prototype.smallHandlePick = function() {
        var self = this;
        var parent = self.parent;

        if (parent.wwd.eventListeners.dblclick) {
            parent.wwd.removeEventListener("dblclick", this.handlePick);
        }

        var handlePick = function(o) {
            var rect = parent.rect;
            var bigCubes = parent.bigCubes;
            var x = o.clientX,
                y = o.clientY;
            var h;
            var pickList = parent.wwd.pick(parent.wwd.canvasCoordinates(x, y)); //pick point
            self.resetSelected();


            if (pickList.objects.length > 0) { //if at least 1 object picked
                for (var p = 0; p < pickList.objects.length; p++) { //for each picked point
                    if (pickList.objects[p].isOnTop) {
                        //console.log(pickList.objects[p].userObject.data);

                        self.fillBox(pickList.objects[p].userObject);

                        self.highLighted.push(pickList.objects[p]);

                        for (x in pickList.objects[p].userObject._positions) {
                            pickList.objects[p].userObject._positions[x].altitude += 500;
                        }
                        pickList.objects[p].userObject.reset();
                        pickList.objects[p].userObject._attributes._outlineColor = new WorldWind.Color(1, 1, 1, 0.65);

                        pickList.objects[p].userObject._attributes._drawOutline = true;
                        parent.wwd.redraw();
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