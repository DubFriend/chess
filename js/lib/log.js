(function () {
"use strict";

    //turn all message functionality on or off.
var isOn = true,
    //default details to display
    defaults = {
        message: true,
        line: true,
        stack: false
    },
    //map prop names to display label
    propMap = {
        message: "",
        line: " - ",
        stack: "Stack Trace : "
    },
    //extract filename and line number one level up the call stack
    //(where log is being called, instead of this file).
    extractLine = function (stack) {
        var line;
        if(typeof stack === "string") {
            line = stack.split('\n')[2].split('/');
            //get final branch of the filePath
            line = line[line.length - 1];
            //remove trailing ')'
            if(line.charAt(line.length - 1) === ")") {
                line = line.substr(0, line.length - 1);
            }
            return line;
        }
    },
    //maps message data to a printable string format.
    toString = function (msgObj) {
        var prop, label, message = "\n";
        for(prop in msgObj) {
            if(msgObj.hasOwnProperty(prop)) {
                label = propMap[prop] === undefined ? prop + ": " : propMap[prop];
                message += label + msgObj[prop] + "\n";
            }
        }
        return message;
    },
    //removes data that is not to be displayed.
    filterMsgObj = function (msgObj, opt) {
        var prop,
            allowed,
            filtered = {};

        for(prop in msgObj) {
            if(msgObj.hasOwnProperty(prop)) {
                allowed = opt[prop] === undefined ? defaults[prop] : opt[prop];
                if(allowed) {
                    filtered[prop] = msgObj[prop];
                }
            }
        }

        return filtered;
    },
    //the exported function. prints message and metadata to the screen
    //returns all data
    log = function (message, opt) {
        opt = opt || {};
        var msgObj = {};
        if(isOn || opt.force) {
            msgObj.message = message;
            msgObj.stack = new Error().stack;
            setTimeout(function () {
                msgObj.line = extractLine(msgObj.stack);
                console.log(toString(filterMsgObj(msgObj, opt)));
            }, 0);
            return msgObj;
        }
    };

//attache to the global object, or to exports (for nodejs)
if (typeof exports !== 'undefined') {
    if (typeof module !== 'undefined' && module.exports) {
        exports = module.exports = log;
    }
    exports.log = log;
}
else {
    if(this.log === undefined) {
        this.log = log;
    }
    else {
        throw "debug is allready defined";
    }
}

}).call(this);
