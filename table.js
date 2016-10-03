;(function(){
	Function.prototype.method = function(name, fn) {
		this.prototype[name] = fn;
		return this;
	};

	var doc = document, id = 'getElementById', celem = 'createElement';

	var Table = function(id, options) {
		var defaults = {
			columns: [],
			dataSource: [],
			loading: false,
			pagination: {}
		};

		this.id = id;
		this.domstr = [];
		this.settings = Object.assign({}, defaults, options || {});

		this.init(this.settings);
	};

	Table.method('init', function(settings) {
		var domstr_thead = this.thead(settings.columns),
			domstr_tbody = this.tbody(settings.columns, settings.dataSource),
			domstr_table = domstr_thead + '<div class="tbody" id="tbody">' + domstr_tbody + '</div>';
		this.render(this.id, domstr_table);
	});

	Table.method('thead', function(columns) {
		// [{title: '序列号', key: 'id', dataIndex: 'id', render: function(){}}]
		var arr = columns;
		var domarr = arr.map(function(el, index) {
			return '<div class="cell">' + el.title + '</div>';
		});

		// add thead container
		domarr.unshift('<div class="thead" id="thead"><div class="row header green">');
		domarr.push('</div></div>');

		return domarr.join('');
	});

	Table.method('tbody', function(columns, dataSource) {
		var colArr = columns,
			data = dataSource;

		var domarr = data.map(function(el) {
			var str = columns.map(function(v) {
				// columnData：单元格数据；el：当前行数据
				var columnData = v.dataIndex ? el[v.dataIndex] : '';
				if (v.render && typeof v.render === 'function') {
					var r = v.render(columnData, el);
					if (!r) {
						console.error('error: render function is undefined or it must return something.');
						throw 'error: render function is undefined or it must return something.';
					}
					return '<div class="cell">' + r + '</div>';
				}
				return '<div class="cell">' + columnData + '</div>';
			});
			// 返回表格行dom字符串
			return '<div class="row">' + str.join('') + '</div>';
		});
		return domarr.join('');
	});

	Table.method('refresh', function(data){
		var newSettings = this.reset(data);
		this.init(newSettings);
	});

	Table.method('render', function(con_id, domstr) {
		var con = doc[id](con_id),
			inner = con.innerHTML;
		if (toString.call(domstr) !== '[object String]') {
			con.appendChild(domstr);
			return;
		}
		con && (con.innerHTML = domstr);
	});

	Table.method('reset', function(op){
		var newSettings = this.settings = Object.assign({}, this.settings, op || {});
		return newSettings;
	});

	// todo: loading
	Table.method('loading', function() {

	});

	// todo: pagenation
	Table.method('pagenation', function() {
		
	});

	window.Table = function(id, options) {
		return new Table(id, options);
	};
})();
