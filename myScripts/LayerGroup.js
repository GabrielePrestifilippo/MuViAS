define([

    'myScripts/Layer'

], function (Layer) {


    var LayerGroup = function () {
        this.layers=[]
    };


    LayerGroup.prototype.addLayer = function (pos,name) {
        this.layers[pos] = new Layer(name);
    };

    LayerGroup.prototype.pushLayer = function (name) {
        this.layers.push(new Layer(name));
    };

    LayerGroup.prototype.setAll=function(options){
        this.layers.forEach(function(layer) {
            $.each(options, function (prop, key) {
                layer[prop]=key;
            });
        });
    };

    LayerGroup.prototype.setAllRend=function(options){
        var self=this;
        this.layers.forEach(function(layer) {
            layer.renderables.forEach(function(renderable) {
                $.each(options, function (prop, key) {
                   self.setValue(renderable,prop,key);
                });
            });
        });
    };

    LayerGroup.prototype.setValue=function(obj,access,value){
        if (typeof(access)=='string'){
            access = access.split('.');
        }
        if (access.length > 1){
            this.setValue(obj[access.shift()],access,value);
        }else{
            obj[access[0]] = value;
        }
    };
    return LayerGroup;
});