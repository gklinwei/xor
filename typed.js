var typed = (function() {
    'use strict';

    var filter = Array.prototype.filter,
        forEach = Array.prototype.forEach,
        keys = Object.keys;

    var isCreateStyle = false;

    var cssRules = [
        '.typed { opacity: 1; }',
        '.typed--blink { animation: blink 0.7s infinite }',
        '@keyframes blink { from { opacity: 1 } to { opacity: 0 } }'
    ];

    var mutationConfig = {
        childList: true,
        subtree: true
    };

    var defaultOptions = {
    	strings: [],
    	typedSpeed: 30,
    	delay: 3000,
    	cursorColor: '#858585',
    	lodash: false
    };

    var between = function(v, min, max) {
    	return Math.min(max, Math.max(min, Math.floor(v) || min));
    };

    var hasOwnProperty = function(o, v) {
    	return o.hasOwnProperty(v);
    };

    var createStyle = function() {
    	var style = document.createElement('style');
    	document.head.appendChild(style);
    	var sheet = style.sheet;
    	forEach.call(cssRules, function(ruleText) {
            sheet.insertRule(ruleText);
        });
        isCreateStyle = true;
    };

    var handle = function(handleParameter) {
        var { 
            element, 
            text, 
            cursor, 
            strings, 
            typedSpeed, 
            delay
        } = handleParameter;
        var mutation = new MutationObserver(
            (function(strIndex, charIndex) {
                var innerText;
                var innerTextSlice = function(index) {
                    return Array.from(innerText).slice(0, index).join('');
                };
                var backSpace = function(interval) {
                    clearInterval(interval);
                    cursor.classList.add('typed--blink');
                    var timeout = setTimeout(function() {
                        cursor.classList.remove('typed--blink');
                        interval = setInterval(function() {
                            text.textContent = innerTextSlice(--charIndex);
                            if (!text.textContent) {
                                clearInterval(interval);
                                charIndex = 0;
                            }
                        }, Math.floor(1000 / typedSpeed));
                        clearTimeout(timeout);
                    }, delay);
                };
                return function() {
                    if (!text.textContent) {
                        strIndex++;
                    }
                    innerText = strings[strIndex % strings.length].trim();
                    if (!text.textContent) {
                        var interval = setInterval(function() {
                            text.textContent = innerTextSlice(++charIndex);
                            if (text.textContent.length === innerText.length) {
                                backSpace(interval);
                            }
                        }, Math.floor(1000 / typedSpeed));
                    }
                };
            })(-1, 0)
        );
        mutation.observe(element, mutationConfig);
    };

    var typed = function(element, options) {
    	var { 
            strings, 
            typedSpeed, 
            delay, 
            cursorColor, 
            lodash 
        } = options;
    	(!isCreateStyle) && createStyle();
    	element.innerHTML = '<span></span><span></span>';
    	var [text, cursor] = element.children;
        cursor.style.color = cursorColor;
        handle({
            element: element,
            text: text,
            cursor: cursor,
            strings: strings,
            typedSpeed: typedSpeed,
            delay: delay
        });
        cursor.textContent = lodash ? '_' : '|';
        cursor.classList.add('typed');
        return element;
    };

    return function(el, options) {
        try {
            var element = document.querySelector(el);
            if (!element) {
                return null;
            }
        } catch (e) {
            return null;
        }
        if (options == null) {
            options = defaultOptions;
        }
        options = options || {};
        forEach.call(keys(defaultOptions), function(key) {
            if (!hasOwnProperty(options, key)) {
                options[key] = defaultOptions[key];
            }
        });
        if (!Array.isArray(options.strings)) {
            return element;
        }
        options.strings = filter.call(options.strings, function(s) {
            return typeof s === 'string';
        });
        if (!options.strings.length) {
            return element;
        }
        [options.typedSpeed, options.delay] = [
            between(options.typedSpeed, 1, 100), 
            between(options.delay, 1000, 20000)
        ];
        return typed(element, options);
    };
})();