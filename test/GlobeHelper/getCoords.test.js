define(['../../scripts/GlobeHelper'], function(GlobeHelper) {

    describe('Coord test', function() {

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
        it('LatitudeTest', function() {
            var coord = GlobeHelper.getCoords(renderable);
            expect(typeof(coord)).toBe("object");
            var actual = [coord[0].lat, coord[1].lat, coord[2].lat, coord[3].lat];
            var expected = [10, 30, 50, 70];
            expect(actual).toEqual(expected);

        });

        it('LongitudeTest', function() {
            var coord = GlobeHelper.getCoords(renderable);
            expect(typeof(coord)).toBe("object");
            var actual = [coord[0].lng, coord[1].lng, coord[2].lng, coord[3].lng];
            var expected = [20, 40, 60, 80];
            expect(actual).toEqual(expected);

        });
    });
})
;