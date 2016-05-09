require({
    baseUrl: '/test/'
}, [
    'myScripts/GlobeHelper'

], function (GlobeHelper) {
    TestCase("GetColorTest", {
        
        testWhite: function () {
            var color = GlobeHelper.getColor(0, [[255, 255, 255], [0, 0, 0], [0, 0, 0]]);
            assertEquals("object", typeof(color));
            assertEquals([255, 255, 255, 255], color);

        },
        testBlack: function () {
            var color = GlobeHelper.getColor(100, [[255, 255, 255], [0, 0, 0], [0, 0, 0]]);
            assertEquals("object", typeof(color));
            assertEquals([0, 0, 0, 255], color);

        }
    });
});