require({
    baseUrl: '/test/'
}, [
    'myScripts/GlobeHelper'

], function (GlobeHelper) {
    TestCase("GetRGBTest", {

        testWhiteColor: function () {
            var color = GlobeHelper.getRGB("FFFFFF");

            assertEquals("object", typeof(color));
            assertEquals([255, 255, 255], color);

        },
        testBlackColor: function () {
            var color = GlobeHelper.getRGB("00000");

            assertEquals("object", typeof(color));
            assertEquals([0, 0, 0], color);

        }
    });
});