require({
    baseUrl: '/test/'
}, [
    'myScripts/Correlation'

], function (Correlation) {
    TestCase("toTimeTest", {

        testTime: function () {
            var time = Correlation.toTime("1425164400");
            assertEquals("2/28/2015 11:00:00 PM", time);

        }
    });
});