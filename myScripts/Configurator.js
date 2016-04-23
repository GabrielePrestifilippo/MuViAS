/* global define:true, Papa:true;,$:true*/

define([], function() {

    var configurator = function(parent) {
        this.parent = parent;
    };

    configurator.prototype.getConfig = function(urlData, resolve) {
        var parent = this.parent;
        var self = this;
        var completed = 0;

        Papa.parse(urlData, {
            worker: false,
            download: true,
            preview: 1,
            fastMode: true,
            complete: function(res) {
                resolve(res.data[0]);
            }

        });
    };



    return configurator;
});