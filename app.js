/* global define:true, requirejs:true, $: true*/
requirejs.config({
    baseUrl: '.',
    paths: {
        app: '../src'
    }
});
var teleData;



define(['myScripts/insertJson'],
    function(TeleData) {
        "use strict";

        teleData = new TeleData();


        $("#changeValues").click(function() {
            var val = Number($("#changeHeight").val());
            var big = Number($("#changeBig").val());
            var stat = Number($("#changeStat").val());
            teleData.updateOpt([val,big,stat]);
            

        });

        $("#start").click(function() {

            $("#alert").css("visibility", "hidden");

            var val = [];
            for (var x = 0; x < $("#controls").children().length; x++) {
                val[x] = $("#controls").children()[x].children[1].value;
                if (val[x].length === 0) {
                    $("#alert").css("visibility", "visible");
                    $("#alert").css("opacity", 1);
                    return;
                } else {
                    val[x] = Number(val[x]);
                    $("#controlMenu").hide();
                    $("#alert").hide();
                    $(".afterControl").show();
                }
            }

            teleData.create({
                globe: 'canvasOne',
                gridUrl: 'http://localhost/www/griglia.txt',

                heightCube: val[0],
                /*  cube's height                               */
                maxShown: val[1],
                /*  max layers in view                          */
                maxInApp: val[5],
                /*  max layers in the app                       */
                startHeight: val[2],
                /*  initial height                              */
                sub: val[3],
                /*  sq. root of number of cubes                 */
                heightDim: val[4],
                /*  height subdivision                          */
                autoTime: val[6],
                /*  automatic big cubes generation              */
                statIndex: val[7],
                /*  0: wAvg, 1:aAvg, 2:var, 3:med, 4:max, 5:min */
                maxDownload: 3000,
                /*  max cubes downloded                         */
                config: {
                    time: 0,
                    id: 1,
                    data: [2, 3, 4],
                    half : 0,
                    separator: "."
                },/*
                config: {
                    time: 2,
                    id: 0,
                    data: [1],
                    half: 0,
                    separator: "."
                },*/
                /*  configuration of the csv                    */
                dataUrl: "/www/new.csv",
                /*  url of the csv                              */

            });
        });

        var bigEnabled = 0;


        $('#radioButtons input').on('change', function() {
            var val = Number($('input[name=optradio]:checked', '#radioButtons').val());
            if (val) {
                if (!bigEnabled) {
                    teleData.makeBigCubes();
                    bigEnabled = 1;
                }
                teleData.UI.bigHandlePick();
            } else {

                teleData.UI.smallHandlePick();
            }

        });

        $("#bigH").click(function() {
            if (!bigEnabled) {
                teleData.makeBigCubes();
                bigEnabled = 1;
            }
            teleData.UI.resetSelected();
            teleData.UI.bigHandlePick();
        });

        $("#smallH").click(function() {
            teleData.UI.smallHandlePick();
        });



    });


Object.size = function(obj) {
    var size = 0,
        key;
    for (key in obj) {
        if (obj.hasOwnProperty(key)) size++;
    }
    return size;
};