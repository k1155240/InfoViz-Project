function drawScatterPlot() {
    var data = metaData.map(function(d) {
        return {Id: d["CampaignID"], Name: d["Name"], "Open Rate": d["Openings"]/d["Mails"] * 100, "Click Rate": d["Clicks"]/d["Mails"] * 100}
    });

    var margin = {top: 20, right: 20, bottom: 40, left: 50},
        width = 400 - margin.left - margin.right,
        height = 230 - margin.top - margin.bottom;

    var svg = d3.select("#chart_timeline")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var x = function(d) { return d["Open Rate"];},
        xScale = d3.scaleLinear().range([0, width]).domain([0, d3.max(data, x)+10]);

    var y = function(d) { return d["Click Rate"];},
        yScale = d3.scaleLinear().range([height, 0]).domain([0, d3.max(data, y)+1]);

    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom().scale(xScale));

    svg.append("g")
        .append("text")
        .attr("class", "label")
        .attr("x", width)
        .attr("y", height + 30)
        .attr("font-size", "10")
        .attr("font-family", "Verdana, Geneva, Tahoma, sans-serif")
        .style("text-anchor", "end")
        .text("Open Rate (%)");

    svg.append("g")
        .attr("class", "y axis")
        .call(d3.axisLeft().scale(yScale));

    svg.append("text")
        .attr("class", "label")
        .attr("transform", "rotate(-90)")
        .attr("x", 0)
        .attr("y", -40)
        .attr("dy", ".71em")
        .attr("font-size", "10")
        .attr("font-family", "Verdana, Geneva, Tahoma, sans-serif")
        .style("text-anchor", "end")
        .text("Click Rate (%)");

    updateScatterPlot();
}

function updateScatterPlot() {
    var data = metaData.map(function (d) {
        return {
            Id: d["CampaignID"],
            Name: d["Name"],
            "Open Rate": d["Openings"] / d["Mails"] * 100,
            "Click Rate": d["Clicks"] / d["Mails"] * 100
        }
    });

    var margin = {top: 20, right: 20, bottom: 40, left: 50},
        width = 400 - margin.left - margin.right,
        height = 230 - margin.top - margin.bottom;

    var svg = d3.select("#chart_timeline")
        .select("svg").select("g");

    var x = function (d) {
            return d["Open Rate"];
        },
        xScale = d3.scaleLinear().range([0, width]).domain([0, d3.max(data, x) + 10]);
    var y = function (d) {
            return d["Click Rate"];
        },
        yScale = d3.scaleLinear().range([height, 0]).domain([0, d3.max(data, y) + 1]);

    var plot = svg.selectAll(".dot")
        .data(data);
    var tooltip = d3.select("body").select("div.tooltip");

    d3.selection.prototype.moveToFront = function() {
        return this.each(function(){
            this.parentNode.appendChild(this);
        });
    };

    plot.enter().append("circle")
        .attr("class", "dot")
        .attr("cx", function (d) {
            return xScale(x(d));
        })
        .attr("cy", function (d) {
            return yScale(y(d));
        })
        .on("mouseover", function (d) {
            var sel = d3.select(this);
            sel.transition()
                .duration(200)
                .style("fill-opacity", 1);
            sel.moveToFront();
            tooltip.transition()
                .duration(200)
                .style("opacity", 1);
            tooltip.html(d["Name"] + "<br/> (" + x(d).toPrecision(2) + '%'
                + ", " + y(d).toPrecision(2) + "%)")
                .style("left", (d3.event.pageX + 10) + "px")
                .style("top", (d3.event.pageY - 35) + "px");
        })
        .on("mouseout", function (d) {
            d3.select(this).transition()
                .duration(200)
                .style("fill-opacity", 0.4);
            tooltip
                .transition()
                .duration(500)
                .style("opacity", 0);
        })
        .transition()
        .attr("r", function (d) {
            return selectedCampaigns.includes(d["Id"]) ? 10 : 6
        })
        .style("stroke", function (d) {
            return color(d.Name);
        })
        .style("fill-opacity", 0.4)
        .style("fill", function (d) {
            return color(d.Name);
        })

    plot.transition()
        .attr("r", function (d) {
            return selectedCampaigns.includes(d["Id"]) ? 10 : 6
        })
        .style("stroke", function (d) {
            return color(d.Name);
        })
        .style("fill-opacity", 0.4)
        .style("fill", function (d) {
            return color(d.Name);
        })
}