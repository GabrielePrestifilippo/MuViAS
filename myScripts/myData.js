/* global define:true, Papa:true;,$:true*/

define([
], function(
   ) {

    var myData = function(parent) {
        this.parent=parent;
    };
    
        myData.prototype.getData = function(urlData, resolve) {
            var parent=this.parent;
        var completed = 0;
          var firstTime=0;

        Papa.parse(urlData, {
            worker: true,
            download: true,
            preview: parent.maxDownload,
            fastMode: true,
            complete: function(res) {
                if (!completed) {
                    completed = 1;
                    parent.cubeFromData(res.data);
                    resolve(res.data);
                
                }
            }
        });
        };
    
    
    
    myData.prototype.getDataBounds = function(result) {
        var max = -Infinity;
        var min = Infinity;
        var tmp;
        for (var x = 0; x < result.length; x++) {
            tmp = result[x];
            max = Math.max(max, tmp[2].split(".").join(""));
            if (tmp[2].split(".").join("") > 100) {
                min = Math.min(min, tmp[2].split(".").join(""));
            }
        }
        return [max, min];
    };
    
 return myData;
});