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
            renderData: []
        };
        var settings = $.extend({}, defaultConfig, config || {});
        _basicCheck(settings);

        this.hasTableHeadInBrowser = settings.hasTableHeadInBrowser;
        this.renderContainer = settings.renderContainer;
        this.className = settings.className;
        this.noDataTip = settings.noDataTip;
        this._columns = settings.columns;
        this._renderData = settings.renderData;
        this.render();
    }

    function _basicCheck(settings) {
        var renderContainerNodeName = settings.renderContainer[0].nodeName;
        var renderContainerIsTable = renderContainerNodeName === 'TABLE';
        if (settings.hasTableHeadInBrowser && !renderContainerIsTable) {
            _throwException('| error: render container should be a table, when thead is existed in browser');
        }
    }

    function _generateTheadDomStr(columns, hasTableHeadInBrowser) {
        if (hasTableHeadInBrowser) return '';
        var theadDomArr = [];
        var thStr = columns.map(function (col) {
            return '<th>' + col.title + '</th>';
        }).join('');
        var trStr = thStr ? '<tr>' + thStr + '</tr>' : '';
        theadDomArr.push('<thead>', trStr , '</thead>');
        return theadDomArr.join('');
    }

    function _generateTbodyDomStr(columns, renderData, noDataTip) {
        var tbodyDomArr = [];
        var trStr = _getTrStr(columns, renderData, noDataTip);
        tbodyDomArr.push('<tbody>', trStr, '</tbody>');
        return tbodyDomArr.join('');
    }

    function _getTrStr(columns, renderData, noDataTip) {
        var hasColumns = columns.length;
        var trStr = renderData.map(function (row) {
            var tdArr = columns.map(function (col) {
                var tdData = row[col.dataIndex] || '';
                if (col.render) {
                    tdData = col.render(tdData, row);
                    !tdData && _throwException(col.dataIndex + '| error: render can not return anything false');
                }
                return '<td>' + tdData + '</td>';
            });
            return '<tr>' + tdArr.join('') + '</tr>';
        }).join('');
        if (!trStr && hasColumns) {
            trStr = '<tr><td colspan="'+ columns.length + '">' + noDataTip + '</td></tr>';
        }
        return trStr;
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
        var tableHeadDomStr = _generateTheadDomStr(this._columns, this.hasTableHeadInBrowser);
        var tableBodyDomStr = _generateTbodyDomStr(this._columns, this._renderData, this.noDataTip);
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
        var rowDomWillRefresh = _getTrStr(this._columns, rowData, this.noDataTip);
        this.renderContainer.find('tbody > tr').eq(rowIndex).replaceWith(rowDomWillRefresh);
    };

    window.Table = Table;
}());