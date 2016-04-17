/* global define:true, Papa:true;,$:true*/

define([], function() {

    var myData = function(parent) {
        this.parent = parent;
    };

    myData.prototype.getData = function(urlData, resolve) {
        var parent = this.parent;
        var self = this;
        var completed = 0;
        var firstTime = 0;

        Papa.parse(urlData, {
            worker: true,
            download: true,
            preview: parent.maxDownload,
            fastMode: true,
            complete: function(res) {
                if (!completed) {
                    completed = 1;
                    self.bounds = self.getDataBounds(res.data, parent.config);
                    parent.cubeFromData(res.data, 0); //first or second half

                    resolve(res.data);

                }
            }
        });
    };



    myData.prototype.getDataBounds = function(result, config) {
        var max = -Infinity;
        var min = Infinity;
        var tmp;
        for (var x = 0; x < result.length; x++) {
            tmp = result[x];
            if(tmp[config.data[0]].indexOf(config.separator)!==-1){
            max = Math.max(max, tmp[config.data[0]].split(config.separator).join(""));
            min = Math.min(min, tmp[config.data[0]].split(config.separator).join(""));
            }
        }
    
    return [max, min];
};

return myData;
});