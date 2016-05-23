require({
    baseUrl: '/test/'
}, [
    '../myScripts/GlobeHelper'

], function (GlobeHelper) {
    var renderable = {
        _boundaries: [
            {
                latitude: 10,
                longitude: 20
            },
            {
                latitude: 30,
                longitude: 40
            },
            {
                latitude: 50,
                longitude: 60

            },
            {
                latitude: 70,
                longitude: 80
            }
        ]
    };
    TestCase("GetCoordsTest", {

        testLatitude: function () {
            var coord = GlobeHelper.getCoords(renderable);
            assertEquals("object", typeof(coord));
            var actual = [coord[0].lat, coord[1].lat, coord[2].lat, coord[3].lat];
            var expected = [10, 30, 50, 70];
            assertEquals(expected, actual);

        },

        testLongitude: function () {
            var coord = GlobeHelper.getCoords(renderable);
            assertEquals("object", typeof(coord));
            var actual = [coord[0].lng, coord[1].lng, coord[2].lng, coord[3].lng];
            var expected = [20, 40, 60, 80];
            assertEquals(expected, actual);

        }
    });
})
;