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



Object.size = function (obj) {
    var size = 0,
        key;
    for (key in obj) {
        if (obj.hasOwnProperty(key)) size++;
    }
    return size;
};

