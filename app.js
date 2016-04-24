/* global define:true, requirejs:true, $: true*/
requirejs.config({
    baseUrl: '.',
    paths: {
        app: '../src'
    }
});
var globeInterface;

var configurator;

define(['myScripts/appConstructor',
        'myScripts/globeInterface',
        'myScripts/configurator'
    ],
    function(AppConstructor,
        GlobeInterface,
        Configurator) {
        "use strict";

        var appConstructor = new AppConstructor();
        globeInterface = new GlobeInterface();
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
            globeInterface.compare = compare;
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

        $("#loadConfig").click(function() {
            $("#configSelector").show();
            configurator = new Configurator();
            var urlRef = $("input[option='re1']").val();


            var promiseDataConfig = $.Deferred(function() {
                configurator.getConfig(urlRef, this.resolve);
            });


            $.when(promiseDataConfig).done(function(data) {
                for (var x = 0; x < data.length; x++) {
                    $('#timeConfig, #gridConfig, #dataConfig')
                        .append($("<option></option>")
                            .attr("value", x)
                            .text(data[x]));
                }
            });

        });

        $("#loadConfigCompare").click(function() {
            $("#configSelectorCompare").show();
            configurator = new Configurator();
            var urlRef = $("input[option='co1']").val();

            var promiseConfig = $.Deferred(function() {
                configurator.getConfig(urlRef, this.resolve);
            });

            $.when(promiseConfig).done(function(data) {
                for (var x = 0; x < data.length; x++) {
                    $('#timeConfigCompare, #gridConfigCompare, #dataConfigCompare')
                        .append($("<option></option>")
                            .attr("value", x)
                            .text(data[x]));
                }
            });
        });

        $('#addData').on('click', function() {
            try {
                var half = 1;

                var urlCompare = $("input[option='co1']").val();
                var idSeparator = $("input[option='co6']").val();
                var timeCompare = Number($("select[option='co3']").val());
                var gridCompare = Number($("select[option='co4']").val());
                var separatorCompare = $("input[option='co2']").val();
                var dataCompare = $("select[option='co5']").val();

                $(".checkCompare").show();

                var config_1 = {
                    time: timeCompare,
                    id: gridCompare,
                    data: dataCompare,
                    half: half,
                    separator: separatorCompare,
                    idSeparator: idSeparator,
                    url: urlCompare,
                    reference: 0
                };
                appConstructor.newData(config_1);

            } catch (e) {
                globeInterface.UI.alert(e);
            }
        });

        $("#start").click(function() {
            var gridUrl = $("input[option='gr1']").val();
            var urlRef = $("input[option='re1']").val();
            var timeRef = Number($("select[option='re3']").val());
            var gridRef = Number($("select[option='re4']").val());
            var separatorRef = $("input[option='re2']").val();
            var idSeparator = $("input[option='re6']").val();
            var dataRef = $("select[option='re5']").val();
            var reference = 0;


            var height = Number($("input[option='heightCube']").val());
            var shown = Number($("input[option='shown']").val());
            var maxApp = Number($("input[option='maxApp']").val());
            var subxy = Number($("input[option='subxy']").val());
            var subz = Number($("input[option='subz']").val());
            var initH = Number($("input[option='initH']").val());
            var statIndex = Number($("select[option='statIndex']").val());

            $("#alert").css("visibility", "hidden");


            $("#controlMenu").hide();
            $("#alert").css("visibility", "hidden");
            $(".afterControl").show();


            var maxColor = $("input[name='maxcolor']").val();
            var minColor = $("input[name='mincolor']").val();
            var midColor = $("input[name='midcolor']").val();
            var colors = [getRGB(minColor), getRGB(midColor), getRGB(maxColor)];

            var half = 0;
            var urlCompare;

            appConstructor.create({
                globe: 'canvasOne',
                gridUrl: gridUrl,

                heightCube: height,
                /*  cube's height                               */
                maxShown: shown,
                /*  max layers in view                          */
                maxInApp: maxApp,
                /*  max layers in the app                       */
                startHeight: initH,
                /*  initial height                              */
                sub: subxy,
                /*  sq. root of number of cubes                 */
                heightDim: subz,
                /*  height subdivision                          */
                autoTime: 0,
                /*  automatic big cubes generation              */
                statIndex: statIndex,
                /*  0: wAvg, 1:aAvg, 2:var, 3:med, 4:max, 5:min */
                maxDownload: 8000,
                /*  max cubes downloded                         */
                colors: colors,
                /*  colors for min and max voxels               */
                config_0: {
                    time: timeRef,
                    id: gridRef,
                    data: dataRef,
                    half: half,
                    separator: separatorRef,
                    idSeparator: idSeparator,
                    url: urlRef,
                    reference: reference
                }
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