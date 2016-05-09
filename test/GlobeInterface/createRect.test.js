require({
    baseUrl: '/test/'
}, [
    'myScripts/GlobeInterface'

], function (GlobeInterface) {
    TestCase("createRectTest", {

        returnRect: function () {
            gInterface = new GlobeInterface("globe");
            var gridLayer = {
                renderables: [
                    {
                        id: 1, _boundaries: [
                        {
                            latitude: 0, longitude: 0
                        },
                        {
                            latitude: 100, longitude: 0
                        },
                        {
                            latitude: 0, longitude: 100
                        },
                        {
                            latitude: 100, longitude: 100
                        }
                    ]
                    }]
            };
            var resultRect = gInterface.createRect(3, gridLayer);

            assertEquals("object", typeof(resultRect));


        }
    });
});