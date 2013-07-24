(function () {
    var publisher,
        callbackData,
        callbackData2,
        callbackData3,
        callback = function (data) { callbackData = data; },
        callback2 = function (data) { callbackData2 = data; },
        callback3 = function (data) { callbackData3 = data; };

    module("mixinPubSub", {
        setup: function () {
            publisher = jsMessage.mixinPubSub({five: 5});
            callbackData = undefined;
            callbackData2 = undefined;
            callbackData3 = undefined;
            publisher.subscribe(callback, "topic1");
            publisher.subscribe(callback2, "topic2");
            publisher.subscribe(callback3, "topic2");
        }
    });

    test("methods are added to object", function () {
        deepEqual(publisher.five, 5, "retains existing properties");
        ok(typeof(publisher.subscribe) === "function", "has subscribe method");
        ok(typeof(publisher.unsubscribe) === "function", "has unsubscribe method");
        ok(typeof(publisher.publish) === "function", "has publish method");
    });

    test("publish/subscribe", function () {
        publisher.publish("foo", "topic2");
        deepEqual(callbackData, undefined, "doesnt call wrong topic callback");
        deepEqual(callbackData2, "foo", "callbackData2 recieved");
        deepEqual(callbackData3, "foo", "callbackData3 recieved");
        publisher.publish("bar", "topic1");
        deepEqual(callbackData, "bar", "callbackData1 recieved");
        deepEqual(callbackData2, "foo", "callbackData2 unchanged");
        deepEqual(callbackData3, "foo", "callbackData3 unchanged");
    });

    test("unsubscribe", function () {
        publisher.unsubscribe(callback2, "topic2");
        publisher.publish("bar", "topic2");
        deepEqual(callbackData2, undefined, "callbackData2 not updated");
        deepEqual(callbackData3, "bar", "callbackData3 is updated");
    });

    test("unsubscribe from all topics", function () {
        publisher.subscribe(callback2, "topic1");
        publisher.unsubscribe(callback2);
        publisher.publish("foo", "topic1");
        deepEqual(callbackData2, undefined, "callbackData2 not updated");
        publisher.publish("bar", "topic2");
        deepEqual(callbackData2, undefined, "callbackData2 not updated");
        deepEqual(callbackData3, "bar", "callbackData3 is updated");
    });

    test("publish/subscribe/unsubscribe no topic set", function () {
        var callback4Data,
            callback4 = function (data) {
                callback4Data = data;
            };

        publisher.subscribe(callback4);
        publisher.publish("foo");
        deepEqual(callback4Data, "foo", "callback set if no topic set");
        publisher.publish("bar", "topic1");
        deepEqual(callback4Data, "bar", "callback set even if topic is set");

        publisher.unsubscribe(callback4);
        publisher.publish("baz");
        deepEqual(callback4Data, "bar", "callback is unsubscribed");
    });

}());


(function () {
    var evented,
        event1Data1,
        event1Data2,
        event2Data,
        isCallback1Called,
        isCallback2Called,
        isCallback3Called,
        callback1Arguments,
        callback1 = function (args) {
            callback1Arguments = args;
            isCallback1Called = true;
        },
        callback2 = function () { isCallback2Called = true; },
        callback3 = function () { isCallback3Called = true; };

    module("mixinEvents", {
        setup: function () {
            event1Data1 = undefined;
            event1Data2 = undefined;
            event2Data = undefined;
            isCallback1Called = false;
            isCallback2Called = false;
            isCallback3Called = false;
            callback1Arguments = undefined;

            evented = jsMessage.mixinEvents(
                {
                    five: 5,
                    event1: function (data1, data2) {
                        event1Data1 = data1;
                        event1Data2 = data2;
                        return data1;
                    },
                    event2: function (data) {
                        event2Data = data;
                    }
                },
                {
                    event1: function (returnVal) {
                        return {
                            five: this.five,
                            returnVal: returnVal
                        };
                    }
                }
            );

            evented.on("event1", callback1);
            evented.on("event1", callback2);
            evented.on("event2", callback3);
        }
    });

    test("methods are added to object", function () {
        deepEqual(evented.five, 5, "retains existing properties");
        ok(typeof(evented.event1) === "function", "retains existing methods");
        ok(typeof(evented.event2) === "function", "retains existing methods");
        ok(typeof(evented.on) === "function", "has on method");
    });

    test("on", function () {
        evented.event1("foo", "bar");
        deepEqual(event1Data1, "foo", "event1 is called with arguments");
        deepEqual(event1Data2, "bar", "event1 is called with arguments");
        ok(isCallback1Called, "callback1 is called when event1 is called");
        ok(isCallback2Called, "callback2 is called when event1 is called");
        deepEqual(event2Data, undefined, "callback3 not called");
        deepEqual(
            callback1Arguments,
            {five: 5, returnVal: "foo"},
            "callback receives generated arguments"
        );

        evented.event2("baz");
        deepEqual(event2Data, "baz", "regular event2 is called");
        ok(isCallback3Called, "callback3 is called when event2 is called");
    });

    test("off", function () {
        evented.off("event1", callback1);
        evented.event1();
        ok(!isCallback1Called, "callback1 not called");
        ok(isCallback2Called, "callback2 is called");
    });

    test("off, remove all events", function () {
        evented.off("event1");
        evented.event1();
        ok(!isCallback1Called, "callback1 not called");
        ok(!isCallback2Called, "callback2 not called");
    });

}());
