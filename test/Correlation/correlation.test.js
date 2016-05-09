require({
    baseUrl: '/test/'
}, [
    'myScripts/Correlation'

], function (Correlation) {
    TestCase("correlationTest", {

        testCorrelation: function () {
            var input=[[10,20,30,40,50],[20,40,60,80,100]];
            var correlation = Correlation.correlation(input,0,1);
            assertEquals(1, correlation);

        }
    });
});