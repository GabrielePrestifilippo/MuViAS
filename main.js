requirejs.config({
    baseUrl: '.',
    paths: {
        app: '../src'
    }
});

define(['myScripts/ESTWA'
    ],
    function (ESTWA) {
        new ESTWA({globe: 'canvasOne'});
    });


var showAdvanced = 0;
$("#advanced").click(function () {
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
$("#compare").click(function () {
    if (!showCompare) {
        $("#compareOptions").show();
        showCompare = 1;
    } else {
        $("#compareOptions").hide();
        showCompare = 0;
    }
});


Object.size = function (obj) {
    var size = 0,
        key;
    for (key in obj) {
        if (obj.hasOwnProperty(key)) size++;
    }
    return size;
};

