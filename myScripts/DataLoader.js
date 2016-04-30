define([], function () {

    var DataLoader = function (parent) {

    };

    DataLoader.prototype.getData = function (urlData, resolve, config) {

        var self = this;
        var completed = 0;

        Papa.parse(urlData, {
            worker: true,
            download: true,
            preview: parent.maxDownload,
            fastMode: true,
            complete: function (res) {
                if (!completed) {
                    completed = 1;
                 
                    res.data.bounds = self.getDataBounds(res.data, config);
                    if(config.heightExtrusion) {
                        res.data.bounds1 = self.getDataBounds1(res.data, config);
                    }
                    resolve(res.data);
                    return 1;


                }
            }
        });
    };
    DataLoader.prototype.getDbData = function (urlData, resolve, number) {

        var parent = this.parent;
        var self = this;

        $.get(urlData, function (data) {

            var myData = [];
            for (var x in data) {
                var element = [];
                element.push(data[x].ts);
                element.push(String(data[x].cellId));
                element.push(String(data[x].data_mi[1].sms_in));
                element.push(String(data[x].data_mi[1].call_out));
                element.push(String(data[x].data_mi[0].sms_in));
                myData.push(element);
            }

            self.bounds = self.getDataBounds(myData, parent.config[number]);

            parent.gInterface.cubeFromData(myData, number);
            resolve(myData);

        });


    };
    DataLoader.prototype.getDataBounds = function (result, config) {
        var max = -Infinity;
        var min = Infinity;
        var tmp;
        for (var x = 0; x < result.length; x++) {
            tmp = result[x];
            if (tmp[config.data[0]].indexOf(config.separator) !== -1) {
                max = Math.max(max, tmp[config.data[0]].split(config.separator).join(""));
                min = Math.min(min, tmp[config.data[0]].split(config.separator).join(""));
            }
        }

        return [max, min];
    };
    DataLoader.prototype.getDataBounds1 = function (result, config) {
        var max = -Infinity;
        var min = Infinity;
        var tmp;
        for (var x = 0; x < result.length; x++) {
            tmp = result[x];
            if (tmp[config.data[0]].indexOf(config.separator) !== -1) {
                max = Math.max(max, tmp[config.data[1]].split(config.separator).join(""));
                min = Math.min(min, tmp[config.data[1]].split(config.separator).join(""));
            }
        }

        return [max, min];
    };

    return DataLoader;
});


//sample data:
/*var data = [{
 "cellId": "3939_0_1",
 "data_mi": [{
 "country": 0,
 "sms_in": 0.005561930316498313
 }, {
 "sms_in": 1.5526344513332655,
 "call_out": 0.26031366742441833

 }],
 "ts": "ISODate(2013 - 12 - 08 T21: 40: 00 Z)"
 }, {
 "cellId": "3939_0_2",
 "data_mi": [{
 "country": 0,
 "sms_in": 0.005361950316498313
 }, {
 "sms_in": 1.0526344544332655,
 "call_out": 0.16031326742441833

 }],
 "ts": "ISODate(2013 - 12 - 08 T21: 40: 00 Z)"
 }];*/