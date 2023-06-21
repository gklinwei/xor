var xor = (function() {
    "use strict";

    var filter = Array.prototype.filter,
        map = Array.prototype.map,
        flat = Array.prototype.flat,
        includes = Array.prototype.includes,
        each = Array.prototype.forEach,
        toArray = Array.from,
        isArray = Array.isArray;

    var uniq = function(array) {
        return toArray(new Set(array));
    };

    var xor = function(arrays, diff) {
        return flat.call(map.call(arrays, function(array, current) {
            each.call(arrays, function(each, index) {
                if (index === current) {
                    return;
                }
                array = diff(array, each);
            });
            return array;
        }));
    };

    return function(arrays) {
        arrays = filter.call(arguments, function(array) {
            return isArray(array);
        });
        if (!arrays.length) {
            return [];
        }
        return uniq(xor(arrays, function(array, values) {
            return filter.call(array, function(v) {
                return !includes.call(values, v);
            });
        }));
    };
})();