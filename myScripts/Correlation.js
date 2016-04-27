define([], function () {

    var Correlation = function () {

    };
    Correlation.getCorrelationDatasets = function (resolve, time, config) {

        var first = [];
        var second = [];
        var sum0 = 0;
        var sum1 = 0;

        var x, y, id, val;
        if (config[1]) {
            for (x in time) {
                if (time[x][0] && time[x][1]) {
                    var length = Math.min(time[x][0].length, time[x][1].length);
                    for (y = 0; y < length; y++) {
                        id = time[x][0][y][0];

                        if (config[0].separator) {
                            val = Number(time[x][0][y][1].split(config[0].separator).join(""));
                        } else {
                            val = Number(time[x][0][y][1]);
                        }
                        sum0 += val;

                        id = time[x][1][y][0];

                        if (config[0].separator) {
                            val = Number(time[x][1][y][1].split(config[1].separator).join(""));
                        } else {
                            val = Number(time[x][1][y][1]);
                        }
                        sum1 += val;
                    }

                    first.push(sum0 / time[x][0].length);
                    second.push(sum1 / time[x][1].length);
                }
            }
        } else {
            for (x in time) {

                for (y = 0; y < time[x][0].length; y++) {
                    id = time[x][0][y][0];
                    if (time[x][0][y].length < 3) {
                        return;
                    }
                    if (config[0].separator) {
                        val = Number(time[x][0][y][1].split(config[0].separator).join(""));
                    } else {
                        val = Number(time[x][0][y][1]);
                    }
                    sum0 += val;
                    if (config[0].separator) {
                        val = Number(time[x][0][y][2].split(config[0].separator).join(""));
                    } else {
                        val = Number(time[x][0][y][2]);
                    }
                    sum1 += val;
                }

                first.push(sum0 / time[x][0].length);
                second.push(sum1 / time[x][0].length);
            }
        }
        var corr = [first, second];
        var correlation = this.correlation(corr, 0, 1);
        resolve(correlation);
    };
    Correlation.getCorrelationVariables = function (configuration, time, config) {

        var id = configuration.id;
        var names = configuration.names;
        var arrayCorrelation = [names];

        var x, y, z, entry, entryArray, entryData;
        for (x in time) {
            var specTime = time[x];
            if (!config[1]) {
                for (y in specTime[0]) {
                    if (specTime[0][y][0] == id) {
                        entry = [];
                        entryArray = [this.toTime(Number(x))];
                        for (var h = 1; h < specTime[0][y].length; h++) {
                            entryData = specTime[0][y][h];
                            if (config[0].separator) {
                                entryData = Number(entryData.split(config[0].separator).join(""));
                            }
                            entryArray.push(entryData);
                        }
                        arrayCorrelation.push(entryArray);
                    }
                }
            } else {
                if (specTime[0] && specTime[1]) {
                    for (y in specTime[0]) {
                        if (specTime[0][y][0] == id) {
                            entry = [];
                            entryArray = [this.toTime(Number(x))];
                            entryData = specTime[0][y][1];
                            if (config[0].separator) {
                                entryData = Number(entryData.split(config[0].separator).join(""));
                            }
                            entryArray.push(entryData);
                            for (z in specTime[1]) {
                                if (specTime[1][z][config[1].id] == id) {
                                    entryData = specTime[1][y][config[1].data[0]];
                                    if (config[1].separator) {
                                        entryData = Number(entryData.split(config[1].separator).join(""));
                                    }
                                }
                            }
                            entryArray.push(entryData);
                            arrayCorrelation.push(entryArray);
                        }
                    }
                }
            }
        }
        return arrayCorrelation;
    };
    Correlation.correlation = function (prefs, p1, p2) {

        var si = [];

        for (var key in prefs[p1]) {
            if (prefs[p2][key]) si.push(key);
        }

        var n = si.length;

        if (n === 0) return 0;

        var sum1 = 0;
        var i;
        for (i = 0; i < si.length; i++) sum1 += prefs[p1][si[i]];

        var sum2 = 0;
        for (i = 0; i < si.length; i++) sum2 += prefs[p2][si[i]];

        var sum1Sq = 0;
        for (i = 0; i < si.length; i++) {
            sum1Sq += Math.pow(prefs[p1][si[i]], 2);
        }

        var sum2Sq = 0;
        for (i = 0; i < si.length; i++) {
            sum2Sq += Math.pow(prefs[p2][si[i]], 2);
        }

        var pSum = 0;
        for (i = 0; i < si.length; i++) {
            pSum += prefs[p1][si[i]] * prefs[p2][si[i]];
        }

        var num = pSum - (sum1 * sum2 / n);
        var den = Math.sqrt((sum1Sq - Math.pow(sum1, 2) / n) *
            (sum2Sq - Math.pow(sum2, 2) / n));

        if (den === 0) return 0;

        return num / den;

    };
    Correlation.toTime = function (timeVal) {
        var date = new Date(0);
        date.setMilliseconds(Number(timeVal + "000"));
        timeVal = date.getDate() + "/" + date.getMonth() + "/" + date.getFullYear() + " " + date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();
        return timeVal;
    };
    return Correlation;
});