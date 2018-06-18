var selectedCampaigns = [];
var selectedCampaignsNames = [];
var selectedMapDataType = "Open Rate";
var colors = ["#a0d1ce","#f5cc63","#B2BC71","#909749","#dce2c6","#1d949c","#70ADBE","#db8f77","#e53f25","#ecb16d","#f8c7cd","#ef677b","#751231","#834743","#c4aa87","#b3b1a5"];

function selectedColor(id) {
    if(selectedCampaigns[0] == id) {
        return color(selectedCampaignsNames[0]);
    }
    else if(selectedCampaigns[1] == id)
        return color(selectedCampaignsNames[1]);
    else
        return "";
}

function color(name) {
    var num = parseInt(name.replace(/^\D+/g,''))-1;
    return colors[num];
}

function updateTable(selector) {
    d3.select(selector)
        .select('table')
        .selectAll('tr.data')
        .transition()
        .style("background-color", function(d, i) { 
            var id = d3.select(this).attr("data-id");
            return id !== null && selectedColor(id);});
}

function selectCampaign(d, selector) {
    if(selectedCampaigns.includes(d["Id"])) {
        selectedCampaigns.splice(selectedCampaigns.indexOf(d["Id"]), 1);
        selectedCampaignsNames.splice(selectedCampaignsNames.indexOf(d["Name"]), 1);
    }
    else if (selectedCampaigns.length < 2) {
        selectedCampaigns.push(d["Id"]);
        selectedCampaignsNames.push(d["Name"]);
    }

    updateTable(selector);
    addMapData();
    updateBars();
    updateScatterPlot();
}

function drawTable(selector, data) {
    var table = d3.select(selector).append('table');
    
    var columns = ["", "Name", "Send date"];

    table.append('tr')
        .selectAll('th')
        .data(columns)
        .enter()
        .append('th')
        .text(function (column) { return column; });

    var rows = table.selectAll('tr.data')
        .data(data)
        .enter()
        .append('tr')
        .attr("data-id", function(d) {return  d["Id"];})
        .on("click", function(d) { selectCampaign(d, selector)})
        .classed("data", true);

    var cells = rows.selectAll('td')
        .data(function (row) {
            return [color(row["Name"]), row["Name"], row["Send date"].format("YYYY-MM-DD hh:mm")];
        })
        .enter()
        .append('td')
        .text(function (d) { return d; })
        .style('background-color', function(d){
            return /^#[0-9A-F]{6}$/i.test(d) ? d : null;
        })
        .style('font-size', function(d){
            return /^#[0-9A-F]{6}$/i.test(d) ? 0 : 10;
        });
}



