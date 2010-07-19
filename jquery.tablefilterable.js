/* jquery.tablefilterable v1.0 */

/*
options = {
pageableSelector: String (css selector),
sortableSelector: String (css selector),
filterRowCssClass: String (defaults to 'filter-row'),
triggerEvent: Function
};
*/

(function (jQuery) {

    // Adds a case insensitive :insensitiveContains selector
    jQuery.expr[":"].insensitiveContains = function (a, i, m) {
        return (a.textContent || a.innerText || "").toLowerCase().indexOf(m[3].toLowerCase()) >= 0;
    };

    jQuery.fn.tableFilterable = function (options) {

        var tables = jQuery(this);
        var defaults = {
            pageableSelector: "table.pageable",
            sortableSelector: "table.sortable",
            // This is the event that triggers the filtering, 
            // for larger tables, setting this to 'change' might be more performant
            triggerEvent: "keyup",
            filterRowCssClass: "filter-row"
        };
        var opts = jQuery.extend(defaults, options);

        tables.each(function () {

            var el = this;

            // If filtering is already enabled, the continue to next table
            if (el.filterable) { return; }
            el.filterable = true;

            // Add filter row
            var trFilterRow = jQuery("<tr class='" + opts.filterRowCssClass + "'></tr>");
            jQuery("thead tr:first-child th", el).each(function () {
                var cell = jQuery("<th></th>");
                if (!jQuery(this).is(".no-filter")) {
                    cell.append("<input type='text' />");
                }
                trFilterRow.append(cell);
            });
            jQuery("thead", el).append(trFilterRow);

            jQuery("thead tr:last-child th :input", el).bind(opts.triggerEvent, function () {
                el.updateFilter();
            });

            el.getFilterValues = function () {
                var values = [];
                jQuery("thead tr:last-child th", this).each(function (i, cell) {
                    var input = jQuery(":input", cell).get(0);
                    var val = "";
                    if (input) { val = jQuery(input).val(); }
                    values.push(val);
                });
                return values;
            };

            el.updateFilter = function () {
                var values = this.getFilterValues();
                jQuery("tbody tr", this).each(function () {
                    var cells = jQuery("td", this);
                    var hideRow = false;
                    for (var i = 0; i < values.length; i++) {
                        if (values[i].length > 0) {
                            if (!jQuery(cells[i]).is(":insensitiveContains('" + values[i] + "')")) { hideRow = true; }
                        }
                    }
                    if (hideRow) {
                        jQuery(this).addClass("filtered-out").hide();
                    } else {
                        jQuery(this).removeClass("filtered-out").show();
                    }
                });
                if (!this.isFiltered()) {
                    jQuery(el).trigger("unfiltered");
                } else {
                    jQuery(el).trigger("filtered");
                }
            };

            el.isFiltered = function () {
                var isFiltered = false;
                var values = this.getFilterValues();
                for (var i = 0; i < values.length; i++) {
                    if (values[i] != "") { isFiltered = true; }
                }
                return isFiltered;
            };
        });
    };
})(jQuery);