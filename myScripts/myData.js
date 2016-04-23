/* global define:true, Papa:true;,$:true*/

define([], function() {

    var myData = function(parent) {
        this.parent = parent;
    };

    myData.prototype.getData = function(urlData, resolve, number) {
        var parent = this.parent;
        var self = this;
        var completed = 0;

        Papa.parse(urlData, {
            worker: true,
            download: true,
            preview: parent.maxDownload,
            fastMode: true,
            complete: function(res) {
                if (!completed) {
                    completed = 1;
                  //  try {
                        self.bounds = self.getDataBounds(res.data, parent.config[number]);
                        parent.globeInterface.cubeFromData(res.data, number);
                        resolve(res.data);
                        return 1;
                   /*     
                    }catch(e) {
                    parent.globeInterface.UI.alert("Error in data parsing");
                    }
                    */

                }
            }
        });
    };

    myData.prototype.getDbData = function(urlData, resolve, number) {

        var parent = this.parent;
        var self = this;

        $.get(urlData, function(data) {

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
            parent.GlobeInterfacecubeFromData(myData, number);
            resolve(myData);

        });


    };

    myData.prototype.getDataBounds = function(result, config) {
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

    return myData;
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