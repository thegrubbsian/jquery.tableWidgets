/* jquery.tableSortable v1.0 */

/*
options = {
pageableSelector: String (css selector),
filterableSelector: String (css selector)
};
*/

(function (jQuery) {
    jQuery.fn.tableSortable = function (options) {

        var tables = jQuery(this);
        var defaults = {
            pageableSelector: "table.pageable",
            filterableSelector: "table.filterable"
        };
        var opts = jQuery.extend(defaults, options);

        var sorts = {}; sorts["up"] = [1, -1]; sorts["down"] = [-1, 1];
        var types = {};
        types["alpha"] = function (x) { return x.toString(); };
        types["number"] = function (x) { return parseInt(x); };
        types["date"] = function (x) { return new Date(x); };

        function getConverter(col) {
            for (var t in types) { if (col.hasClass(t)) { return types[t]; } }
            return types["alpha"];
        }

        tables.each(function () {

            var el = this;

            // If sorting is already enabled, the continue to next table
            if (el.sortable) { return; }
            el.sortable = true;

            $("thead tr:first-child th").each(function () {
                $(this).prepend("<div class=\"sort-icon\"></div>");
            });

            el.getRows = function () { jQuery(this).find("tbody > tr").get(); };
            el.getColumn = function (idx) { return jQuery(jQuery(this).find("thead tr").children()[idx]); };

            el.sort = function (idx, dir) {

                var col = this.getColumn(idx);

                var rows = this.getRows();

                rows.sort(function (a, b) {
                    var keyA = getConverter(col)(jQuery(a).children("td").eq(idx).text().toLowerCase());
                    var keyB = getConverter(col)(jQuery(b).children("td").eq(idx).text().toLowerCase());
                    if (keyA < keyB) return sorts[dir][0];
                    if (keyA > keyB) return sorts[dir][1];
                    return 0;
                });

                jQuery.each(rows, function (i, row) {
                    jQuery(el).children("tbody").append(row);
                });

                // If the jQuery.tableFilterable plugin is being used then
                // re-hide any items that have been filtered out
                if (jQuery(el).is(opts.filterableSelector)) {
                    jQuery("tr.filtered-out", el).hide();
                }

                jQuery("th", this).removeClass("sort-up").removeClass("sort-down").each(function () {
                    if (jQuery(this).attr("class") == "") { jQuery(this).removeAttr("class"); }
                });
                col.addClass("sort-" + dir);

                jQuery(this).trigger("sorted");
            };

            jQuery("th", this).each(function (idx) {
                var th = jQuery(this);
                if (!th.is(".no-sort")) {
                    th.toggle(
                        function () { el.sort(idx, "up"); },
                        function () { el.sort(idx, "down"); }
                    );
                }
            });
        });
    };
})(jQuery);