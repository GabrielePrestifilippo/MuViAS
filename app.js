/* global define:true, requirejs:true, $: true*/
requirejs.config({
    baseUrl: '.',
    paths: {
        app: '../src'
    }
});
var globeInterface;



define(['myScripts/appConstructor',
       'myScripts/globeInterface'],
    function(AppConstructor,
             GlobeInterface) {
        "use strict";

    

    
    var appConstructor=new AppConstructor();
    var globeInterface=new GlobeInterface();
    appConstructor.setInterface(globeInterface);

    
        var compare = 0;
        $("#changeValues").click(function() {
            var val = Number($("#changeHeight").val());
            var big = Number($("#changeBig").val());
            var stat = Number($("#changeStat").val());
            globeInterface.updateOpt([val, big, stat]);


        });

        $("#checkCompare").change(function() {
            compare = $("#checkCompare").is(':checked') ? 1 : 0;
            globeInterface.compare=compare;
            globeInterface.UI.resetFilter();
        });


        var showAdvanced = 0;
        $("#advanced").click(function() {
            if (!showAdvanced) {
                $("#advancedOptions").show();
                showAdvanced = 1;
            } else {
                $("#advancedOptions").hide();
                $("#compareOptions").hide();
                showAdvanced = 0;
            }
        });

        var showCompare = 0;
        $("#compare").click(function() {
            if (!showCompare) {
                $("#compareOptions").show();
                showCompare = 1;
            } else {
                $("#compareOptions").hide();
                showCompare = 0;
            }
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

            var maxColor = $("input[name='maxcolor']").val();
            var minColor = $("input[name='mincolor']").val();
            var midColor = $("input[name='midcolor']").val();
            var colors = [getRGB(minColor), getRGB(midColor), getRGB(maxColor)];

            var half = 0;
            var urlCompare;
            var separatorCompare;
            var timeCompare;
            var gridCompare;
            var dataCompare;

            if ($("input[option='co0']").is(':checked')) {
                half = 1;
                urlCompare = $("input[option='co1']").val();
                separatorCompare = $("input[option='co2']").val();
                timeCompare = Number($("input[option='co3']").val());
                gridCompare = Number($("input[option='co4']").val());
                dataCompare = JSON.parse($("input[option='co5']").val());
                $(".checkCompare").show();

            }



            appConstructor.create({
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
                colors: colors,
                /*  colors for min and max voxels               */
                config_0: {
                    time: 0,
                    id: 1,
                    data: [2, 3, 4],
                    half: half,
                    separator: ".",
                    url: "/www/new.csv"
                },
                config_1: {
                    time: timeCompare,
                    id: gridCompare,
                    data: dataCompare,
                    half: half,
                    separator: separatorCompare,
                    url: urlCompare
                },


            });
        });

        var bigEnabled = 0;


        $('#radioButtons input').on('click', function() {
            var val = Number($('input[name=optradio]:checked', '#radioButtons').val());
            if (val) {
                globeInterface.UI.resetFilter();
                globeInterface.makeBigCubes();
                bigEnabled = 1;
                globeInterface.UI.bigHandlePick();
            } else {

                globeInterface.UI.smallHandlePick();
            }

        });

        $("#bigH").click(function() {
            if (!bigEnabled) {
                globeInterface.UI.resetFilter();
                globeInterface.makeBigCubes();
                bigEnabled = 1;
            }
            globeInterface.UI.resetSelected();
            globeInterface.UI.bigHandlePick();
        });

        $("#smallH").click(function() {
            globeInterface.UI.smallHandlePick();
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

function getRGB(h) {
    h = (h.charAt(0) == "#") ? h.substring(1, 7) : h;
    var r = parseInt(h.substring(0, 2), 16);
    var g = parseInt(h.substring(2, 4), 16);
    var b = parseInt(h.substring(4, 6), 16);
    return [r, g, b];
}