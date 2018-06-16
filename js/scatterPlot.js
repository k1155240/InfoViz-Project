function drawScatterPlot() {
    var data = metaData.map(function(d) {
        return {Id: d["CampaignID"], Name: d["Name"], "Open Rate": d["Openings"]/d["Mails"] * 100, "Click Rate": d["Clicks"]/d["Mails"] * 100}
    });

    var margin = {top: 20, right: 20, bottom: 30, left: 40},
        width = 400 - margin.left - margin.right,
        height = 200 - margin.top - margin.bottom;

    var xValue = function(d) { return d["Open Rate"];},
        xScale = d3.scaleLinear().range([0, width]),
        xMap = function(d) { return xScale(xValue(d));},
        xAxis = d3.axisBottom().scale(xScale);

    // setup y
    var yValue = function(d) { return d["Click Rate"];},
        yScale = d3.scaleLinear().range([height, 0]),
        yMap = function(d) { return yScale(yValue(d));},
        yAxis = d3.axisLeft().scale(yScale);

    // setup fill color
    var cValue = function(d) { return d.Name;},
        color = d3.scaleOrdinal(d3.schemeCategory10);

    // add the graph canvas to the body of the webpage
    var svg = d3.select("#chart_timeline").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
    .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // add the tooltip area to the webpage
    var tooltip = d3.select("#chart_timeline").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);

    // don't want dots overlapping axis, so add in buffer to data domain
    xScale.domain([d3.min(data, xValue)-1, d3.max(data, xValue)+1]);
    yScale.domain([d3.min(data, yValue)-1, d3.max(data, yValue)+1]);

    // x-axis
    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis)
        .append("text")
        .attr("class", "label")
        .attr("x", width)
        .attr("y", -6)
        .style("text-anchor", "end")
        .text("Calories");

    // y-axis
    svg.append("g")
        .attr("class", "y axis")
        .call(yAxis)
        .append("text")
        .attr("class", "label")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", ".71em")
        .style("text-anchor", "end")
        .text("Protein (g)");

    // draw dots
    svg.selectAll(".dot")
        .data(data)
        .enter().append("circle")
        .attr("class", "dot")
        .attr("r", 3.5)
        .attr("cx", xMap)
        .attr("cy", yMap)
        .style("fill", function(d) { return color(cValue(d));}) 
        .on("mouseover", function(d) {
            tooltip.transition()
                .duration(200)
                .style("opacity", .9);
            tooltip.html(d["Cereal Name"] + "<br/> (" + xValue(d) 
                + ", " + yValue(d) + ")")
                .style("left", (d3.event.pageX + 5) + "px")
                .style("top", (d3.event.pageY - 28) + "px");
        })
        .on("mouseout", function(d) {
            tooltip.transition()
                .duration(500)
                .style("opacity", 0);
        });
}