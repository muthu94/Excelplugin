
// Analytics Designer - App Script (paste into your Analytic Application script)
//
// Assumptions:
// - Data source widget/table is named Table_1 (replace with your data source widget name)
// - Custom Widget is named CustomWidget_1 (replace with actual widget name after import)
// - Table_1 provides three columns: Source, Target, Value
//
// Steps in this script:
// 1. On initialization, subscribe to table data change and render sankey.
// 2. Provide a function to convert table resultset to required array of objects.
// 3. Handle resizing by re-rendering on resize events.

///// Initialization
// This function is called by SAC when the application starts
function onInitialize() {
    // Replace with your actual table / datasource widget IDs
    var table = Table_1;        // e.g., Table_1
    var widget = CustomWidget_1; // e.g., CustomWidget_1

    // Render at start if data already present
    try {
        var result = table.getDataSource().getResultSet();
        if (result) {
            var dataArr = convertResultToArray(result);
            widget.renderSankey(dataArr);
        }
    } catch (e) {
        // ignore if no initial data
        console.log("Initial render skipped: " + e);
    }

    // Subscribe to data change events on the data source
    table.getDataSource().on("dataChange", function(ev) {
        var res = table.getDataSource().getResultSet();
        var dataArr = convertResultToArray(res);
        widget.renderSankey(dataArr);
    });

    // Subscribe to window resize to re-render (Analytics Designer specific event)
    Application.onResize(function() {
        var res = table.getDataSource().getResultSet();
        var dataArr = convertResultToArray(res);
        widget.renderSankey(dataArr);
    });
}

///// Helper - convert SAC resultset to array of objects
function convertResultToArray(resultSet) {
    // resultSet.getData() returns a 2D array: rows x columns
    // column names available via resultSet.getColumns()
    var data = [];
    if (!resultSet) return data;

    var cols = resultSet.getColumns();
    var colNames = cols.map(function(c){ return c.getName(); });

    var rows = resultSet.getData();
    rows.forEach(function(r) {
        // Adjust these column name lookups to match your model
        var src = r[colNames.indexOf("Source")];
        var tgt = r[colNames.indexOf("Target")];
        var val = r[colNames.indexOf("Value")];

        // Some result cells may be objects depending on model - normalize to string/number
        src = (typeof src === 'object' && src !== null && src.value) ? src.value : src;
        tgt = (typeof tgt === 'object' && tgt !== null && tgt.value) ? tgt.value : tgt;
        val = (typeof val === 'object' && val !== null && val.value) ? val.value : val;

        data.push({ Source: src, Target: tgt, Value: Number(val) || 0 });
    });
    return data;
}

// Call onInitialize (Analytics Designer will also call it if configured)
try { onInitialize(); } catch (e) { console.log(e); }
