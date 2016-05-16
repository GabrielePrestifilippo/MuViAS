/* global define:true, requirejs:true, $: true*/


var configurator;
var gInterface;
var appConstructor;
var converter;
define(['myScripts/AppConstructor',
        'myScripts/GlobeInterface',
        'myScripts/Globe',
        'myScripts/Configurator',
        'myScripts/HandlePicks',
        'myScripts/UserInterface',
        'myScripts/GlobeHelper'
    ],
    function (AppConstructor,
              GlobeInterface,
              Globe,
              Configurator,
              HandlePicks,
              UI,
              GlobeHelper) {


        var ESTWA;
        ESTWA = function (options) {
            var globe = new Globe({id: options.globe});
            gInterface = new GlobeInterface(globe);

            appConstructor = new AppConstructor();


            gInterface.setUI(new UI(gInterface));
            var handlePicks = new HandlePicks();
            var compare = 0;
            var bigEnabled = 0;

            $("#changeValues").click(function () {
                var val = Number($("#changeHeight").val());
                var big = Number($("#changeBig").val());
                var stat = Number($("#changeStat").val());
                gInterface.updateOpt([val, big, stat]);
            });
            $("#checkCompare").change(function () {
                compare = $("#checkCompare").is(':checked') ? 1 : 0;
                gInterface.compare = compare;
                gInterface.UI.resetFilter();
            });
            $("#loadConfig").click(function () {
                $("#configSelector").show();
                configurator = new Configurator();
                var urlRef = $("input[option='re1']").val();

                var promiseDataConfig = $.Deferred(function () {
                    configurator.getConfig(urlRef, this.resolve);
                });

                $.when(promiseDataConfig).done(function (data) {
                    for (var x = 0; x < data.length; x++) {
                        $('#timeConfig, #gridConfig, #dataConfig')
                            .append($("<option></option>")
                                .attr("value", x)
                                .text(data[x]));
                    }
                });
            });
            $("#loadConfigCompare").click(function () {
                $("#configSelectorCompare").show();
                configurator = new Configurator();
                var urlRef = $("input[option='co1']").val();
                var promiseConfig = $.Deferred(function () {
                    configurator.getConfig(urlRef, this.resolve);
                });

                $.when(promiseConfig).done(function (data) {
                    for (var x = 0; x < data.length; x++) {
                        $('#timeConfigCompare, #gridConfigCompare, #dataConfigCompare')
                            .append($("<option></option>")
                                .attr("value", x)
                                .text(data[x]));
                    }
                });
            });
            $('#addData').click(function () {
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
                    appConstructor.newData(config_1, gInterface);

                } catch (e) {
                    gInterface.UI.alert(e);
                }
            });
            $("input[option='heightExtrusion']").change(function () {
                var checked = $("input[option='heightExtrusion']").is(':checked') ? 1 : 0;
                if (checked) {
                    $("input[option='shown']").val(1);
                    $("input[option='shown']").attr("disabled", true);
                } else {
                    $("input[option='shown']").attr("disabled", false);
                }

            });

            $("#start").click(function () {
                var gridUrl = $("input[option='gr1']").val();
                var urlRef = $("input[option='re1']").val();
                var timeRef = Number($("select[option='re3']").val());
                var gridRef = Number($("select[option='re4']").val());
                var separatorRef = $("input[option='re2']").val();
                var idSeparator = $("input[option='re6']").val();
                var dataRef = $("select[option='re5']").val();
                var reference = 0;

                var heightExtrusion = $("input[option='heightExtrusion']").is(':checked') ? 1 : 0;

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
                var colors = [GlobeHelper.getRGB(minColor), GlobeHelper.getRGB(midColor), GlobeHelper.getRGB(maxColor)];

                var half = 0;

                appConstructor.init({
                    globe: 'canvasOne',
                    gridUrl: gridUrl,
                    isCSV: 0,
                    csv: {
                        csvUrl: "csvData.csv",
                        zone: 32,
                        source: "+proj=longlat +ellps=WGS84 +datum=WGS84 +no_defs"
                    },


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
                     time: 0,//timeRef,
                     id: 1,//gridRef,
                     data: [2, 4],//dataRef,
                     half: half,
                     separator: separatorRef,
                     idSeparator: idSeparator,
                     url: urlRef,
                     reference: reference,
                     heightExtrusion: heightExtrusion
                     }/*
                    config_0: {
                        time: 0,//timeRef,
                        id: 1,//gridRef,
                        data: [1],//dataRef,
                        lat: 2,
                        lng: 3
                    }
*/
                }, gInterface);
            });

            $('input[name=optradio]').change(function () {

                var val0 = Number($('input[name=optradio]:checked', '#radioButtons').val());


                if (globe.eventListeners.dblclick) {
                    globe.removeEventListener("dblclick", self.handlePick);
                }
                var handle;
                if (val0) {
                    gInterface.UI.resetFilter();
                    gInterface.makeBigDoxels();
                    bigEnabled = 1;
                    var rect = gInterface.rect;
                    var bigCubes = gInterface.bigCubes;
                    handle = handlePicks.getBigDoxels(rect, bigCubes, globe);
                    globe.addEventListener("dblclick", handle);
                    self.handlePick = handle;

                } else {
                    handle = handlePicks.getDoxel(gInterface);
                    self.handlePick = handle;
                    globe.addEventListener("dblclick", handle);
                }

            });
        };

        return ESTWA;

    }
)
;

