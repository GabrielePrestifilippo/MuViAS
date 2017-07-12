define([

    './Layer'

], function (Layer) {

    /**
     * Create an array, which is a group of layers.
     * @constructor
     */
    var LayerGroup = function () {
        this.layers=[]
    };

    /**
     * Add a new layer to the group
     * @param pos: position to add the layer
     * @param name: name of the layer
     */
    LayerGroup.prototype.addLayer = function (pos,name) {
        this.layers[pos] = new Layer(name);
    };

    /**
     * Push a new layer to the group
     * @param name: name of the new layer
     */
    LayerGroup.prototype.pushLayer = function (name) {
        this.layers.push(new Layer(name));
    };

    /**
     * Set a parameter for all the layers in the group
     * @param options: options to set containing a property and a key
     */
    LayerGroup.prototype.setAll=function(options){
        this.layers.forEach(function(layer) {
            $.each(options, function (prop, key) {
                layer[prop]=key;
            });
        });
    };

    /**
     * Set a property to all the renderables of a layer
     * @param options: options to set containing a property and a key
     */
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

    /**
     * Set the value from the key in @setAllRend
     * @param obj: object to check
     * @param access: check is the object is accessible
     * @param value: set the value
     */
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