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
            rowSelection: {}
        };
        var settings = $.extend({}, defaultConfig, config || {});
        _basicCheck(settings);

        this.hasTableHeadInBrowser = settings.hasTableHeadInBrowser;
        this.renderContainer = settings.renderContainer;
        this.className = settings.className;
        this.noDataTip = settings.noDataTip;
        this._columns = settings.columns;
        this._renderData = settings.renderData;
        this.rowSelection = settings.rowSelection;
        this.render();
    }

    function _basicCheck(settings) {
        var renderContainerNodeName = settings.renderContainer[0].nodeName;
        var renderContainerIsTable = renderContainerNodeName === 'TABLE';
        if (settings.hasTableHeadInBrowser && !renderContainerIsTable) {
            _throwException('| error: render container should be a table, when thead is existed in browser');
        }
    }

    function _domCreator(createObj) {
        var domFormat = createObj.domFormat,
            columns = createObj.columns,
            renderData = createObj.renderData,
            noDataTip = createObj.noDataTip || NO_DATA_TIP;

        var theadDomArr = ['<thead>', '', '</thead>'],
            tbodyDomArr = ['<tbody>', '', '</tbody>'];

        function _getThs(columns) {
            return (
                columns.map(function (col) {
                    return '<th>' + col.title + '</th>';
                }).join('')
            );
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

        function theadTrHasCheckboxAndTd(columns) {
            var checkTh = '<th><input type="checkbox"></th>';
            var ths = _getThs(columns);
            var lastDom = checkTh + ths;
            theadDomArr[1] = '<tr>' + lastDom + '</tr>';
            return theadDomArr.join('');
        }
        function theadTrJustHasTd(columns) {
            theadDomArr[1] = '<tr>' + _getThs(columns) + '</tr>';
            return theadDomArr.join('');
        }
        function tbodyTrHasCheckboxAndTd(columns, renderData, noDataTip) {
            var checkTd = '<td><input type="checkbox"></td>';
            tbodyDomArr[1] = _getTrs(columns, renderData, noDataTip, function(trs) {
                return trs.map(function(tr) {
                    return checkTd + tr;
                });
            });
            return tbodyDomArr.join('');
        }
        function tbodyTrJustHasTd(columns, renderData, noDataTip) {
            tbodyDomArr[1] = _getTrs(columns, renderData, noDataTip);
            return tbodyDomArr.join('');
        }

        function specTrTd(columns, renderData, noDataTip) {
            return _getTrs(columns, renderData, noDataTip);
        }
        var domCategory = {
            'thead>tr>(checkbox+td)': theadTrHasCheckboxAndTd,
            'thead>tr>td': theadTrJustHasTd,
            'tbody>tr>(checkbox+td)': tbodyTrHasCheckboxAndTd,
            'tbody>tr>td': tbodyTrJustHasTd,
            'tr>td': specTrTd
        };

        try {
            return domCategory[domFormat](columns, renderData, noDataTip);
        } catch (e) {
            _throwException(e.message);
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

    function _generateTbodyDomStr(columns, renderData, noDataTip, rowSelection) {
        var hasCheckbox = !$.isEmptyObject(rowSelection);
        var domFormat = hasCheckbox ? 'tbody>tr>(checkbox+td)' : 'tbody>tr>td';
        return _domCreator({
            domFormat: domFormat,
            columns: columns,
            renderData: renderData,
            noDataTip: noDataTip
        });
    }

    function _throwException(errorMessage) {
        throw errorMessage;
    }

    Table.prototype.getRenderContainer = function() {
        return this.hasTableHeadInBrowser ? this.renderContainer.parent() : this.renderContainer;
    };

    Table.prototype.getRenderData = function() {
        return this._renderData;
    };

    Table.prototype.getTableDom = function () {
        var tableHeadDomStr = _generateTheadDomStr(this._columns, this.hasTableHeadInBrowser, this.rowSelection);
        var tableBodyDomStr = _generateTbodyDomStr(this._columns, this._renderData, this.noDataTip, this.rowSelection);
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
        return this;
    };

    Table.prototype.refreshUnitRow = function (updatedRow) {
        var rowIndex = updatedRow.rowIndex,
            rowData = updatedRow.data;
        var rowDomWillRefresh = _domCreator({
                domFormat: 'tr>td',
                columns: this._columns,
                renderData: rowData,
                noDataTip: this.noDataTip
            });
        this.renderContainer.find('tbody > tr').eq(rowIndex).replaceWith(rowDomWillRefresh);
    };

    window.Table = Table;
}());