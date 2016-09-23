;(function() {
	Function.prototype.method = function(name, fn) {
		this.prototype[name] = fn;
		return this;
	};

	var doc = document, id = 'getElementById';

	/**
	 * type function
	 * @param  {$ or string} el [description]
	 * 
	 */
	function type(el) {
		if (toString.call(el) === '[object Object]') {
			// 2 -> $
			// 3 -> HTMLDom object
			return el.length ? 2 : 3;
		}
	}

	/**
	 * rotate funciton
	 * @param  {$ or string} el     [selector]
	 * @param  {num} angle  [angle]
	 * @param  {[type]} whence [description]
	 * 
	 */
	function rotate(canvas, el, rot) {
		var img =  null,
			elType = type(el);

		switch (elType) {
			case 2:
				// $ obj
				img = el.get(0);
				break;
			case 3:
				// dom obj
				img = el;
				break;
			default:
				img = doc[id](el);
		}
		
		//获取图片的高宽
		var w = img.getAttribute('data-width');
		var h = img.getAttribute('data-height');
		//角度转为弧度
		if(!rot){
			rot = 0;	
		}
		var rotation = Math.PI * rot / 180;
		var c = Math.round(Math.cos(rotation) * 1000) / 1000;
		var s = Math.round(Math.sin(rotation) * 1000) / 1000;
		//旋转后canvas标签的大小
		canvas.height = Math.abs(c * h) + Math.abs(s * w);
		canvas.width = Math.abs(c * w) + Math.abs(s * h);
		//绘图开始
		var context = canvas.getContext("2d");
		context.save();
		//改变中心点
		if (rotation <= Math.PI/2) {
			context.translate(s * h, 0);
		} else if (rotation <= Math.PI) {
			context.translate(canvas.width, -c * h);
		} else if (rotation <= 1.5 * Math.PI) {
			context.translate(-c * w, canvas.height);
		} else {
			context.translate(0, -s * w);
		}
		//旋转90°
		context.rotate(rotation);
		//绘制
		context.drawImage(img, 0, 0, w, h);
		context.restore();
		img.style.display = "none";	
	}

	/**
	 * imgview obj
	 * 
	 */

	var Imgview = function(options) {
		var defaults = {
			src: '',
			style: {
				width: 650,
				height: 350
			},
			mask: true
		};
		if (Object.prototype.toString.call(options) === '[object String]') {
			options = {
				src: options
			};
		}
		var settings = Object.assign({}, defaults, options || {});
		this.angle = 0;
		this.init(settings);
	};

	Imgview.method('init', function(settings) {
		if (!settings.src) {
			console.error('error: the image url is not imported.');
			return;
		}
		this.angle = 0;
		// append viewer dom
		document.body.appendChild(this.createDom(settings.style, settings.src));
		var _this = this,
			mask = doc[id]('mask'),
			rr = doc[id]('btn-rotateRight'),
			rl = doc[id]('btn-rotateLeft'),
			close = doc[id]('btn-close');
		$('#mask').show();
		$('#imgview').on('click', '#btn-rotateLeft', function(){
			_this.rotateLeft($('#v_img'));
		})
		.on('click', '#btn-rotateRight', function() {
			_this.rotateRight($('#v_img'));
		})
		.on('click', '#btn-close, #mask', function() {
			_this.destroy();
		});
	});

	Imgview.method('rotateLeft', function(el) {
		this.angle -= 90;
		if (this.angle === -90) {
			this.angle = 270;
		}
		rotate(doc[id]('canvas'), el, this.angle);
	});

	Imgview.method('rotateRight', function(el) {
		this.angle += 90;
		rotate(doc[id]('canvas'), el, this.angle);
		if (this.angle === 270) {
			this.angle = -90;
		}
	});

	Imgview.method('createDom', function(style, url) {
		var imgwrapper = document.createElement('div');
		imgwrapper.id = 'imgview';
		imgwrapper.class = 'imgview';
		imgwrapper.style = 'position: fixed; width: 100%; height: 100%; top: 0; z-index: 2;';
		imgwrapper.innerHTML = '<div class="mask" id="mask" style="background: rgba(0,0,0,0.5); height: 100%; width: 100%;"></div>'+
		'<div class="imgwrapper" id="imgwrapper" style="position: absolute; transform: translate(-50%, -50%); top: 50%; left: 50%; overflow: hidden; z-index: 3;">'+
			'<i class="btn-close iconfont icon-close" id="btn-close" style="position: absolute; top: 0; right: 0; font-size: 30px; color: #fff; cursor: pointer;"></i>'+
			'<canvas width="0" height="0" id="canvas"></canvas>'+
			'<img id="v_img" src="' + url + '" alt="img" data-width="' + style.width + '" data-height="' + style.height + '" style="width: ' + style.width + 'px; height: ' + style.height + 'px;"/>'+
			'<div class="btn-rotate-w" style="padding-top: 10px; text-align: center;">'+
				'<button type="button" id="btn-rotateLeft" style="width: 55px; margin: 0 2px; padding: 5px; border: 0; background: rgba(255,255,255,0.6); cursor: pointer;" title="向左转"><i class="iconfont icon-rotateLeft"></i></button>'+
				'<button type="button" id="btn-rotateRight" style="width: 55px; margin: 0 2px; padding: 5px; border: 0; background: rgba(255,255,255,0.6); cursor: pointer;" title="向右转"><i class="iconfont icon-rotateRight"></i></button>'+
			'</div>'+
		'</div>';
		return imgwrapper;
	});

	Imgview.method('destroy', function() {
		var imgview = doc[id]('imgview');
		$(imgview).off();
		imgview && document.body.removeChild(imgview);
	});

	window.imgview = function(options) {
		return new Imgview(options);
	};
})();