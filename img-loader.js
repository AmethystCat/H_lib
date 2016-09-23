/**
 * img loader
 * @author HC [2016-09-01]
 * @return {img loader obj} 图片预加载对象
 */

;( function(global, factory) {
	if (typeof module === 'object' && typeof module.exports === 'object') {
		module.exports = global.document ?
		factory(global) :
		function(w) {
			if (!w.document) {
				throw new Error('imgLodaer requires a window with a document');
			}
			return factory(w);
		}
	} else {
		factory(global)
	}
})(typeof window !== 'undefined' ? window : this, function(window) {
	function isArray(obj) {
		return toString.call(obj) === '[object Array]';
	}

	function isFunction(obj) {
		return toString.call(obj) === '[object Function]';
	}

	var Loader = function(imgList, cb, timeout) {
		timeout = timeout || 5000; // 图片加载超时时间默认为5秒
		imgList = isArray(imgList) && imgList || [];
		cb = isFunction(cb) && cb;
		var total = imgList.length,
			loaded = 0,
			images = [],
			_on = function() {
				loaded < total && (++loaded, cb && cb(loaded / total));
			};
		if (!total) {
			return cb && cb(1);
		}

		for(var i = 0; i < total; i++) {
			images[i] = new Image();
			// onerror = _on; 如果某张图片加载失败，则跳过，在进度上依然显示加载完成，以保证最后进度为100%；
			images[i].onload = images[i].onerror = _on;
			images[i].src = imgList[i];
		}

		// 若在total * timeout 时间范围（loaded < total）内仍然有图片未加载出来，则通知外围图片已全部加载，防止用户等待时间过长。
		setTimeout(function() {
			loaded < total && (loaded = total, cb && cb(loaded / total));
		}, total * timeout);
	};

	return window.imgLoader = Loader;
});