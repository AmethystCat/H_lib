var expect = chai.expect;
describe('table component unit test', function () {
    afterEach(function() {
       $('#table').html('');
    });
    it('should_generate_a_table_when_input_table_columns_and_data', function () {
        // given
        var config = {
                columns: [
                    {title: '姓名', dataIndex: 'name'},
                    {title: '年龄', dataIndex: 'age'}
                ],
                renderData: [
                    {name: 'HC', age: 18}
                ]
            };
        var table = new Table(config);
        var expectDomStr = '<table>' +
                        '<thead>' +
                            '<tr><th>'+config.columns[0].title+'</th>' +
                            '<th>'+config.columns[1].title+'</th></tr></thead>' +
                        '<tbody>' +
                            '<tr><td>'+config.renderData[0].name+'</td>' +
                            '<td>'+config.renderData[0].age+'</td></tr>' +
                        '</tbody>' +
                    '</table>';
        // when
        var $tableDom = table.getTableDom();
        var actualDomStr = $tableDom[0].outerHTML;

        // then
        expect(actualDomStr).to.equal(expectDomStr);
    });

    it('should_have_class_when_give_class_name', function () {
        // given
        var config = {
                className: 'table table-bordered table-dish'
            };
        var table = new Table(config);
        // when
        var $tableDom = table.getTableDom();
        var hasClass = $tableDom.hasClass(config.className);
        // then
        expect(hasClass).to.be.true;
    });

    it('should_render_operate_td_with_a_button_when_give_render_function_which_return_a_button_with_name_and_age_info_text_in_renderData_item', function () {
        // given
        var config = {
                columns: [
                    {title: '姓名', dataIndex: 'name'},
                    {title: '年龄', dataIndex: 'age'},
                    {title: '操作', render: function (col, row) {
                        return '<button>'+ row.name +'</button>';
                    }}
                ],
                renderData: [
                    {
                        name: 'HC',
                        age: 18
                    }
                ]
            };
        var table = new Table(config);
        // when
        var $tableDom = table.getTableDom();
        var thOperateTitle = $tableDom.find('th').eq(2).text();
        var $button = $tableDom.find('button');
        var expectButtonText = config.renderData[0].name;
        // then
        expect(thOperateTitle).to.equal(config.columns[2].title, 'th text should be 操作');
        expect($button.text()).to.equal(expectButtonText, 'button text should be HC');
    });

    it('should_throw_error_when_render_function_return_not_truly', function () {
        // given
        var config = {
                columns: [
                    {
                        title: '姓名',
                        dataIndex: 'name',
                        render: function() {
                            return '';
                        }
                    }
                ],
                renderData: [
                    {name: 'hc'}
                ]
            };
        // when
        var expectError = config.columns[0].dataIndex + '| error: render can not return anything false';
        // then
        expect(function() {new Table(config)}).to.throw(expectError);
    });

    it('should_throw_error_that_render_container_should_be_a_table_when_table_head_is_exist_in_browser', function () {
        // given
        var tableContainer = $('<div></div>');
        var config = {
                hasTableHeadInBrowser: true,
                renderContainer: tableContainer
            };
        // when
        var expectError = '| error: render container should be a table, when thead is existed in browser';
        var newTableInstance = function() {new Table(config);};
        // then
        expect(newTableInstance).to.throw(expectError);
    });

    it('should_just_render_table_body_when_table_head_is_existed_in_browser', function () {
        // given
        var tableContainer = $('<table><thead></thead></table>');
        var config = {
                renderContainer: tableContainer,
                hasTableHeadInBrowser: true
            };
        var table = new Table(config);
        // when
        var actualDom = table.renderContainer.find('thead').next()[0].outerHTML;
        var expectDom = '<tbody></tbody>';
        // then
        expect(actualDom).to.equal(expectDom);
    });

    it('should_show_one_tip_tr_in_tbody_when_renderData_is_empty', function () {
        //given
        var config = {
            renderContainer: $('<table></table>'),
            hasTableHeadInBrowser: true,
            noDataTip: 'no data now',
            columns: [
                {title: 'name', dataIndex: 'name'},
                {title: 'age', dataIndex: 'age'}
            ]
        };
        var table = new Table(config);
        // when
        var actualDom = table.getTableDom()[0].outerHTML;
        var expectDom = '<tbody><tr><td colspan="2">no data now</td></tr></tbody>';
        // then
        expect(actualDom).to.equal(expectDom);
    });

    it('should_show_one_tip_tr_in_tbody_when_refresh_and_get_renderData_is_empty', function () {
        //given
        var config = {
            renderContainer: $('#table'),
            noDataTip: 'no data now',
            columns: [
                {title: 'name', dataIndex: 'name'},
                {title: 'age', dataIndex: 'age'}
            ],
            renderData: [{name: 'jc', age: 18}]
        };
        var table = new Table(config);
        table.refresh({renderData: []});
        // when
        var actualDom = table.getRenderContainer().find('tbody')[0].outerHTML;
        var expectDom = '<tbody><tr><td colspan="2">no data now</td></tr></tbody>';
        // then
        expect(actualDom).to.equal(expectDom);
    });

    it('should_refresh_table_when_give_new_render_data', function () {
        // given
        var config = {
            renderContainer: $('#table'),
            columns: [
                {title: 'name', dataIndex: 'name'}
            ]
        };
        var updateData = {renderData: [{name: 'hc'}]};
        // when
        var table = new Table(config);
        var updatedTable = table.refresh(updateData);
        var expectDom = '<table>' +
            '<thead><tr><th>name</th></tr></thead>' +
            '<tbody><tr><td>hc</td></tr></tbody>' +
            '</table>';
        var actualDom = updatedTable.renderContainer.find('table')[0].outerHTML;
        // then
        expect(actualDom).to.equal(expectDom);
    });


    it('should_render_a_table_dom_and_a_table_mask_when_involve_table_render', function () {
        // given
        var config = {
            renderContainer: $('#table')
        };
        var table = new Table(config);
        // when
        var actualDom = table.renderContainer.html();
        var expectDom = '<table><thead></thead><tbody></tbody></table>' +
            '<div class="table-mask"><div class="loading">loading...</div></div>';
        // then
        expect(actualDom).to.equal(expectDom);
    });

    it('should_display_load_mask_when_set_table_load_show', function () {
        // given
        var config = {};
        var table = new Table(config);
        // when
        table.showLoading();
        var loadMask = table.renderContainer.find('.table-mask');
        // then
        expect(loadMask.hasClass('table-mask--fadeIn')).to.be.ok;
    });

    it('should_hide_load_mask_when_set_table_load_hide', function () {
        // given
        var config = {};
        var table = new Table(config);
        // when
        table.hideLoading();
        var loadMask = table.renderContainer.find('.table-mask');
        // then
        expect(loadMask.hasClass('table-mask--fadeOut')).to.be.ok;
    });

    it('should_display_load_mask_when_set_table_load_show_and_has_table_head', function () {
        // given
        $('#table').append('<table></table>');
        var config = {
            renderContainer: $('#table').children('table'),
            hasTableHeadInBrowser: true
        };
        var table = new Table(config);
        // when
        table.showLoading();
        var loadMask = table.renderContainer.parent().find('.table-mask');
        // then
        expect(loadMask.hasClass('table-mask--fadeIn')).to.be.ok;
    });

    it('should_hide_load_mask_when_set_table_load_hide_and_has_table_head', function () {
        // given
        $('#table').append('<table></table>');
        var config = {
            renderContainer: $('#table').children('table'),
            hasTableHeadInBrowser: true
        };
        var table = new Table(config);
        // when
        table.hideLoading();
        var loadMask = table.renderContainer.parent().find('.table-mask');
        // then
        expect(loadMask.hasClass('table-mask--fadeOut')).to.be.ok;
    });

    it('should_refresh_a_given_row_when_the_row_data_updated', function () {
        // given
        var config = {
            renderContainer: $('#table'),
            columns: [{title: 'name', dataIndex: 'name'}],
            renderData: [{name: 'hc'}, {name: 'hc2'}]
        };
        var table = new Table(config);
        var tbody = table.renderContainer.find('tbody');
        var updatedRow = {
                rowIndex: 1,
                data: [{name: 'bird'}]
            };
        // when
        var targetTrDom = tbody.children('tr').get(updatedRow.rowIndex).outerHTML;
        var expectTargetTrDom = '<tr><td>hc2</td></tr>';

        table.refreshUnitRow(updatedRow);
        var actualUpdatedTrDom = tbody.html();
        var expectUpdatedTrDom = '<tr><td>hc</td></tr><tr><td>bird</td></tr>';
        // then
        expect(targetTrDom).to.equal(expectTargetTrDom);
        expect(actualUpdatedTrDom).to.equal(expectUpdatedTrDom);
    });

    it('show_row_checkbox_in_first_td_when_given_rowSelection_option', function() {
        // given
        var config = {
            renderContainer: $('#table'),
            columns: [{title: 'name', dataIndex: 'name'}],
            renderData: [{name: 'hc', age: 18}, {name: 'lucy', age: 18}],
            rowSelection: {
                onChange: function (selectRowKeys, selectRows) {
                    console.log(selectRowKeys, selectRows);
                }
            }
        };
        // when
        var table = new Table(config);
        var actualDom = table.getTableDom()[0].outerHTML;
        var expectDom = '<table>' +
                '<tbody>'+
                    '<tr><th><input type="checkbox"></th>' + '<th>name</th></tr>' +
                '</tbody>'+
                '<tbody>' +
                    '<tr><td><input type="checkbox"></td><td>hc</td></tr>' +
                    '<tr><td><input type="checkbox"></td><td>lucy</td></tr>' +
                '</tbody>'+
            '</table>';
        // then
        expect(actualDom).to.equal(expectDom);
    });
});