function updateBars() {
    var id1 = selectedCampaigns[0];
    var id2 = selectedCampaigns[1];

    var data = metaData.filter(function(md){ return md.CampaignID == id1 || md.CampaignID == id2})
        .map(function(m) { 
            return {
                Id: m["CampaignID"],
                Campaign: m["Name"],
                "Open Rate": openings
                    .filter(function(d){ return d.key == m.CampaignID}).map(function(d) { 
                        return d3.sum(d.values, function(d2){ return d2.value; })/m["Mails"] * 100
                    })[0],
                "Openings": openings
                    .filter(function(d){ return d.key == m.CampaignID}).map(function(d) { 
                        return d3.sum(d.values, function(d2){ return d2.value; })
                    })[0],
                "Click Rate": clicks
                    .filter(function(d){ return d.key == m.CampaignID}).map(function(d) { 
                        return d3.sum(d.values, function(d2){ return d2.value; })/m["Mails"] * 100
                    })[0],
                "Clicks": clicks
                    .filter(function(d){ return d.key == m.CampaignID}).map(function(d) { 
                        return d3.sum(d.values, function(d2){ return d2.value; })
                    })[0],
                "Reading Duration": readTime
                    .filter(function(d){ return d.key == m.CampaignID}).map(function(d) { 
                        return d.value
                    })[0]
            }
        });
    
    var svg = d3.select("#chart_performance").select("svg");
    var margin = { top: 20, right: 20, bottom: 30, left: 100 },
        width = +svg.attr("width") - margin.left - margin.right,
        height = +svg.attr("height") - margin.top - margin.bottom,
        g = svg.select("g");

    var barwidth = width - 65;
    var y0 = d3.scaleBand()
        .rangeRound([0, height])
        .paddingInner(0.1);
    var y1 = d3.scaleBand()
        .padding(0.05);
    var x = d3.scaleLinear()
        .rangeRound([barwidth, 0]);
    var xReading = d3.scaleLinear()
        .rangeRound([barwidth, 0]);

    var keys = ["Open Rate", "Click Rate", "Reading Duration"];

    y0.domain(keys);

    y1.domain(data.map(function (d) { return d.Campaign; })).rangeRound([0, y0.bandwidth()]);

    x.domain([0, d3.max(data, function (d) { return d3.max(keys, function (key) { return d[key]; }); })]).nice();
    xReading.domain([0, 10]).nice();
    var getX = function(d) {
        if(d.key == "Reading Duration")
            return xReading;
        else
            return x;
    }

    var gdata = g.select("g.data")
        .selectAll("g")
        .data(data);

    gdata.exit().remove();
    gdata.enter().append("g")
        .transition()
        .attr("transform", function (d) { return "translate(0," + y1(d.Campaign) + ")"; });

    var tooltip = d3.select("body").select("div.tooltip");

    var rectData = g.select("g.data")
        .selectAll("g")
        .selectAll("rect")
        .data(function (d) { return keys.map(function (key) { return { key: key, value: d[key], Id: d.Id, campaign: d.Campaign }; }); })
    
    rectData.exit().remove();
    rectData.enter().append("rect")
        .attr("x", 0)
        .attr("y", function (d) { return y0(d.key); })
        .attr("width", function (d) { return 0; })
        .attr("height", y1.bandwidth())
        .attr("fill", function (d) { return selectedColor(d.Id); })
        .on("mouseover", function(d) {
            tooltip.transition()
                .duration(200)
                .style("opacity", 1);
            tooltip.html(toolTipText(d, data))
                .style("left", (d3.event.pageX + 10) + "px")
                .style("top", (d3.event.pageY - 35) + "px");
        })
        .on("mouseout", function(d) {
            tooltip.transition()
                .duration(500)
                .style("opacity", 0);
        })
        .transition()
        .attr("width", function (d) { 
            return barwidth - getX(d)(d.value); })
            
    rectData.transition()
        .attr("y", function (d) { return y0(d.key); })
        .attr("width", function (d) { 
            return barwidth - getX(d)(d.value); })
        .attr("height", y1.bandwidth())
        .attr("fill", function (d) { return selectedColor(d.Id); })

    g.select("g.axis")
        .call(d3.axisLeft(y0))
        .selectAll("text")
        .style("font-size", function(d) { return d == selectedMapDataType ? "11px" : "10px"; })
        .style("font-weight", function(d) { return d == selectedMapDataType  ? "bold" : "normal";})
        .style("cursor", "pointer")
        .on("click", function(d){ selectedMapDataType = d; updateBars(); addMapData();});
}

function drawBars() {
    var svg = d3.select("#chart_performance").append("svg");
    svg.attr("width", 400);
    svg.attr("height", 200);
    var margin = { top: 5, right: 20, bottom: 30, left: 100 },
        width = +svg.attr("width") - margin.left - margin.right,
        height = +svg.attr("height") - margin.top - margin.bottom,
        g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    g.append("g").attr("class", "data");
    g.append("g").attr("class", "axis");
    g.append("g").attr("class", "legend");
};

function toolTipText(d, data) {
    var text = "";
    var campaign = data.filter(function(d2) {return d2.Id == d.Id})[0];
    if(d.key == "Open Rate" || d.key == "Click Rate")
        text += d["campaign"] + "<br/> " + d.key + ": " + d.value.toPrecision(2);

    if(d.key == "Open Rate") {
        text += '%<br/>(' + campaign["Openings"]  + " Openings)";
    }

    if(d.key == "Click Rate") {
        text += '%<br/>(' + campaign["Clicks"]  + " Clicks)";
    }

    if(d.key == "Reading Duration") {
        text += d["campaign"] + "<br/> " + d.key + ": " + d.value.toPrecision(2) + "s";
    }

    return text;
}