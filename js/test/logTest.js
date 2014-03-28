(function () {
    // !NOTE! only getting a single instance of results (problem clearing stack)
    // TODO qunit has async tests.
    var results = log("foo", {stack: true});
    setTimeout(function () {
        module("log");
        test("log", function () {
            var lineSplit = results.line.split(':');
            deepEqual(results.message, "foo", "message set");
            deepEqual(lineSplit[0], "logTest.js", "line file set");
            ok(!isNaN(parseInt(lineSplit[1], 10)), "line number set");
            ok(!isNaN(parseInt(lineSplit[2], 10)), "column number set");
        });
    }, 0);
}());
