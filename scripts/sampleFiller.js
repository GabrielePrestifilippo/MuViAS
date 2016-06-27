$("#teleSample").click(function () {
    $("input[option='re1']").val("/ESTWA/data/blocks.csv");
    $("#loadConfig").click();
    setTimeout(function () {

        $("select[option='re4']").val(1);// grid 1
        $("select[option='re3']").val(0);//time 0
        $("select[option='re5']").val([2, 4]);//data
        $("input[option='re2']").val(".");
        $("input[option='re6']").val("_");
        $("input[option='shown']").val(3);//3 layers
        $("#configType").val(4);
        $("#configType").change();
    }, 1000);

});

$("#turinSample").click(function () {
    $("input[option='re1']").val("/ESTWA/data/torino.csv");
    $("#loadConfig").click();
    setTimeout(function () {

        $("input[option='csvImporting']").prop("checked", true);
        $("select[option='re8']").val(0); //time
        $("select[option='re9']").val([1, 2]);//data
        $(".latitudeConfig").val(3);//lat
        $(".longitudeConfig").val(4);//lng
        $("input[option='heightExtrusion']").prop("checked", true);
        $("#configType").val(4);
        $("#configType").change();
    }, 1000);
});

$("#litoSample").click(function () {
    $("input[option='re1']").val("/ESTWA/data/chalk_small.csv");
    $("#loadConfig").click();
    setTimeout(function () {

        $("input[option='csvImporting']").prop("checked", true);
        $("select[option='re8']").val(4); //time
        $("input[option='re10']").val(5);//subdivisions
        $("select[option='re9']").val([2, 3]);//data
        $(".latitudeConfig").val(1);//lat
        $(".longitudeConfig").val(0);//lng
        $("input[option='initH']").val(0);//initH
        $("input[option='heightCube']").val(200);//height cubes
        $("input[option='heightExtrusion']").prop("checked", true);
        $("#configType").val(4);
        $("#configType").change();
    }, 1000);
});


$("#rasdaSample").click(function () {

    $("#loadConfig").click();
    setTimeout(function () {
        $("input[option='re1']").val("http://ows.rasdaman.org/rasdaman/ows");
        $("input[option='isUrl']").prop("checked", true);
        $("input[option='monthRange2']").val(4);//end-month
        gInterface._navigator.lookAtLocation.longitude = 14.209447413225549;
        gInterface._navigator.lookAtLocation.latitude = 37.70978565490195;
        gInterface._navigator.range = 312535.24849800026;
        $("input[option='initH']").val(0);//initH
        $("input[option='heightCube']").val(600);//height cubes
        $("input[option='heightExtrusion']").prop("checked", true);
        $("#configType").val(4);
        $("#configType").change();
    }, 1000);
});

