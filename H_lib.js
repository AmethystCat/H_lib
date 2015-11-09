/**
 * Created by Hc on 2015/11/6.
 */


;(function (global,factory) {
    if ( typeof module === 'object' && typeof module.exports === 'object' ){
        module.exports = global.document ?
            factory( global ,true ) :
            function( w ) {
                if ( !w.document ) {
                    throw new Error( 'I required a window with a document' );
                }
                return factory( w );
            };
    } else {
        factory( global );
    }
}(typeof window !== 'undefined' ? window : this , function(window,noGlobal){
    //my lib's here
    /**
     * functon method added
     */
    Function.prototype.method = function(name,fn){
        this.prototype[name] = fn;
        return this;
    };
    /**
     * array foreach
     */
    if ( !Array.prototype.forEach ) {
        Array.prototype.forEach = function forEach( callback, thisArg ) {
            var T,K;
            if ( this == null ) {
                throw new TypeError( "this is null or not defined" );
            }

            var O = Object(this);
            var len = O.length >>> 0;

            if ( typeof callback !== "function" ) {
                throw new TypeError( callback + "is not a function" );
            }
            if ( arguments.length > 1 ) {

                T = thisArg;
            }
            K = 0;
            while ( K < len ) {
                var kValue;
                if (K in O) {
                    kValue = O[K];
                    callback.call( T,kValue,K,O );
                }
                K++;
            }
        }
    }

    var H = {},
        strundefined = typeof undefined,
        varType = {},
        toString = varType.toString,
        rnotwhite = /\S+/g,
        rclass = /[\t\r\n\f]/g;

    var proUtils = {
        eachVarType: function(v){
            var arr = "Boolean Number String Function Array Date RegExp Object Error".split(" ");
            arr.forEach(function(name){
                v['[object ' + name + ']'] = name.toLowerCase();
            });
            return v;
        },
        type: function(obj){
            if (obj == null) {
                return obj+'';
            }
            return typeof obj === 'object' || typeof obj === 'function' ?
                varType[ toString.call(obj) ] || 'object' : typeof obj;
        }
    };
    proUtils.eachVarType(varType);

    /**
     * 对象方法
     */
    H.isFunction = function(obj){
        return proUtils.type(obj) === 'function';
    };
    H.isArray = function (obj) {
        return proUtils.type(obj) == 'array';
    };

    H.addClass = function(el,value){
        var classes, elem, cur, clazz, j,finalValue,
            i = 0,
            len = el.length,
            proceed = typeof value === "string" && value;
        if ( H.isFunction( value ) ) {

        }
        if (proceed) {
            classes = ( value || "" ).match( rnotwhite ) || [];

            for ( ; i < len ; i++ ) {
                elem = el[0];
                cur = elem.nodeType === 1&& ( elem.className ?
                        ( " " + elem.className + " " ).replace( rclass," " ) : " ");
            }
        }

    };
    H.removeClass = function(el,value){

    };
    //弹出框
    H.Modal = function () {

    };













    if ( typeof noGlobal === strundefined ){
        window.H = H;
    }
}));

