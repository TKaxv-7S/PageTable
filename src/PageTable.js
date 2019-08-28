/*
* @Author TKaxv_7S
*
*/
(function (Win, $) {
    var PageTable = function (options) {
            return this.buildTable(options);
        },
        f = function (str) {
            var args = arguments,
                bool = !0,
                index = 1;
            return str = str.replace(/%s/g, function () {
                var val = args[index++];
                return "undefined" == typeof val ? (bool = !1, "") : val
            }), bool ? str : ""
        };
    PageTable.DEFAULTS = {
        tableName: "",
        pageSave: null,
        undefinedText: "-",
        sortName: void 0,
        sortOrder: "asc",
        columns: [[]],
        data: [],
        url: void 0,
        method: "get",
        cache: !0,
        contentType: "application/json",
        dataType: "json",
        ajax: void 0,
        ajaxOptions: {},
        queryFunc: function (x) {
            return x
        },
        onLoadSuccess: function (result,postData) {
            return result
        },
        afterLoadSuccess: function (result,postData) {
        },
        onLoadError: function (jqXHR) {
        },
        totalField: 'total',
        totalNotFilteredField: 'totalNotFiltered',
        dataField: 'rows',
        sidePagination: 'client', // client or server
        totalRows: 0,
        totalNotFiltered: 0,
        pageNumber: 1,
        pageData: null,
        pageSize: 10,
        pageList: [10, 25, 50, 100],
        pageText: "第%s页",
        pagePreText: "&lsaquo;",
        pageNextText: "&rsaquo;",
        pageFirst: "&lsaquo;&lsaquo;",
        pageLast: "&rsaquo;&rsaquo;"
    },
        PageTable.prototype.buildTable = function (options) {
            var strArray = [], $table = $(options.tableName);
            strArray.push('<thead></thead>');
            strArray.push('<tbody></tbody>');
            strArray.push('<tfoot></tfoot>');
            $table.html(strArray.join(""));
            $table.$thead = $table.find('>thead');
            $table.$tbody = $table.find('>tbody');
            $table.$tfoot = $table.find('>tfoot');
            this.$pTable = $table;
            this.options = options;
            this.initHead();
            options.pageSave && (this.pageSave = Win.pageSave($table, options.pageSave, options.tableName));
            this.initPageBorder();
            if (options.sidePagination === 'server') {
                this.initServer(options.pageNumber);
            } else {
                options.totalRows = options.data.length;
                options.totalNotFiltered = 0;
                this.initClient(options.pageNumber);
            }
            Win["$PT_" + options.tableName] = this;
            return this;
        },
        PageTable.prototype.initHead = function () {
            var columns = this.options.columns, strArray = [], $thead = this.$pTable.$thead;
            strArray.push('<tr>');
            for (var i = 0, len = columns.length; i < len; i++) {
                var column = columns[i], title = column.title, hf = column.headFormat;
                if ("undefined" == typeof hf) {
                    strArray.push(f('<th>%s</th>', title));
                } else if ("function" == typeof hf) {
                    strArray.push(f('<th>%s</th>', hf(title)));
                } else if ("string" == typeof hf) {
                    strArray.push(f('<th>%s</th>', hf));
                } else {
                    strArray.push(f('<th>%s</th>', title));
                }
            }
            strArray.push('</tr>');
            $thead[0].innerHTML = strArray.join("");
        },
        PageTable.prototype.load = function (data) {
            // if (this.options.sidePagination === 'server') {
            this.options.totalRows = data[this.options.totalField];
            this.options.totalNotFiltered = data[this.options.totalNotFilteredField];
            // }
            data = Array.isArray(data) ? data : data[this.options.dataField];
            this.updatePageBorder();
            this.initBody(data);
        },
        PageTable.prototype.updatePageBorder = function () {
            var $td = this.$pTable.$tfoot.find('tr>td'), thisPage = this.options.pageNumber,
                totalRows = this.options.totalRows,
                allPage = Math.ceil(totalRows / this.options.pageSize),
                first = thisPage === 1 ? "disable" : "enable",
                last = thisPage === allPage ? "disable" : "enable";
            $td.find("#pageFirst").attr("name", 1).attr("class", first),
                $td.find("#pagePreText").attr("name", thisPage - 1).attr("class", first),
                $td.find("#pageNextText").attr("name", thisPage + 1).attr("class", last),
                $td.find("#pageLast").attr("name", allPage).attr("class", last),
                $td.find("#pageText").html(f(this.options.pageText, thisPage));
        },
        PageTable.prototype.initBody = function (data) {
            var options = this.options, $pTable = this.$pTable, columns = options.columns, $tbody = $pTable.$tbody
                , html = [];
            options.pageData = data;
            //全选回显
            var cx = false, now = options.pageSave ? this.pageSave.updatePageAndGetData(options.pageNumber) : {};
            $.each(data, function (index, rowData) {
                var x, rowStrArray = [];
                //多选回显
                (x = now[index] != null) || (cx = !x);
                for (var i = 0, len = columns.length; i < len; i++) {
                    var column = columns[i], field = rowData[column.field], bf = column.bodyFormat;
                    if ("undefined" == typeof bf) {
                        rowStrArray.push(f('<th>%s</th>', field));
                    } else if ("function" == typeof bf) {
                        rowStrArray.push(f('<th>%s</th>', bf(field, x)));
                    } else if ("string" == typeof bf) {
                        rowStrArray.push(f('<th>%s</th>', bf));
                    } else {
                        rowStrArray.push(f('<th>%s</th>', field));
                    }
                }
                html.push(f('<tr class="%s">%s</tr>', x ? "selected" : "", rowStrArray.join("")));
            });
            $tbody[0].innerHTML = html.join('');
            //是否取消全选
            options.pageSave && (this.pageSave.thisData = options.pageData, this.pageSave.cancelAll(cx));
        },
        PageTable.prototype.initPageBorder = function () {
            var options = this.options, that = this,
                $td = this.$pTable.$tfoot.html(f('<tr><td colspan="%s"><span id="tleft"></span>&nbsp;&nbsp;<span id="tcenter"></span>&nbsp;&nbsp;<span id="tright"></span></td></tr>', options.columns.length)).find('tr>td');
            $td.find("#tcenter").html(f('<span id="pageText">' + options.pageText + '</span>', '-'));
            $td.find("#tleft").html(f('<a id="pageFirst" name="%s" class="disable" href="javascript:void(0);">%s</a>&nbsp;<a id="pagePreText" name="%s" class="disable" href="javascript:void(0);">%s</a>', 1, options.pageFirst, 1, options.pagePreText));
            $td.find("#tright").html(f('<a id="pageNextText" name="%s" class="disable" href="javascript:void(0);">%s</a>&nbsp;<a id="pageLast" name="%s" class="disable" href="javascript:void(0);">%s</a>', 1, options.pageNextText, 1, options.pageLast));

            // $td.find("#pageText");

            $td.find("#pageFirst").off("click").on("click", function () {
                if ($(this).hasClass("enable")) {
                    that.changePage(this.name)
                }
            });
            $td.find("#pagePreText").off("click").on("click", function () {
                if ($(this).hasClass("enable")) {
                    that.changePage(options.pageNumber - 1)
                }
            });
            $td.find("#pageNextText").off("click").on("click", function () {
                if ($(this).hasClass("enable")) {
                    that.changePage(options.pageNumber + 1)
                }
            });
            $td.find("#pageLast").off("click").on("click", function () {
                if ($(this).hasClass("enable")) {
                    that.changePage(this.name)
                }
            });
        },
        PageTable.prototype.changePage = function (pageNo) {
            if (this.options.sidePagination === "server") {
                this.initServer(pageNo);
            } else {
                this.initClient(pageNo);
            }
        },
        PageTable.prototype.initClient = function (pageNo) {
            var options = this.options, pageSize = options.pageSize, thisPageData;
            pageNo = typeof pageNo === "number" ? options.pageNumber = pageNo : options.pageNumber = Number(pageNo);
            thisPageData = options.data.slice(pageSize * (pageNo - 1), pageSize * pageNo);
            options.pageSave && this.pageSave.setData();
            this.updatePageBorder();
            this.initBody(thisPageData);
            options.onLoadSuccess(thisPageData,this.pageSave.options.postData);
            options.afterLoadSuccess(thisPageData,this.pageSave.options.postData);
        },
        PageTable.prototype.initServer = function (pageNo) {
            var options = this.options, that = this,
                params = {
                    pageNumber: pageNo ? (typeof pageNo === "number" ? options.pageNumber = pageNo : options.pageNumber = Number(pageNo)) : options.pageNumber,
                    pageSize: options.pageSize,
                    sortName: options.sortName,
                    sortOrder: options.sortOrder
                },
                data = options.queryFunc(params);
            options.pageSave && this.pageSave.setData();
            $.ajax({
                type: options.method,
                url: options.url,
                data: options.contentType === 'application/json' && options.method === 'post' ?
                    JSON.stringify(data) : data,
                cache: options.cache,
                contentType: options.contentType,
                dataType: options.dataType,
                success: function (result) {
                    let data = $.extend({}, result);
                    options.onLoadSuccess(result,that.pageSave.options.postData);
                    that.load(data);
                    options.afterLoadSuccess(result,that.pageSave.options.postData);
                },
                error: function (jqXHR) {
                    options.onLoadError(jqXHR);
                }
            });
        };
    Win.pageTable = function (option) {
        var options = $.extend({}, PageTable.DEFAULTS, "object" == typeof option && option);
        if (Win["$PT_" + options.tableName]) {
            return false;
        } else {
            return new PageTable(options);
        }
    };
}(window, jQuery));