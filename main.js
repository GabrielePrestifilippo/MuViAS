requirejs.config({
    baseUrl: '.',
    paths: {
        app: '../src'
    }
});

define(['myScripts/ESTWA'],
    function (ESTWA) {
        new ESTWA({globe: 'canvasOne'});
    });

$("#openButton").click(function () {

    var open = $("#controlMenu").data("open");
    if (!open) {
        $("#controlMenu").css("left", "0%");
        $("#controlMenu").data("open", 1);

    } else {
        $("#controlMenu").css("left", "-30%");
        $("#controlMenu").data("open", 0);
    }
});

$("#hideStatistics").click(function () {

    $("#bottomMenu").hide();
});

$("#configType").change(function () {
    var selected = $("#configType option:selected").val();
    if (selected == 1) {
        $("#configSelector").show();
        $("#CSVOptions").hide();
        $("#advancedOptions").hide();
    }
    if (selected == 2) {
        $("#configSelector").hide();
        $("#CSVOptions").show();
        $("#advancedOptions").hide();

    }

});

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
$("#advanced").click(function () {
    var open = $("#advancedOptions").data("open");
    if (!open) {
        $("#advancedOptions").show();
        $("#configSelector").hide();
        $("#CSVOptions").hide();
        $("#advancedOptions").data("open", 1);
    } else {
        $("#advancedOptions").hide();
        $("#compareOptions").hide();
        $("#advancedOptions").data("open", 0);
    }
});


Object.size = function (obj) {
    alert("remove this!!");
    var size = 0,
        key;
    for (key in obj) {
        if (obj.hasOwnProperty(key)) size++;
    }
    return size;
};

