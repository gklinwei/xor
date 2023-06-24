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
        if (typeof iteratee !== "function") {
            arrays = drop(arguments);
            iteratee = identity;
        } else {
            arrays = drop(arguments, 1);
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