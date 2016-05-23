define(['../../myScripts/Correlation'], function(Correlation) {


    describe('Correlation test', function() {
        it('Correlation equal to 1', function() {
            var input=[[10,20,30,40,50],[20,40,60,80,100]];
            var correlation = Correlation.correlation(input,0,1);

            expect(correlation).toBe(1);
        });

    });
});
