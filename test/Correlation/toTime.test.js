require({
    baseUrl: '/test/'
}, [
    'myScripts/Correlation'

], function (Correlation) {
    TestCase("toTimeTest", {

        testTime: function () {
            var time = Correlation.toTime("1425164400");
            assertEquals("3/1/2015 12:00:00 AM", time);

        }
    });
});