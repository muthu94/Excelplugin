
/* Enhanced Sankey Widget with Tooltips, Colors, Labels, Auto-Resize */

(function () {

    let d3Loaded = false;

    function loadD3(callback) {
        if (d3Loaded) {
            callback();
            return;
        }

        let script1 = document.createElement("script");
        script1.src = "https://d3js.org/d3.v5.min.js";

        let script2 = document.createElement("script");
        script2.src = "https://unpkg.com/d3-sankey@0.12.3/dist/d3-sankey.min.js";

        script2.onload = () => {
            d3Loaded = true;
            callback();
        };

        document.head.appendChild(script1);
        document.head.appendChild(script2);
    }

    let sankeyWidget = {

        init: function (root) {
            this._root = root;

            this._container = document.createElement("div");
            this._container.style.width = "100%";
            this._container.style.height = "100%";
            this._container.style.position = "relative";
            this._container.style.overflow = "hidden";

            root.appendChild(this._container);
        },

        renderSankey: function (dataObj) {
            loadD3(() => {
                this._renderChart(dataObj);
            });
        },

        _renderChart: function (dataObj) {

            this._container.innerHTML = "";

            let width = this._container.clientWidth;
            let height = this._container.clientHeight;

            let svg = d3.select(this._container)
                .append("svg")
                .attr("width", width)
                .attr("height", height);

            let sankey = d3.sankey()
                .nodeWidth(20)
                .nodePadding(20)
                .extent([[1, 1], [width - 1, height - 1]]);

            let nodes = [];
            let links = [];

            dataObj.forEach(row => {
                let src = row.Source;
                let tgt = row.Target;
                let val = row.Value;

                if (!nodes.includes(src)) nodes.push(src);
                if (!nodes.includes(tgt)) nodes.push(tgt);

                links.push({
                    source: nodes.indexOf(src),
                    target: nodes.indexOf(tgt),
                    value: val
                });
            });

            let graph = {
                nodes: nodes.map(d => ({ name: d })),
                links: links
            };

            sankey(graph);

            let color = d3.scaleOrdinal(d3.schemeCategory10);

            svg.append("g")
                .selectAll("rect")
                .data(graph.nodes)
                .enter().append("rect")
                .attr("x", d => d.x0)
                .attr("y", d => d.y0)
                .attr("height", d => d.y1 - d.y0)
                .attr("width", d => d.x1 - d.x0)
                .attr("fill", (d, i) => color(i))
                .append("title")
                .text(d => d.name);

            svg.append("g")
                .selectAll("path")
                .data(graph.links)
                .enter().append("path")
                .attr("d", d3.sankeyLinkHorizontal())
                .style("stroke", "#444")
                .style("fill", "none")
                .style("stroke-opacity", 0.3)
                .style("stroke-width", d => d.width)
                .append("title")
                .text(d => `${nodes[d.source.index]} → ${nodes[d.target.index]}: ${d.value}`);

            svg.append("g")
                .selectAll("text")
                .data(graph.nodes)
                .enter().append("text")
                .attr("x", d => d.x0 - 4)
                .attr("y", d => (d.y1 + d.y0) / 2)
                .attr("text-anchor", "end")
                .attr("alignment-baseline", "middle")
                .style("font-size", "12px")
                .text(d => d.name);
        }
    };

    window.enhancedSankey = sankeyWidget;

})();
