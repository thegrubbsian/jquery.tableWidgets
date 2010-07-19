/* jquery.tablePageable v1.1 */

/*
options = {
sizeSelect: Element,
pageSize: Number,
onPageChange: Callback,
onPageSizeChange: Callback
sortableSelector: String (css selector)
filterableSelector: String (css selector)
};
*/

(function (jQuery) {
    jQuery.fn.tablePageable = function (options) {

        var tbl = this;
        var defaults = {
            pageSize: 10,
            sortableSelector: "table.sortable",
            filterableSelector: "table.filterable"
        };
        var opts = jQuery.extend(defaults, options);

        tbl.each(function () {

            var el = this;

            // If paging is already enabled, the continue to next table
            if (el.pageable) { return; }
            el.pageable = true;

            el.pageSize = opts.pageSize;
            el.pageIndex = 0;

            el.getRows = function () { return jQuery(this).find("tbody tr"); };

            el.getPageCount = function () {
                var rowCount = el.getRows().length;
                return (rowCount % this.pageSize) ? Math.floor(rowCount / this.pageSize) + 1 :
                    (rowCount / this.pageSize);
            };

            el.changePage = function (toIndex) {
                var pageCount = this.getPageCount();
                if (toIndex >= 0 && toIndex <= (pageCount - 1)) {
                    this.pageIndex = toIndex;
                    this.updatePaging();
                    this.updateIndicator();
                    if (opts.onPageChange) {
                        opts.onPageChange.call(pageIndex);
                    }
                }
            };

            el.changePageSize = function (toSize) {
                this.pageSize = toSize;
                this.updatePaging();
                this.updateIndicator();
                if (opts.onPageSizeChange) {
                    opts.onPageSizeChange.call(pageSize);
                }
            };

            el.updateIndicator = function () {
                jQuery(this).closest("div.grid-container").find("input.pagedisplay")
                    .val((this.pageIndex + 1) + "/" + this.getPageCount());
            };

            el.updatePaging = function () {
                var start = this.pageIndex * this.pageSize;
                var end = start + this.pageSize;
                var rows = this.getRows();
                jQuery(rows).hide();
                for (var i = start; i < end && i < rows.length; i++) {
                    jQuery(rows[i]).show();
                }
                jQuery(el).trigger("paged");

                // If the jQuery.tableFilterable plugin is being used then
                // re-hide any items that have been filtered out
                if (jQuery(el).is(opts.filterableSelector)) {
                    jQuery("tr.filtered-out", el).hide();
                }
            };

            // If jQuery.tableFilterable plugin is being used then handle
            // the 'filtered' and 'unfiltered' events
            if (jQuery(el).is(opts.filterableSelector)) {
                jQuery(el).bind("unfiltered", function () {
                    el.updatePaging();
                    jQuery(el).closest("div.grid-container").find("div.pager-container").show();
                });
                jQuery(el).bind("filtered", function () {
                    jQuery(el).closest("div.grid-container").find("div.pager-container").hide();
                });
            }

            createPagerControls(jQuery(el));
            bindControlHandlers(jQuery(el));
            bindSortEvents(jQuery(el));
            el.updatePaging();
            el.updateIndicator();

        });

        function createPagerControls(table) {

            var pagerHtml = jQuery("<div class='pager-container pager clearfix'>" +
                "<span class='first'>First</span>" +
                "<span class='prev'>Prev</span>" +
                "<input type='text' class='pagedisplay' size='4' disabled='disabled' />" +
                "<span class='next'>Next</span>" +
                "<span class='last'>Last</span>" +
                "<select class='pagesize'>" +
                "<option selected='selected' value='10'>10</option>" +
                "<option value='20'>20</option>" +
                "<option value='40'>40</option>" +
                "<option value='60'>60</option>" +
                "<option  value='100'>100</option>" +
                "</select>" +
                "<span class='count'>Count: " + jQuery("tbody tr", table).length + "</span>" +
                "</div>");

            var outerDiv = jQuery("<div class='grid-container clearfix'></div>");

            table.before(outerDiv);
            outerDiv.append(table);
            outerDiv.append(pagerHtml);
        }

        function bindControlHandlers(table) {

            var div = table.parent();
            var el = table[0];

            div.find("span.first").bind("click", function () { el.changePage(0); });
            div.find("span.prev").bind("click", function () { el.changePage(el.pageIndex - 1); });
            div.find("span.next").bind("click", function () { el.changePage(el.pageIndex + 1); });
            div.find("span.last").bind("click", function () { el.changePage(el.getPageCount() - 1); });
            div.find("select.pagesize").bind("change", function () { el.changePageSize(parseInt(jQuery(this).val())); });
        }

        function bindSortEvents(table) {
            var el = jQuery(table[0]);
            if (el.is(opts.sortableSelector)) {
                el.bind("sorted", function () {
                    // If jQuery.tableFilterable plugin is being used, check first
                    // if the grid is filtered and if so, don't update the paging
                    if (el.is(opts.filterableSelector)) {
                        if (!this.isFiltered()) {
                            this.updatePaging();
                        }
                    } else {
                        this.updatePaging();
                    }
                });
            }
        }
    };
})(jQuery);