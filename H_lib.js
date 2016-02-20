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
    };

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
                    autoClose: true,
                    closeBtn: false,
                    closeCallback: null,
                    cancel: false,
                    cancelCallback: null,
                    cancelText: "关闭",
                    ok: true,
                    okText: "确定",
                    okCallback: null,
                    maskClose: false
                };
            if (H.isString(option)) {
                option = {content:option};
            }
            var settings = $.extend(true, defaults, option || {});
            this.render(settings);
        });
        D.method('render',function(settings){
            var _this = this;
            //创建dom
            this.createDom(settings);
            //绑定事件
            $('#dialog-ok').on('click',function(event) {
                settings.okCallback && settings.okCallback(_this.destroy,$('#dialog-content'));
                if (!settings.autoClose) return;
                _this.destroy();
            });

            $('#dialog-close').on('click',function(event) {
                settings.closeCallback && settings.closeCallback(_this.destroy,$('#dialog-content'));
                _this.destroy();
            });

            $('#dialog-cancel').on('click',function(event) {
                settings.cancelCallback && settings.cancelCallback(_this.destroy,$('#dialog-content'));
                if (!settings.autoClose) return;
                _this.destroy();
            });

            $('body').on('click','#dialog-mask',function(){
                if (settings.maskClose) {
                    if (!settings.autoClose) return;
                    _this.destroy();
                }
            });
        });
        D.method('createDom',function(settings){
            var mask = '<div class="dialog-mask" id="dialog-mask" style="position: fixed;width: 100%;height: 100%;top: 0; left: 0;z-index: 1000;background: rgba(0,0,0,0.4);"></div>',
                dialogDom = '<div id="dialog-body" class="dialog-body animated zoomIn" style="position: fixed;width: '+settings.width+'px;height: '+settings.height+'px;top: 50%;left: 50%;margin-top:'+(-settings.height/2)+'px;margin-left:'+(-settings.width/2)+'px;overflow: hidden;background: #fff;z-index: 1001;border-radius: 4px;">'+
                    '<h4 class="dialog-title" style="position: relative;text-align: '+settings.titlePostion+'; margin: 0;padding: 5px 0;background: #d2d2d2;color:#666;">'+settings.title+'<i id="dialog-close" class="dialog-close" style="display: '+ (settings.closeBtn ? 'inline-block' : 'none') +';position: absolute;top: 3px;right: 3px;width: 20px;height: 20px;line-height: 16px;text-align: center;border-radius: 50%;font-style: normal;cursor: pointer">x</i></h4>'+
                    '<div class="dialog-content" id="dialog-content" style="width: 96%; height: '+(settings.height-70)+'px;;padding: 2%;color: #666;overflow: auto;word-break: break-all;">'+settings.content+'</div>'+
                    '<div class="dialog-btn-group" style="text-align: center; padding: 0;">'+
                    '<button id="dialog-ok" class="dialog-ok btn btn-warning" style="display: '+(settings.ok?'inline-block':'none')+';border: 0; border-radius: 3px; margin: 0 5px; padding: 5px 15px; font-size: 14px; color:#fff;">'+settings.okText+'</button>'+
                    '<button id="dialog-cancel" class="dialog-cancel btn btn-warning" style="display: '+(settings.cancel?'inline-block':'none')+';border: 0; border-radius: 3px; margin: 0 5px; padding: 5px 15px; font-size: 14px; color:#fff;">'+settings.cancelText+'</button>'+
                    '</div>'+
            '</div>';
            //append到页面
            $('body')
                .append(mask)
                .append(dialogDom);
            // setTimeout(function(){
            //     $('#dialog-body').css({
            //         'width': settings.width,
            //         'height': settings.height,
            //         'marginTop': '-' + settings.height/2 +'px',
            //         'marginLeft': '-' + settings.width/2 +'px'
            //     });
            // },100);
        });
        D.method('destroy',function(){
	    // 用class来销毁弹窗，因为页面进入时可能会同时进行多个请求，从而可能会出现多个弹窗，此时页面上有多个‘#dialog-body’，用id删除会出错。
            $('.dialog-mask').remove();
            $('.dialog-body').remove();
        });

        return new D(option);
    };

    H.isMobile = function(mobile) {
        var myreg = /^(((17[0-9]{1})|(13[0-9]{1})|(15[0-9]{1})|(18[0-9]{1}))+\d{8})$/, 
            zuoji = /^0\d{2,3}-?\d{7,8}$/;
        return myreg.test(mobile) || zuoji.test(mobile);
    };

    H.isEmail = function(email) {
        var myreg = /^[^\[\]\(\)\\<>:;,@.]+[^\[\]\(\)\\<>:;,@]*@[a-z0-9A-Z]+(([.]?[a-z0-9A-Z]+)*[-]*)*[.]([a-z0-9A-Z]+[-]*)+$/g;
        return myreg.test(email);
    };

    H.priceSwitch = function(price) {
        var money = price >= 0 ? price/100 : -1;
        return money;
    };

    if ( typeof noGlobal === strundefined ){
        window.H = H;
    }
}));

