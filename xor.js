var xor = (function() {
    "use strict";

    var filter = Array.prototype.filter,
        map = Array.prototype.map,
        flatMap = Array.prototype.flatMap,
        includes = Array.prototype.includes,
        each = Array.prototype.forEach,
        slice = Array.prototype.slice,
        toArray = Array.from,
        isArray = Array.isArray;

    var detect = [
        "function", 
        "boolean", 
        "number", 
        "bigint", 
        "string", 
        "symbol"
    ];

    var regex = {
        "'": /\\\'/g,
        '"': /\\\"/g,
    };

    var path = {
        parse: function(str) {
            var i = 0;
            var parts = [];
            var dot, bracket, quote, closing;
            while (i < str.length) {
                dot = str.indexOf('.', i);
                bracket = str.indexOf('[', i);
                if (dot === -1 && bracket === -1) {
                    parts.push(str.slice(i, str.length));
                    i = str.length;
                }
                else if (bracket === -1 || (dot !== -1 && dot < bracket)) {
                    parts.push(str.slice(i, dot));
                    i = dot + 1;
                }
                else {
                    if (bracket > i) {
                        parts.push(str.slice(i, bracket));
                        i = bracket;
                    }
                    quote = str.slice(bracket + 1, bracket + 2);
                    if (quote !== '"' && quote !== "'") {
                        closing = str.indexOf(']', bracket);
                        if (closing === -1) {
                            closing = str.length;
                        }
                        parts.push(str.slice(i + 1, closing));
                        i = (str.slice(closing + 1, closing + 2) === '.') ? closing + 2 : closing + 1;
                    } else {
                        closing = str.indexOf(quote + ']', bracket);
                        if (closing === -1) {
                            closing = str.length;
                        }
                        while (str.slice(closing - 1, closing) === '\\' && bracket < str.length) {
                            bracket++;
                            closing = str.indexOf(quote + ']', bracket);
                        }
                        parts.push(str.slice(i + 2, closing).replace(regex[quote], quote).replace(/\\+/g, function (backslash) {
                            return new Array(Math.ceil(backslash.length / 2) + 1).join('\\');
                        }));
                        i = (str.slice(closing + 2, closing + 3) === '.') ? closing + 3 : closing + 2;
                    }
                }
            }
            return parts;
        },

        getValue: function(o, path) {
            return path.reduce(function(o, next) {
                return o == null ? undefined : o[next];
            }, o);
        }
    };

    var property = function(key) {
        return function(o) {
            return o == null ? undefined : path.getValue(o, path.parse(String(key)));
        };
    };

    var identity = function(v) {
        return v;
    };

    var last = function(o) {
        return o[o.length - 1];
    };

    var drop = function(o, n) {
        if (n == null) {
            n = 0;
        }
        return slice.call(o, 0, o.length - n);
    };

    var uniq = function(array) {
        return toArray(new Set(array));
    };

    var xor = function(arrays, diff) {
        return flatMap.call(arrays, function(array, current) {
            each.call(arrays, function(each, index) {
                if (index === current) {
                    return;
                }
                array = diff(array, each);
            });
            return array;
        });
    };

    return function(arrays, iteratee) {
        iteratee = last(arguments);
        if (includes.call(detect, typeof iteratee)) {   
            arrays = drop(arguments, 1);
            if (typeof iteratee !== "function") {
                iteratee = property(iteratee);
            }
        } else {
            arrays = drop(arguments);
            iteratee = identity;
        }
        arrays = filter.call(arrays, function(array) {
            return isArray(array);
        });
        if (!arrays.length) {
            return [];
        }
        return uniq(xor(arrays, function(array, values) {
            return filter.call(array, function(v) {
                return !includes.call(map.call(values, iteratee), iteratee(v));
            });
        }));
    };
})();