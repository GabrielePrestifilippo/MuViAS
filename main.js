requirejs.config({
    paths: {
        jquery: 'thirdparty/jquery.min',
        jQueryUI: 'thirdparty/jquery-ui',
        tourbus: 'thirdparty/jquery-tourbus.min',
        fancytree: 'thirdparty/fancytree.min',
        bootstrap: './src/scripts/bootstrap.min',
        d3: 'thirdparty/d3.min',
        QuadTree: 'thirdparty/QuadTree',
        googleChart: 'thirdparty/loader'
    },
    shim: {
        'tourbus': {
            deps: ['jquery'],
        },
        'fancytree': {
            deps: ['jQueryUI'],

        },
    }
});
define(['./src/scripts/ESTWA', 'jquery', 'tourbus', 'fancytree', 'd3', 'QuadTree', 'googleChart'],
    function (ESTWA, $) {
        new ESTWA({globe: 'canvasOne'});

        $("#loading").hide();
        var tour = $('#my-tour-id').tourbus({});
        tour.trigger('depart.tourbus');

        function closeAllPanels() {
            $("#CSVMenu").hide();
            $("#CSVMenu").data("open", 0);
            $("#wmsMenu").hide();
            $("#wmsMenu").data("open", 0);
            $("#HeatmapMenu").hide();
            $("#HeatmapMenu").data("open", 0);
            $("#SurfaceImageMenu").hide();
            $("#SurfaceImageMenu").data("open", 0);
            $("#geoJSONMenu").hide();
            $("#geoJSONMenu").data("open", 0);
            $("#geoJSONMenu").hide();
            $("#geoJSONMenu").data("open", 0);
            $("#geoTIFFMenu").hide();
            $("#geoTIFFMenu").data("open", 0);
            $("#geoTIFFMenu").hide();
            $("#geoTIFFMenu").data("open", 0);
            $("#KMLMenu").hide();
            $("#KMLMenu").data("open", 0);
            $("#NDVIMenu").hide();
            $("#NDVIMenu").data("open", 0);
            $("#searchMenu").hide();

        }


        $("#CSVButton").click(function () {
            var open = $("#CSVMenu").data("open");
            closeAllPanels();
            if (!open) {
                $("#CSVMenu").show();
                $("#CSVMenu").data("open", 1);

            } else {
                $("#CSVMenu").hide();
                $("#CSVMenu").data("open", 0);
            }
        });

        $("#wmsButton").click(function () {
            var open = $("#wmsMenu").data("open");
            closeAllPanels();
            if (!open) {
                $("#wmsMenu").show();
                $("#wmsMenu").data("open", 1);

            } else {
                $("#wmsMenu").hide();
                $("#wmsMenu").data("open", 0);
            }
        });

        $("#geoJSONButton").click(function () {
            var open = $("#geoJSONMenu").data("open");
            closeAllPanels();
            if (!open) {
                $("#geoJSONMenu").show();
                $("#geoJSONMenu").data("open", 1);

            } else {
                $("#geoJSONMenu").hide();
                $("#geoJSONMenu").data("open", 0);
            }
        });

        $("#geoTIFFButton").click(function () {
            var open = $("#geoTIFFMenu").data("open");
            closeAllPanels();
            if (!open) {
                $("#geoTIFFMenu").show();
                $("#geoTIFFMenu").data("open", 1);

            } else {
                $("#geoTIFFMenu").hide();
                $("#geoTIFFMenu").data("open", 0);
            }
        });

        $("#KMLButton").click(function () {
            var open = $("#KMLMenu").data("open");
            closeAllPanels();
            if (!open) {
                $("#KMLMenu").show();
                $("#KMLMenu").data("open", 1);

            } else {
                $("#KMLMenu").hide();
                $("#KMLMenu").data("open", 0);
            }
        });

        $("#SurfaceImageButton").click(function () {
            var open = $("#SurfaceImageMenu").data("open");
            closeAllPanels();
            if (!open) {
                $("#SurfaceImageMenu").show();
                $("#SurfaceImageMenu").data("open", 1);

            } else {
                $("#SurfaceImageMenu").hide();
                $("#SurfaceImageMenu").data("open", 0);
            }
        });
        $("#HeatmapButton").click(function () {
            var open = $("#HeatmapMenu").data("open");
            closeAllPanels();
            if (!open) {
                $("#HeatmapMenu").show();
                $("#HeatmapMenu").data("open", 1);

            } else {
                $("#HeatmapMenu").hide();
                $("#HeatmapMenu").data("open", 0);
            }
        });

        $("#searchBoxButton").click(function () {
            var open = $("#searchMenu").data("open");
            closeAllPanels();
            if (!open) {
                $("#searchMenu").show();
                $("#searchMenu").data("open", 1);

            } else {
                $("#searchMenu").hide();
                $("#searchMenu").data("open", 0);
            }
        });
        $("#NDVIButton").click(function () {
            var open = $("#NDVIMenu").data("open");
            closeAllPanels();
            if (!open) {
                $("#NDVIMenu").show();
                $("#NDVIMenu").data("open", 1);

            } else {
                $("#NDVIMenu").hide();
                $("#NDVIMenu").data("open", 0);
            }
        });
        /**
         * Open (or close) the left menu, moving it to the right (or left)
         */
        /*
         $("#openButton").click(function () {

         var open = $("#controlMenu").data("open");
         if (!open) {
         $("#controlMenu").css("left", "0%");
         $("#openButton").css("right", "-5px");
         $("#controlMenu").data("open", 1);

         } else {
         $("#controlMenu").css("left", "-30%");
         $("#controlMenu").data("open", 0);
         $("#openButton").css("right", "-40px");
         }
         });
         */
        /**
         * Close the statistics menu in the bottom
         */
        $("#hideStatistics").click(function () {
            $("#bottomMenu").hide();
        });


        /**
         * Disable the possibility to show more than one layer if the height extrusion is checked
         */
        $("input[option='heightExtrusion']").change(function () {
            var checked = $("input[option='heightExtrusion']").is(':checked') ? 1 : 0;
            var dataRef = $("select[option='re5']").val();
            if (dataRef.length < 2) {
                gInterface.UI.alert("Error: At least two Data values must be selected to apply the extrusion");
                $("input[option='heightExtrusion']").prop("checked", false);
                return;
            }
            if (checked) {
                $("input[option='shown']").val(1);
                $("input[option='shown']").attr("disabled", true);
            } else {
                $("input[option='shown']").attr("disabled", false);
            }

        });

        /**
         * Shows different menu, depending on the dropdown menu selection
         */
        $("#configType").change(function () {
            var selected = $("#configType option:selected").val();
            if (selected == 1) {
                $("#configSelector").show();
                $("#CSVOptions").hide();
                $("#dbOptions").hide();
                $("#advancedOptions").hide();
            }
            if (selected == 2) {
                $("#configSelector").hide();
                $("#CSVOptions").show();
                $("#dbOptions").hide();
                $("#advancedOptions").hide();

            }
            if (selected == 3) {
                $("#configSelector").hide();
                $("#CSVOptions").hide();
                $("#dbOptions").show();
                $("#advancedOptions").hide();

            }
            if (selected == 4) {
                $("#configSelector").hide();
                $("#CSVOptions").hide();
                $("#dbOptions").hide();
                $("#advancedOptions").show();

            }

        });

        /**
         * Shows different menu, after the gInterface has started, depending on the dropdown menu selection
         */
        $("#afterType").change(function () {
            var selected = $("#afterType option:selected").val();
            if (selected == 0) {
                $("#sliders").show();
                $("#updateSettings").hide();
                $("#compareOptions").hide();
            }
            if (selected == 1) {
                $("#sliders").hide();
                $("#updateSettings").show();
                $("#compareOptions").hide();
            }
            if (selected == 2) {
                $("#sliders").hide();
                $("#updateSettings").hide();
                $("#compareOptions").show();

            }

        });

    });



