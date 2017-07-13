var gInterface; //testing variables
var appConstructor;
var tourStarted = 0;
define(['./AppConstructor',
        './GlobeInterface',
        './Globe',
        './Configurator',
        './HandlePicks',
        './UserInterface',
        './GlobeHelper',
        './navigator/MoveNavigator',
        './Controls',
        './util/ServersPanel',
        './util/GeoJSONPanel',
        './util/GeoTIFFPanel',
        '../worldwind/formats/kml/KmlFile',
        './util/KMLPanel',
        './util/SurfaceImagePanel',
        './util/NDVIPanel',
        './util/HeatmapPanel',
        './LayerManager'

    ],
    function (AppConstructor,
              GlobeInterface,
              Globe,
              Configurator,
              HandlePicks,
              UI,
              GlobeHelper,
              MoveNavigator,
              Controls,
              ServersPanel,
              GeoJSONPanel,
              GeoTIFFPanel,
              KMLFile,
              KMLPanel,
              SurfaceImagePanel,
              NDVIPanel,
              HeatmapPanel,
              LayerManager) {

        var ESTWA;
        ESTWA = function (options) {

            var globe = new Globe({id: options.globe});
            var controls = new Controls(globe);
            gInterface = new GlobeInterface(globe);
            appConstructor = new AppConstructor();
            this.GeoJSONPanel = new GeoJSONPanel(globe);
            this.GeoTIFFPanel = new GeoTIFFPanel(globe);
            this.KMLPanel = new KMLPanel(globe, KMLFile);
            this.SurfaceImagePanel = new SurfaceImagePanel(globe);
            this.NDVIPanel = new NDVIPanel(globe, layerManger);
            this.HeatmapPanel = new HeatmapPanel(globe, gInterface.globe.controller, controls);
            this.serversPanel = new ServersPanel(globe);
            this.serversPanel.attachServer("http://ows.terrestris.de/osm/service?");
            var layerManger = new LayerManager(globe);


            /**
             *
             * @type {MoveNavigator}
             * @private
             * Create a Navigator. The viewPortChangedListener allows to download tiles from an external database
             */

            gInterface._navigator = new MoveNavigator({
                wwd: gInterface.globe,
                zoomLevelListeners: [gInterface.globe.redraw.bind(this)],
                viewPortChangedListeners: [gInterface.globe.redraw.bind(this), appConstructor.addCsv.bind(appConstructor, gInterface)]
            });

            gInterface.globe.controller.handlePanOrDrag = function (recognizer) {

                if (this.worldWindow.globe.is2D()) {
                    this.handlePanOrDrag2D(recognizer);
                } else {
                    this.handlePanOrDrag3D(recognizer);
                }
                if (recognizer.state == "ended") {
                    setTimeout(function () {
                        appConstructor.addCsv(gInterface);
                    }, 100)
                }
            }


            gInterface.setUI(new UI(gInterface));
            /**
             *  Creation of a HandlePick and setting into the Globe Interface
             */
            var handlePicks = new HandlePicks();
            gInterface.UI.handlePick = handlePicks;

            var compare = 0;
            var bigEnabled = 0;


            /**
             * Clicking listeners for options in the interface
             */

            $("#cleanAll").click(function () {
                appConstructor.cleanAll(gInterface);
                gInterface.globe.layers.splice(3);//xxx to be defined
                $("#controls").show();
                $(".afterControls").hide();
            });

            /**
             * ChangeValues allow to update some options in the interface
             * changeHeight is the initial Height of the Voxels
             * changeBig is the automatic Big Voxels Creation
             * changeStat is the statistic applied to the Big Voxels
             */
            $("#changeValues").click(function () {
                var val = Number($("#changeHeight").val());
                var big = Number($("#changeBig").val());
                var stat = Number($("#changeStat").val());
                gInterface.updateOpt([val, big, stat]);
            });

            /**
             * Initial file selector
             */
            var fileType = 1;
            $("#fileType").change(function () {
                var val = $("#fileType").val();
                if (val == "1") {
                    $("#csv-file").show();
                    $("#hostedFileSelector").hide();
                    $("#loadConfig").show();
                    fileType = 0;
                } else if (val == "2") {
                    $("#csv-file").hide();
                    $("#hostedFileSelector").show();
                    $("#loadConfig").show();
                    fileType = 1;

                } else {
                    $("#csv-file").hide();
                    $("#hostedFileSelector").hide();
                    $("#sample").show()
                    fileType = 1;

                }

            });


            /**
             * Initial grid selector
             */
            var gridType = 1;
            $("#gridType").change(function () {
                var val = $("#gridType").val();
                if (val == "1") {
                    $("#grid-file").show();
                    $("#hostedGridSelector").hide();
                    gridType = 0;
                } else {
                    $("#grid-file").hide();
                    $("#hostedGridSelector").show();
                    gridType = 1;

                }

            });

            /**
             * Select to which variable in the dataset the filters should be applied
             * if checkCompare is selected then the second variable would affect the filters
             */
            $("#checkCompare").change(function () {
                compare = $("#checkCompare").is(':checked') ? 1 : 0;
                gInterface.compare = compare;
                gInterface.UI.resetValueFilter();
            });

            /**
             * Event listener for selecting to use small voxels or big voxels
             */
            $('input[name=optradio]').change(function () {

                var val0 = Number($('input[name=optradio]:checked', '#radioButtons').val());

                if (globe.eventListeners.dblclick) {
                    globe.removeEventListener("dblclick", self.handlePick);
                }
                var handle;
                if (val0) {
                    gInterface.UI.resetValueFilter();
                    gInterface.makeBigDoxels();
                    bigEnabled = 1;
                    var rect = gInterface.rect;
                    var bigCubes = gInterface.bigVoxels.layers;
                    handle = handlePicks.getBigDoxels(rect, bigCubes, globe);
                    globe.addEventListener("dblclick", handle);
                    self.handlePick = handle;

                } else {
                    handle = handlePicks.getDoxel(gInterface);
                    self.handlePick = handle;
                    globe.addEventListener("dblclick", handle);
                }

            });

            /**
             * Specify if we want to activate the listener for the movement
             * to download new tiles while we move (Used just for database connection)
             */
            $("#autoTile").change(function () {
                var autoTile = $("#autoTile").is(':checked') ? 1 : 0;
                gInterface.autoTile = autoTile;
            });

            /**
             * Control for the atmosphere
             */
            $("#atmosphere-icon").click(function () {

                if (globe.atmosphereLayer.enabled) {
                    globe.atmosphereLayer.enabled = false;
                    $('#atmosphere-icon').attr('style', 'color: #444 !important');
                } else {
                    globe.atmosphereLayer.enabled = true;
                    $("#atmosphere-icon").css("color", "#2f6eff");

                }
                globe.redraw();

            });

            /**
             * Load the configuration through a file and set all the
             * values from the file into the configuration boxes in the interface
             */
            $("#loadConfig").click(function () {
                loadConfiguration();
            });


            function loadConfiguration(solveMain) {
                var configurator = new Configurator();
                if (fileType === 0) {
                    var urlRef = $("#csv-file").get(0).files[0];
                } else {
                    var urlRef = $("input[option='re1']").val();
                }

                var promiseDataConfig = new Promise(function (resolve) {
                    configurator.getConfig(urlRef, resolve);
                });
                $('.timeConfig, .gridConfig, .dataConfig, .latitudeConfig, .longitudeConfig').html("");
                promiseDataConfig.then(function (data) {
                    for (var x = 0; x < data.length; x++) {
                        $('.timeConfig, .gridConfig, .dataConfig, .latitudeConfig, .longitudeConfig')
                            .append($("<option></option>")
                                .attr("value", x)
                                .text(data[x]));
                    }
                    loadConfig = true;
                    if (solveMain) {
                        solveMain();
                    }
                }).catch(function (e) {
                    $("#loading").hide();
                    alert("Error occurred:" + e)
                });
                $("#configType").show();
                $("#advanced").show();
                $("#start").show();

            }

            /**
             * Load the configuration file for using a second dataset to compare with
             * the first one. Only possible if both datasets have points in common
             */
            $("#loadConfigCompare").click(function () {
                $("#configSelectorCompare").show();
                configurator = new Configurator();
                var urlRef = $("input[option='co1']").val();
                var promiseConfig = new Promise(function (resolve) {
                    configurator.getConfig(urlRef, resolve);
                });

                promiseConfig.then(function (data) {
                    for (var x = 0; x < data.length; x++) {
                        $('#timeConfigCompare, #gridConfigCompare, #dataConfigCompare')
                            .append($("<option></option>")
                                .attr("value", x)
                                .text(data[x]));
                    }
                }).catch(function (e) {
                    $("#loading").hide();
                    alert("Error occurred:" + e)
                });
            });

            /**
             * Adding a new dataset to compare, using the configuration got
             * from the loadConfigCompare
             */
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
                    $("#afterType option[value=2]").attr("disabled", "disabled");
                } catch (e) {
                    gInterface.UI.alert(e);
                }
            });

            /**
             * Start the application, loading all the configuration from the interface,
             *
             */
            $("#start").click(function () {

                $("#loading").show();

                var tour = $('#my-tour-id').tourbus({});
                tour.trigger('stop');

                $("#CSVButton").click();
                var isLocal = 0;
                if (gridType === 0) {
                    var gridUrl = $("#grid-file").get(0).files[0];
                    isLocal = 1;
                } else {
                    var gridUrl = $("input[option='gr1']").val();
                }


                if (fileType === 0) {
                    var urlRef = $("#csv-file").get(0).files[0];
                } else {
                    var urlRef = $("input[option='re1']").val();
                }
                var timeRef = Number($("select[option='re3']").val());
                var gridRef = Number($("select[option='re4']").val());
                var separatorRef = $("input[option='re2']").val();
                var idSeparator = $("input[option='re6']").val();
                var dataRef = $("select[option='re5']").val();
                var latitudeRef = Number($(".latitudeConfig").val());
                var longitudeRef = Number($(".longitudeConfig").val());
                var reference = 0;

                var timeRefCSV = Number($("select[option='re8']").val());

                var quadSub = Number($("input[option='re10']").val());
                var dataRefCSV = $("select[option='re9']").val();

                var heightExtrusion = $("input[option='heightExtrusion']").is(':checked') ? 1 : 0;
                var isUrl = $("input[option='isUrl']").is(':checked') ? 1 : 0;
                var csvImporting = $("input[option='csvImporting']").is(':checked') ? 1 : 0;

                var height = Number($("input[option='heightCube']").val());
                var shown = Number($("input[option='shown']").val());
                var maxApp = Number($("input[option='maxApp']").val());
                var subxy = Number($("input[option='subxy']").val());
                var subz = Number($("input[option='subz']").val());
                var initH = Number($("input[option='initH']").val());
                var statIndex = Number($("select[option='statIndex']").val());


                var monthRange1 = Number($("input[option='monthRange1']").val());
                var monthRange2 = Number($("input[option='monthRange2']").val());
                var coverage = $("input[option='coverage']").val();

                $("#alert").css("visibility", "hidden");
                $("#alert").css("visibility", "hidden");
                $("#controls").hide();
                $(".afterControls").show();


                var maxColor = $("input[name='maxcolor']").val();
                var minColor = $("input[name='mincolor']").val();
                var midColor = $("input[name='midcolor']").val();
                var colors = [GlobeHelper.getRGB(minColor), GlobeHelper.getRGB(midColor), GlobeHelper.getRGB(maxColor)];


                $("#legendScale").css("background", "linear-gradient(to bottom," + minColor + " 0%," + midColor + " 50%," + maxColor + " 100%)");
                $("#legendScale").css("background", "-moz-linear-gradient(to bottom," + minColor + " 0%," + midColor + " 50%," + maxColor + " 100%)");
                $("#legendScale").css("background", "-webkit-linear-gradient(to bottom," + minColor + " 0%," + midColor + " 50%," + maxColor + " 100%)");

                var refSystem = $("input[option='refSystem']").val();
                var csvZone = Number($("input[option='csvZone']").val());

                if (csvImporting || isUrl) {
                    $(".autoTile").show();
                }
                var half = 0;
                try {
                    appConstructor.init({
                        globe: 'canvasOne',
                        gridUrl: gridUrl,
                        isCSV: csvImporting,
                        csv: {
                            csvUrl: urlRef,
                            zone: csvZone,
                            source: refSystem,
                            time: timeRefCSV,
                            data: dataRefCSV,
                            quadSub: quadSub,
                            delimiter: ";"
                        },

                        config_0: {
                            time: timeRef,
                            id: gridRef,
                            data: dataRef,
                            half: half,
                            separator: separatorRef,
                            idSeparator: idSeparator,
                            url: urlRef,
                            reference: reference,
                            heightExtrusion: heightExtrusion,
                            lat: latitudeRef,
                            lng: longitudeRef,
                            monthRange1: monthRange1,
                            monthRange2: monthRange2,
                            coverage: coverage
                        },
                        isLocal: isLocal,
                        isUrl: isUrl,
                        heightCube: height,
                        /*  cube's height                               */
                        maxShown: shown,
                        /*  max smallVoxels in view                          */
                        maxInApp: maxApp,
                        /*  max smallVoxels in the app                       */
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
                        maxDownload: 2000,
                        /*  max cubes downloded                         */
                        colors: colors
                        /*  colors for min and max voxels               */


                    }, gInterface);
                } catch (e) {
                    gInterface.UI.alert(e);
                }

            });

            $("#teleSample").click(function () {
                $("input[option='re1']").val("data/blocks.csv");
                $("#loading").show();
                var loadConfig = new Promise(function (resolve) {
                    loadConfiguration(resolve);
                });
                loadConfig.then(function () {

                    $("input[option='gr1']").val("data/grid.txt");
                    $("select[option='re4']").val(1);// grid 1
                    $("select[option='re3']").val(0);//time 0
                    $("select[option='re5']").val([2, 4]);//data
                    $("input[option='re2']").val(".");
                    $("input[option='re6']").val("_");
                    $("input[option='shown']").val(3);//3 layers
                    $("#configType").val(4);
                    $("#configType").change();
                    $("#loading").hide();
                }).catch(function (e) {
                    $("#loading").hide();
                    alert("Error occurred:" + e)
                });

            });

            $("#turinSample").click(function () {
                $("#loading").show();
                $("input[option='re1']").val("data/torino.csv");
                $("#loadConfig").click();
                var loadConfig = new Promise(function (resolve) {
                    loadConfiguration(resolve);
                });
                loadConfig.then(function () {
                    $("input[option='csvImporting']").prop("checked", true);
                    $("select[option='re8']").val(0); //time
                    $("select[option='re9']").val([1, 2]);//data
                    $(".latitudeConfig").val(3);//lat
                    $(".longitudeConfig").val(4);//lng
                    $("input[option='heightExtrusion']").prop("checked", true);
                    $("#configType").val(4);
                    $("#configType").change();
                    $("#loading").hide();
                }).catch(function (e) {
                    $("#loading").hide();
                    alert("Error occurred:" + e)
                });
            });

            $("#fullSample").click(function () {
                $("#loading").show();
                $("input[option='re1']").val("data/full.csv");
                $("#loadConfig").click();
                var loadConfig = new Promise(function (resolve) {
                    loadConfiguration(resolve);
                });
                loadConfig.then(function () {
                    gInterface.globe.navigator.longitude = 14.209447413225549;//xxx
                    gInterface.globe.navigator.latitude = 37.70978565490195;
                    gInterface.globe.navigator.range = 312535.24849800026;
                    $("input[option='csvImporting']").prop("checked", true);
                    $("input[option='heightExtrusion']").prop("checked", false);
                    $("select[option='re8']").val(3); //time
                    $("select[option='re9']").val([2]);//data
                    $(".latitudeConfig").val(0);//lat
                    $(".longitudeConfig").val(1);//lng
                    $("#configType").val(4);
                    $("#configType").change();
                    $("#loading").hide();
                }).catch(function (e) {
                    $("#loading").hide();
                    alert("Error occurred:" + e)
                });
            });

            $("#litoSample").click(function () {
                $("#loading").show();
                $("input[option='re1']").val("data/chalk_small.csv");
                $("#loadConfig").click();
                var loadConfig = new Promise(function (resolve) {
                    loadConfiguration(resolve);
                });
                loadConfig.then(function () {

                    $("input[option='csvImporting']").prop("checked", true);
                    $("select[option='re8']").val(4); //time
                    $("input[option='re10']").val(4);//subdivisions
                    $("select[option='re9']").val([2, 3]);//data
                    $(".latitudeConfig").val(1);//lat
                    $(".longitudeConfig").val(0);//lng
                    $("input[option='initH']").val(0);//initH
                    $("input[option='heightCube']").val(200);//height cubes
                    $("input[option='heightExtrusion']").prop("checked", true);
                    $("#configType").val(4);
                    $("#configType").change();
                    $("#loading").hide();
                }).catch(function (e) {
                    $("#loading").hide();
                    alert("Error occurred:" + e)
                });
            });

            $("#rasdaSample").click(function () {

                $("#loadConfig").click();
                var loadConfig = new Promise(function (resolve) {
                    $("#loading").show();
                    loadConfiguration(resolve);
                });
                loadConfig.then(function () {
                    $("input[option='re1']").val("http://ows.rasdaman.org/rasdaman/ows");
                    $("input[option='isUrl']").prop("checked", true);
                    $("input[option='monthRange2']").val(1);//end-month
                    gInterface.globe.controller.lookAt.longitude = 14.209447413225549;
                    gInterface.globe.controller.lookAt.latitude = 37.70978565490195;
                    gInterface.globe.controller.lookAt.range = 312535.24849800026;
                    $("input[option='initH']").val(10000);//initH
                    $("input[option='heightCube']").val(10000);//height cubes
                    $("input[option='shown']").val(1);//3 layers
                    $(".data").val(2);//lng
                    $("#configType").val(4);
                    $("#configType").change();
                    $("#loading").hide();
                }).catch(function (e) {
                    $("#loading").hide();
                    alert("Error occurred:" + e)
                });
            });

        };


        return ESTWA;

    }
)
;

