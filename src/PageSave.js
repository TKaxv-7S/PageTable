/*
* @Author TKaxv_7S
*
*/
(function (Win, $) {
    var PageSave = function (options) {
            return this.buildSave(options);
        },
        saveThisData = function (options, pageData) {
            var JList = [], x = false;
            options.$table.$tbody.children(options.lineType).each(function (i, dom) {
                JList.push($(dom).find(options.checkType).is(":checked")?(x = true, pageData[i]):null);
            });
            return x ? JList : null;
        };
    PageSave.DEFAULTS = {
        //表格名称
        table: null,
        $table: null,
        allCBox: null,
        $allCBox: null,
        lineType: "tr",
        checkType: "input:checkbox",
        //当前页
        thisPage: 1,
        //当前页数据
        thisData: null,
        //提交对象
        postData: {},
        //当前页是否存在
        isPage: false
    },
        PageSave.prototype.buildSave = function (options) {
            this.options = options;
            var $tb = options.$table;
            //全选
            options.$allCBox && options.$allCBox.click(function () {
                $tb.$tbody.find(options.lineType + ' ' + options.checkType).prop("checked", this.checked);
            }) || $(options.allCBox).click(function () {
                $tb.$tbody.find(options.lineType + ' ' + options.checkType).prop("checked", this.checked);
            });
            Win["$PS_" + options.tableName] = this;
            return this;
        },
        //保存当前数据(对象)
        PageSave.prototype.setData = function () {
            var options = this.options;
            //判断是否存在
            options.isPage = options.thisPage in options.postData;
            var List = saveThisData(options, this.thisData);
            if (List == null) {
                if (options.isPage) {
                    delete options.postData[options.thisPage];
                }
            } else {
                options.postData[options.thisPage] = List;
            }
            return options.postData;
        },
        //获取所有数据(数组)
        PageSave.prototype.getData = function () {
            var options = this.options;
            this.setData();
            var list = [];
            for (var thePage in options.postData) {
                // list.concat(options.postData[thePage]);
                for (var dom of options.postData[thePage]) {
                    dom != null && list.push(dom);
                }
            }
            return list;
        },
        //更新当前页并返回数据
        PageSave.prototype.updatePageAndGetData = function (pageNumber) {
            //记录当前页
            return this.getPageData(this.options.thisPage = pageNumber);
        },
        //获取某页数据
        PageSave.prototype.getPageData = function (pageNo) {
            var options = this.options;
            //判断是否存在
            options.isPage = pageNo in options.postData;
            return options.isPage && options.postData[pageNo] || [];
        },
        //重置
        PageSave.prototype.reset = function () {
            var options = this.options;
            options.postData = {};
            this.setData();
        },
        //是否取消全选
        PageSave.prototype.cancelAll = function (cx) {
            var options = this.options;
            options.$allCBox && options.$allCBox.prop("checked", !cx) || $(options.allCBox).prop("checked", !cx);
        },
        //全部重置
        PageSave.prototype.refresh = function () {
            var options = this.options;
            options.$allCBox.prop("checked", false);
            options.$table.$tbody.find(options.lineType + ' ' + options.checkType).prop("checked", false);
            this.reset();
        };
    Win.pageSave = function ($table, option, tableName) {
        var len = arguments.length, options;
        if(len==1){
            var opt = arguments[0], $tb, tb = opt.table, $cb, cb = opt.allCBox;
            if("string" == typeof tb){
                $tb = $(tb);
                $tb.$thead = $tb.find('>thead');
                $tb.$tbody = $tb.find('>tbody');
                $tb.$tfoot = $tb.find('>tfoot');
            }else if("object" == typeof tb){
                tb.$thead || (tb.$thead = tb.find('>thead'));
                tb.$tbody || (tb.$tbody = tb.find('>tbody'));
                tb.$tfoot || (tb.$tfoot = tb.find('>tfoot'));
                $tb = tb;
            }
            tb.$table = $tb;
            if("string" == typeof cb) {
                $cb = $(cb);
            }else if("object" == typeof cb){
                $cb = cb;
            }
            opt.$allCBox = $cb;
            options = $.extend({}, PageSave.DEFAULTS, opt);
        }else if(len==3){
            options = $.extend({}, PageSave.DEFAULTS, {$table: arguments[0], $allCBox: arguments[0].find(arguments[1].allCBox), tableName: arguments[2]}, arguments[1]);
        }
        if (Win["$PS_" + options.tableName]) {
            return false;
        } else {
            return new PageSave(options);
        }
    };
}(window, jQuery));