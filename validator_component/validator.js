// 策略对象
var strategies = {
    isNonEmpty: function(value, errorMsg) {
        if (!value) return errorMsg;
    },
    minLength: function(value, length, errorMsg) {
        if (value.length > length) return errorMsg;
    },
    taxRateFormat: function(value, errorMsg) {
        var reg=/^([0-9]{1,2}\.[0-9]{1,2})$/i;
        if (!reg.test(value)) return errorMsg;
    },
    phone: function(value, errorMsg) {
        var reg=/^([0-9]{3,4}-[0-9]{7,8})$/i;
        var regMobile=/^1[3|4|5|7|8][0-9]\d{4,8}$/i;
        if (!reg.test(value) && !regMobile.test(value)) return errorMsg;
    }
};

// validator类
var Validator = function() {
    // 缓存校验规则
    this.cache = [];
};

Validator.prototype.add = function(dom, value, rules) {
    var _this = this;

    for ( var i = 0, rule; rule = rules[i++]; ) {
        (function() {
            var strategyAry = rule.strategy.split(':');
            var errorMsg = rule.errorMsg;
            
            _this.cache.push(function() {
                var strategy = strategyAry.shift();
                strategyAry.unshift(value);
                strategyAry.push(errorMsg);

                return strategies[strategy].apply(dom, strategyAry);
            });
        })(rule);
    }
};

Validator.prototype.start = function() {
    for( var i = 0, validatorFunc; validatorFunc = this.cache[i++]; ) {
        var errorMsg = validatorFunc();
        if (errorMsg) return errorMsg;
    }
};
