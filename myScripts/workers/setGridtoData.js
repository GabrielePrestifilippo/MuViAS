onmessage = function (e) {
    console.log('Message received from main script');

    var gridLayer = e.data[0];
    var times = e.data[1];
    var config = e.data[2];

    gridLayer = JSON.parse(gridLayer);
    for (var x in times) {
        var timesLength = times[x].length;
        for (var y = 0; y < timesLength; y++) {
            var timesXYlength = times[x][y].length;
            for (var z = 0; z < timesXYlength; z++) {
                var gridLength = gridLayer.features.length;
                for (var w = 0; w < gridLength; w++) {
                    var ob = times[x][y][z];
                    var r = gridLayer.features[w];
                    var position = [r.properties.lat, r.properties.lng];
                    if (position[0] !== 0 && position[1] !== 0) {
                        var timePoint = [Number(ob[config.data.length + 1][0]), Number(ob[config.data.length + 1][1])];

                        if (position[0] == timePoint[0] && position[1] == timePoint[1]) {
                            ob[0] = r.properties.id;
                        }
                    }
                }
            }
        }
    }
    postMessage(JSON.stringify(times));
}