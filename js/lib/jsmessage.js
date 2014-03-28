// _____________________________________________________________________________
//
// ---------------------------   jsMessage   -----------------------------------
//
// jsMessage provides mixins for publish/subscribe, and event binding patterns.
//
// Author : Brian Detering | BDeterin@gmail.com | BrianDetering.net
// GitHub : github.com/DubFriend/jsmessage

(function () {
"use strict";

// ----------------- Underscore Subset, renamed to "lib" -----------------------
//     Underscore.js 1.5.1
//     http://underscorejs.org
//     (c) 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
//     Underscore may be freely distributed under the MIT license.

// Establish the object that gets returned to break out of a loop iteration.
var breaker = {};

// Save bytes in the minified (but not gzipped) version:
var ArrayProto = Array.prototype, ObjProto = Object.prototype, FuncProto = Function.prototype;

// Create quick reference variables for speed access to core prototypes.
var push             = ArrayProto.push,
    slice            = ArrayProto.slice,
    concat           = ArrayProto.concat,
    toString         = ObjProto.toString,
    hasOwnProperty   = ObjProto.hasOwnProperty;

// All **ECMAScript 5** native function implementations that we hope to use
// are declared here.
var nativeForEach      = ArrayProto.forEach,
    nativeFilter       = ArrayProto.filter;

var lib = {};

// The cornerstone, an `each` implementation, aka `forEach`.
// Handles objects with the built-in `forEach`, arrays, and raw objects.
// Delegates to **ECMAScript 5**'s native `forEach` if available.
lib.each = function (obj, iterator, context) {
    if (obj == null) {
        return;
    }
    if (nativeForEach && obj.forEach === nativeForEach) {
        obj.forEach(iterator, context);
    }
    else if (obj.length === +obj.length) {
        for (var i = 0, l = obj.length; i < l; i++) {
            if (iterator.call(context, obj[i], i, obj) === breaker) {
                return;
            }
        }
    }
    else {
        for (var key in obj) {
            if (lib.has(obj, key)) {
                if (iterator.call(context, obj[key], key, obj) === breaker) {
                    return;
                }
            }
        }
    }
};

// Return all the elements that pass a truth test.
// Delegates to **ECMAScript 5**'s native `filter` if available.
lib.filter = function (obj, iterator, context) {
    var results = [];
    if (obj == null) {
        return results;
    }
    if (nativeFilter && obj.filter === nativeFilter) {
        return obj.filter(iterator, context);
    }
    lib.each(obj, function(value, index, list) {
        if (iterator.call(context, value, index, list)) {
            results.push(value);
        }
    });
    return results;
};

lib.isFunction = function(obj) {
    return typeof obj === 'function';
};

// Shortcut function for checking if an object has a given property directly
// on itself (in other words, not on a prototype).
lib.has = function(obj, key) {
    return hasOwnProperty.call(obj, key);
};


//--------------------------- end underscore -----------------------------------



var messaging = {};
//attache to the global object, or to exports (for nodejs)
if (typeof exports !== 'undefined') {
    if (typeof module !== 'undefined' && module.exports) {
        exports = module.exports = messaging;
    }
    exports.jsMessage = messaging;
}
else {
    if(this.jsMessage === undefined) {
        this.jsMessage = messaging;
    }
    else {
        throw "jsMessage is allready defined";
    }
}


messaging.mixinPubSub = function (object) {
    object = object || {};
    var subscribers = {},
        universalSubscribers = [];

    object.subscribe = function (topic, callback) {
        if(topic) {
            subscribers[topic] = subscribers[topic] || [];
            subscribers[topic].push(callback);
        }
        else {
            universalSubscribers.push(callback);
        }
    };

    object.unsubscribe = function (subscriber, topic) {
        var filter = function (topic) {
            return lib.filter(subscribers[topic], function (callback) {
                return callback !== subscriber;
            });
        };

        if(topic) {
            if(subscribers[topic]) {
                subscribers[topic] = filter(topic);
            }
            else {
                throw "topic not found";
            }
        }
        else {
            lib.each(subscribers, function (values, topic) {
                subscribers[topic] = filter(topic);
            });
            universalSubscribers = lib.filter(universalSubscribers, function (callback) {
                return callback !== subscriber;
            });
        }
    };

    object.publish = function (topic, data) {
        if(topic) {
            lib.each(subscribers[topic], function (callback) {
                callback(data);
            });
        }
        else {
            lib.each(subscribers, function (values, topic) {
                lib.each(values, function (callback) {
                    if(callback) {
                        callback(data);
                    }
                });
            });
        }
        lib.each(universalSubscribers, function (callback) {
            callback(data);
        });
    };

    object.autoPublish = function (topic, publishMap) {
        var data, that = this;
        //if setData provided, then sets data and publishes it.
        //otherwise just gets the data.
        return function (setData) {
            var publishData;
            if(setData === undefined) {
                return data;
            }
            else {
                data = setData;
                publishData = publishMap ? publishMap(setData) : setData;
                that.publish(topic, publishData);
            }
        };
    };

    return object;
};


messaging.mixinEvents = function (object, argumentGenerators) {
    var bindings = {},
        argGen = argumentGenerators || {};

    //wrap each function of the object with its trigger.
    lib.each(object, function (property, name) {
        if(lib.isFunction(property)) {
            object[name] = function () {
                var callbackArg,
                    returnValue = property.apply(object, arguments);

                if(bindings[name]) {
                    if(argGen[name]) {
                        callbackArg = argGen[name].apply(object, [returnValue]);
                    }
                    lib.each(bindings[name], function (callback) {
                        callback(callbackArg);
                    });
                }

                return returnValue;
            };
        }
    });

    object.on = function (event, callback) {
        bindings[event] = bindings[event] || [];
        bindings[event].push(callback);
    };

    object.off = function (event, callback) {
        if(callback) {
            bindings[event] = lib.filter(bindings[event], function (subscriber) {
                return subscriber !== callback;
            });
        }
        else {
            bindings[event] = undefined;
        }
    };

    return object;
};

}).call(this);
