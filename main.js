requirejs.config({
    baseUrl: '.',
    paths: {
        app: '../src'
    }
});

define(['myScripts/ESTWA'],
    function (ESTWA) {
        new ESTWA({globe: 'canvasOne'});

        $("#loading").hide();
        var tour = $('#my-tour-id').tourbus({});
        tour.trigger('depart.tourbus');



        /**
         * Open (or close) the left menu, moving it to the right (or left)
         */
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



