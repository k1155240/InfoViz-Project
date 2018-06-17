function drawScatterPlot() {
    var data = metaData.map(function(d) {
        return {Id: d["CampaignID"], Name: d["Name"], "Open Rate": d["Openings"]/d["Mails"] * 100, "Click Rate": d["Clicks"]/d["Mails"] * 100}
    });

    var margin = {top: 20, right: 20, bottom: 40, left: 50},
        width = 400 - margin.left - margin.right,
        height = 200 - margin.top - margin.bottom;

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
        .attr("font-size", "12")
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
        .attr("font-size", "12")
        .style("text-anchor", "end")
        .text("Click Rate (%)");

    updateScatterPlot();
}

function updateScatterPlot() {
    var data = metaData.map(function(d) {
        return {Id: d["CampaignID"], Name: d["Name"], "Open Rate": d["Openings"]/d["Mails"] * 100, "Click Rate": d["Clicks"]/d["Mails"] * 100}
    });

    var margin = {top: 20, right: 20, bottom: 40, left: 50},
        width = 400 - margin.left - margin.right,
        height = 200 - margin.top - margin.bottom;

    var svg = d3.select("#chart_timeline")
        .select("svg").select("g");

    var x = function(d) { return d["Open Rate"];},
        xScale = d3.scaleLinear().range([0, width]).domain([0, d3.max(data, x)+10]);
    var y = function(d) { return d["Click Rate"];},
        yScale = d3.scaleLinear().range([height, 0]).domain([0, d3.max(data, y)+1]);
    var color = d3.scaleOrdinal(d3.schemeCategory10);

    var plot = svg.selectAll(".dot")
        .data(data);
    var tooltip = d3.select("#chart_timeline").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);

    plot.enter().append("circle")
        .attr("class", "dot")
        .attr("r",  0.1)
        .attr("cx", function(d) { return xScale(x(d)); })
        .attr("cy", function(d) { return yScale(y(d)); })
        .style("fill", function(d) { var col = selectedColor(d.Id); var stdCol = color(d.Name); return col === "" ? stdCol : col;}) 
        .on("mouseover", function(d) {
            tooltip.transition()
                .duration(200)
                .style("opacity", 1);
            tooltip.html(d["Name"] + "<br/> (" + x(d).toPrecision(2) + '%' 
                + ", " + y(d).toPrecision(2) + "%)")
                .style("left", (d3.event.pageX + 10) + "px")
                .style("top", (d3.event.pageY - 35) + "px");
        })
        .on("mouseout", function(d) {
            tooltip.transition()
                .duration(500)
                .style("opacity", 0);
        })
        .transition()
        .attr("r",  function(d) { return selectedCampaigns.includes(d["Id"]) ? 7 : 3.5})
        .style("fill", function(d) { var col = selectedColor(d.Id); var stdCol = color(d.Name); return col === "" ? stdCol : col;}) 
    
    plot.transition()
        .attr("r",  function(d) { return selectedCampaigns.includes(d["Id"]) ? 7 : 3.5})
        .style("fill", function(d) { var col = selectedColor(d.Id); var stdCol = color(d.Name); return col === "" ? stdCol : col;}) 
}