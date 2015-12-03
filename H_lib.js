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
    /**
     * string trim
     *
     */
    if ( !String.prototype.trim ) {
        String.prototype.trim = function () {
            return this.replace(/^\s+|\s+$/g,'');
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
    H.isFunction = function (obj){
        return proUtils.type(obj) === 'function';
    };

    H.isArray = function (obj) {
        return proUtils.type(obj) === 'array';
    };

    H.isString = function (obj){
        return proUtils.type(obj) === 'string' ;
    }

    H.getId = function (id) {
        return document.getElementById(id);
    };

    H.getClass = function(classes){
        return document.getElementsByClassName(classes);
    };

    H.namespace = function(name){
        if ( H.isString( name ) ) {
            return ns( name );
        } else if ( H.isFunction( name )  ) {
           var new_ns =  name.call( this );
           if ( !H.isString( new_ns ) ){
                throw "必须返回一个有效的字符串。"
                return;
           } else {
               return ns( new_ns );
           }
        } else {
            throw "not strings in ";
        }

        function ns(names){
            var parts = names.split('.'),
                  current = H ;
            for ( var i in parts ) {
                if ( !current[ parts[ i ] ] ) {
                    current[ parts[ i ] ] = {};
                };
                current = current[ parts[ i ] ];
            }
            return current;
        }
    };

    H.addClass = function(el,value){
        var classes, elem, cur, clazz, j,finalValue,
            i = 0,
            len = el.length || 1;

        if ( H.isFunction( value ) ) {
            value = value.call(this,el.className);
        }

        var proceed = typeof value === "string" && value;
        if ( proceed ) {
            classes = ( value || "" ).match( rnotwhite ) || [];

            for ( ; i < len ; i++ ) {
                elem = el[i] || el ;
                cur = elem.nodeType === 1 && ( elem.className ?
                        ( " " + elem.className + " " ).replace( rclass," " ) : " ");
                if ( cur ) {
                    j = 0;
                    while ( clazz = classes[j++] ) {
                        //如果添加的class在当前class中不存在则添加
                        if ( cur.indexOf(" " + clazz + " ") < 0 ) {
                            cur += clazz + " ";
                        }
                    }
                    finalValue = cur.trim();
                    if ( elem.className !== finalValue ) {
                        elem.className = finalValue;
                    }
                }
            }
        }
        return this;
    };

    H.removeClass = function(el,value){
        var classes, elem, cur, clazz, j, finalValue,
            i = 0,
            len = el.length || 1;

        if (H.isFunction( value ) ) {
            value = value.call( this, el.className );
        }

        var proceed = typeof value === "undefined" || typeof value === "string" && value;
        if ( proceed ) {
            classes = ( value || "" ).match( rnotwhite ) || [];

            for ( ; i < len ; i++) {
                elem = el[i] || el ;
                cur = elem.nodeType === 1 && ( elem.className ?
                    ( " " + elem.className + " " ).replace( rclass," " ) : ""
                );

                if ( cur ) {
                    j = 0;
                    while ( (clazz = classes[j++]) ) {
                        while ( cur.indexOf( " " + clazz + " ") >= 0 ) {
                            cur = cur.replace( " " + clazz + " ", " " );
                        }
                    }

                    finalValue = value ? cur.trim() : "";
                    if ( elem.className !== finalValue ) {
                        elem.className = finalValue;
                    }
                }
            }
        }
        return this;
    };
    //弹出框
    H.Modal = function (option) {
        //定义dialog对象
        var D = function(option){
            this.init(option);
        };
        //定义dialog的方法
        D.method('init',function(option){
            var _this = this,
                defaults = {
                    width: '260',
                    height: '240',
                    title: '提示信息',
                    titlePostion: 'center',
                    content: '',
                    closeBtn: false,
                    closeCallback: null,
                    ok: true,
                    okCallback: null
                };
            var settings = $.extend(true, defaults, option || {});
            this.render(settings);
        });
        D.method('render',function(settings){
            var _this = this;
            //创建dom
            this.createDom(settings);
            //绑定事件
            $('#dialog-ok').on('click',function(event) {
                settings.okCallback && settings.okCallback();
                _this.destroy();
            });
        });
        D.method('createDom',function(settings){
            var mask = '<div class="dialog-mask" style="position: fixed;width: 100%;height: 100%;top: 0; left: 0;z-index: 1000;background: rgba(0,0,0,0.4);"></div>',
                dialogDom = '<div id="dialog-body" class="dialog-body" style="position: fixed;width: 0;height: 0;top: 50%;left: 50%;overflow: hidden;background: #fff;z-index: 1001;border-radius: 8px;transition: all 0.4s;">'+
                    '<h3 class="dialog-title" style="text-align: '+settings.titlePostion+'; margin: 0;padding: 5px 0;background: #ccc;color:#666;">'+settings.title+'</h3>'+
                    '<div class="dialog-content" style="width: 96%; height: '+(settings.height-75)+'px;;padding: 2%;color: #666;overflow: auto;word-break: break-all;">'+settings.content+'</div>'+
                    '<div class="dialog-btn-group" style="text-align: center; padding: 0;">'+
                    '<button id="dialog-ok" class="dialog-ok" style="display: '+(settings.ok?'inline-block':'none')+';border: 0; border-radius: 3px; padding: 5px 15px; font-size: 14px; color:#666;">确定</button>'+
                    '</div>'+
            '</div>';
            //append到页面
            $('body')
                .append(mask)
                .append(dialogDom);
            setTimeout(function(){
                $('#dialog-body').css({
                    'width': settings.width,
                    'height': settings.height,
                    'marginTop': '-' + settings.height/2 +'px',
                    'marginLeft': '-' + settings.width/2 +'px'
                });
            },100);
        });
        D.method('destroy',function(){
            $('.dialog-mask').remove();
            $('#dialog-body').remove();
        });

        return new D(option);
    };

    H.isMobile = function(mobile) {
        var myreg = /^(((17[0-9]{1})|(13[0-9]{1})|(15[0-9]{1})|(18[0-9]{1}))+\d{8})$/; 
        if(!myreg.test(mobile)) { 
            return false; 
        }
        return true;
    };

    H.isEmail = function(email) {
        var myreg = /^[^\[\]\(\)\\<>:;,@.]+[^\[\]\(\)\\<>:;,@]*@[a-z0-9A-Z]+(([.]?[a-z0-9A-Z]+)*[-]*)*[.]([a-z0-9A-Z]+[-]*)+$/g;
        if (!myreg.test(email)) {
            return false;
        };
        return true;
    }
    
    if ( typeof noGlobal === strundefined ){
        window.H = H;
    }
}));

