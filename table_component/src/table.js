(function () {
    var NO_DATA_TIP = 'no data',
        DEFAULT_LOADING_TEXT = 'loading...';

    function Table(config) {
        var defaultConfig = {
            hasTableHeadInBrowser: false,
            renderContainer: $('#table'),
            noDataTip: NO_DATA_TIP,
            className: '',
            columns: [],
            renderData: [],
            rowSelection: {},
            rowKeys: 'key'
        };
        var settings = $.extend({}, defaultConfig, config || {});
        _basicCheck(settings);

        this.hasTableHeadInBrowser = settings.hasTableHeadInBrowser;
        this.renderContainer = settings.renderContainer;
        this.className = settings.className;
        this.noDataTip = settings.noDataTip;
        this.rowSelection = settings.rowSelection;
        this.rowKeys = settings.rowKeys;

        this._columns = settings.columns;
        this._renderData = settings.renderData;
        this._selectRowKeys = [];
        this.init();
    }

    function _basicCheck(settings) {
        var renderContainerNodeName = settings.renderContainer[0].nodeName;
        var renderContainerIsTable = renderContainerNodeName === 'TABLE';
        
        if (settings.hasTableHeadInBrowser && !renderContainerIsTable) {
            _throwException('| error: render container should be a table, when thead is existed in browser');
        }
    }

    function _domCreator(createObj) {
        var domFormat = createObj.domFormat || 'tr>td',
            columns = createObj.columns,
            renderData = createObj.renderData,
            noDataTip = createObj.noDataTip || NO_DATA_TIP,
            rowKeys = createObj.rowKeys;

        var theadDomArr = ['<thead>', '', '</thead>'],
            tbodyDomArr = ['<tbody>', '', '</tbody>'];

        function _getThs(columns) {
            return columns.map(function (col) {
                    return '<th>' + col.title + '</th>';
                }).join('');
        }

        function _getTrThs(columns) {
            return columns.length ? '<tr>' + _getThs(columns) + '</tr>' : '';
        }

        function _getTrs(columns, renderData, noDataTip, enhancer) {
            var hasColumns = columns.length;
            var trArr = renderData.map(function (row) {
                var tdArr = columns.map(function (col) {
                    var tdData = row[col.dataIndex] || '';
                    if (col.render) {
                        tdData = col.render(tdData, row);
                        !tdData && _throwException(col.dataIndex + '| error: render can not return anything false');
                    }
                    return '<td>' + tdData + '</td>';
                });
                return '<tr>' + tdArr.join('') + '</tr>';
            });
            trArr = (enhancer && enhancer(trArr)) || trArr;
            var trStr = trArr.join('');
            if (!trStr && hasColumns) {
                trStr = '<tr><td colspan="'+ columns.length + '">' + noDataTip + '</td></tr>';
            }
            return trStr;
        }

        /**
         * 各种策略的实现
         * @returns {string}
         */
        function theadTrJustHasTh(columns) {
            theadDomArr[1] = _getTrThs(columns);
            return theadDomArr.join('');
        }
        function tbodyTrJustHasTd(columns, renderData, noDataTip) {
            tbodyDomArr[1] = _getTrs(columns, renderData, noDataTip);
            return tbodyDomArr.join('');
        }
        function theadTrHasCheckboxAndTd(columns) {
            var checkTh = '<th><label><input type="checkbox"></label></th>';
            var ths = _getThs(columns);
            var lastDom = checkTh + ths;
            theadDomArr[1] = '<tr>' + lastDom + '</tr>';
            return theadDomArr.join('');
        }
        function tbodyTrHasCheckboxAndTd(columns, renderData, noDataTip, rowKeys) {
            var checkTd = function(key) {
                    !key && _throwException('the every item in array shoud include a key');
                    return '<td><label><input data-key="'+ key +'"  type="checkbox"></label></td>';
                };
            tbodyDomArr[1] = _getTrs(columns, renderData, noDataTip, function(trs) {
                return trs.map(function(tr, index) {
                    // tr: <tr><td>xxxx</td>...</tr>
                    return '<tr>' + checkTd(renderData[index][rowKeys]) + tr.split('<tr>')[1];
                });
            });
            return tbodyDomArr.join('');
        }
        function specTrTd(columns, renderData, noDataTip) {
            return _getTrs(columns, renderData, noDataTip);
        }
        /** end */

        var domCategory = {
            'thead>tr>(checkbox+td)': theadTrHasCheckboxAndTd,
            'thead>tr>td'           : theadTrJustHasTh,
            'tbody>tr>(checkbox+td)': tbodyTrHasCheckboxAndTd,
            'tbody>tr>td'           : tbodyTrJustHasTd,
            'tr>td'                 : specTrTd
        };

        try {
            return domCategory[domFormat](columns, renderData, noDataTip, rowKeys);
        } catch (e) {
            _throwException(e);
        }
    }

    function _generateTheadDomStr(columns, hasTableHeadInBrowser, rowSelection) {
        if (hasTableHeadInBrowser) return '';
        var hasCheckbox = !$.isEmptyObject(rowSelection);
        var domFormat = hasCheckbox ? 'thead>tr>(checkbox+td)' : 'thead>tr>td';

        return _domCreator({
            domFormat: domFormat,
            columns: columns
        });
    }

    function _generateTbodyDomStr(columns, renderData, noDataTip, rowSelection, rowKeys) {
        var hasCheckbox = !$.isEmptyObject(rowSelection);
        var domFormat = hasCheckbox ? 'tbody>tr>(checkbox+td)' : 'tbody>tr>td';

        return _domCreator({
            domFormat: domFormat,
            columns: columns,
            renderData: renderData,
            noDataTip: noDataTip,
            rowKeys: rowKeys
        });
    }

    function _throwException(errorMessage) {
        throw errorMessage;
    }

    Table.prototype.init = function() {
        this.render();

        var hasSetCheckbox = !$.isEmptyObject(this.rowSelection);
        if (hasSetCheckbox) {
            var initSelectionRowKeys = this.rowSelection.selectRowKeys || [],
                _this = this;

            initSelectionRowKeys.length === this.getRenderData().length 
                ?
                this.getRenderContainer().find('input[type="checkbox"]').prop('checked', true)
                :
                initSelectionRowKeys.forEach(function(key) {
                    _this.getRenderContainer().find('input[data-key='+ key +'][type="checkbox"]').prop('checked', true);
                });
            this.setSelectRowKeys(initSelectionRowKeys);
        }
    };

    Table.prototype.getRenderContainer = function() {
        return this.hasTableHeadInBrowser ? this.renderContainer.parent() : this.renderContainer;
    };

    Table.prototype.getRenderData = function() {
        return this._renderData;
    };

    Table.prototype.getTableDom = function () {
        var tableHeadDomStr = _generateTheadDomStr(this._columns, this.hasTableHeadInBrowser, this.rowSelection);
        var tableBodyDomStr = _generateTbodyDomStr(this._columns, this._renderData, this.noDataTip, this.rowSelection, this.rowKeys);

        if (this.hasTableHeadInBrowser) return $(tableBodyDomStr);

        var className = this.className;
        var hasClassName = !!className;
        var $table = $('<table></table>');

        hasClassName && $table.attr('class', className);
        $table.append(tableHeadDomStr, tableBodyDomStr);
        return $table;
    };

    Table.prototype.getMaskDom = function () {
        return $('<div class="table-mask"><div class="loading">' + DEFAULT_LOADING_TEXT + '</div></div>');
    };

    Table.prototype.refresh = function (updatedData) {
        this.setTableAttribute('_renderData', updatedData.renderData);
        var newTbodyDomStr = _generateTbodyDomStr(this._columns, this._renderData, this.noDataTip);
        this.getRenderContainer().find('tbody').replaceWith(newTbodyDomStr);
        return this;
    };

    Table.prototype.setTableAttribute = function (targetAttr, newValue) {
        this[targetAttr] = newValue;
        return this;
    };

    Table.prototype.showLoading = function (text) {
        var parent = this.getRenderContainer();

        parent
            .find('.table-mask')
            .removeClass('table-mask--fadeOut')
            .addClass('table-mask--fadeIn')
            .fadeIn()
            .children('.loading')
            .html(text || DEFAULT_LOADING_TEXT);
        return this;
    };

    Table.prototype.hideLoading = function () {
        var parent = this.getRenderContainer();

        parent
            .find('.table-mask')
            .removeClass('table-mask--fadeIn')
            .addClass('table-mask--fadeOut')
            .fadeOut();
        return this;
    };

    Table.prototype.render = function () {
        var tableDom = this.getTableDom();
        var loadingMask = this.getMaskDom();

        if (this.hasTableHeadInBrowser) {
            this.renderContainer
                .append(tableDom)
                .parent()
                .append(loadingMask);
        } else {
            this.renderContainer.html('').append(tableDom, loadingMask);
        }

        this.bindEvent();
        return this;
    };

    Table.prototype.bindEvent = function() {
        var hasCheckbox = !$.isEmptyObject(this.rowSelection);
        var _this = this;

        if (hasCheckbox) {
            this.renderContainer
                .on('click', 'tbody input[type="checkbox"]', function() {
                    var key = $(this).data('key');
                    var checkboxAll = $('#table').find('thead input[type="checkbox"]');

                    _this.setSelectRowKeys(key);
                    checkboxAll.prop('checked', false);
                    if (_this.getSelectRowKeys().length === _this.getRenderData().length) {
                        checkboxAll.prop('checked', true);
                    }
                })
                .on('click', 'thead input[type="checkbox"]', function() {
                    var isChecked = $(this).prop('checked');
                    var tbodyCheckbox = $('#table').find('tbody input[type="checkbox"]');

                    if (isChecked) {
                        _this.getRenderData().forEach(function(data) {
                            _this.setSelectRowKeys(data[_this.rowKeys]);
                        });
                        tbodyCheckbox.prop('checked', true);
                    } else {
                        _this.setSelectRowKeys([]);
                        tbodyCheckbox.prop('checked', false);
                    }
                });
        }
    };

    Table.prototype.refreshUnitRow = function (updatedRow) {
        var rowIndex = updatedRow.rowIndex,
            rowData = updatedRow.data;
        var rowDomWillRefresh = _domCreator({
                columns: this._columns,
                renderData: rowData,
                noDataTip: this.noDataTip,
                rowKeys: this.rowKeys
            });

        this.renderContainer.find('tbody > tr').eq(rowIndex).replaceWith(rowDomWillRefresh);
    };

    Table.prototype.setSelectRowKeys = function(key) {
        // key = [];
        if (Array.isArray(key)) {
            this._selectRowKeys = key;
            return;
        }

        var index = this._selectRowKeys.findIndex(function(selectedkey) {return selectedkey === key;});
        var hasSelected = index !== -1;

        hasSelected ? this._selectRowKeys.splice(index, 1) : this._selectRowKeys.push(key);
    };

    Table.prototype.getSelectRowKeys = function() {
        return this._selectRowKeys;
    };

    window.Table = Table;
}());