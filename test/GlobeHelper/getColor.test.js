define(['../../scripts/GlobeHelper'], function (GlobeHelper) {

    describe('Color test', function () {
        it('Color white', function () {
            var color = GlobeHelper.getColor(0, [[255, 255, 255], [0, 0, 0], [0, 0, 0]]);
            expect(typeof(color)).toBe("object");
            expect(color).toEqual([255, 255, 255, 255]);

        });
        it('Color black', function () {
            var color = GlobeHelper.getColor(100, [[255, 255, 255], [0, 0, 0], [0, 0, 0]]);
            expect(typeof(color)).toBe("object");
            expect(color).toEqual([0, 0, 0, 255]);

        });
    });
});