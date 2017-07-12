define(['../../scripts/GlobeHelper'], function (GlobeHelper) {

    describe('GetRGB test', function () {
        it('Color white', function () {
            var color = GlobeHelper.getRGB("FFFFFF");

            expect(typeof(color)).toBe("object");
            expect(color).toEqual([255, 255, 255]);

        });
        it('Color black', function () {

            var color = GlobeHelper.getRGB("00000");
            expect(typeof(color)).toBe("object");
            expect(color).toEqual([0, 0, 0]);

        });
    });
});