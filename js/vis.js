var selectedCampaigns = [];
var selectedMapDataType = "Open Rate";

function selectedColor(id) {
    if(selectedCampaigns[0] == id)
        return "#f7f296";
    else if(selectedCampaigns[1] == id)
        return "#8d91bb";
    else 
        return "";
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
    }
    else if (selectedCampaigns.length < 2) {
        selectedCampaigns.push(d["Id"]);
    }

    updateTable(selector);
    addMapData();
    updateBars();
    updateScatterPlot();
}

function drawTable(selector, data) {
    var table = d3.select(selector).append('table');
    
    var columns = ["Name", "Send date"];
    // append the header row
    table.append('tr')
        .selectAll('th')
        .data(columns)
        .enter()
        .append('th')
        .text(function (column) { return column; });

    // create a row for each object in the data
    var rows = table.selectAll('tr.data')
        .data(data)
        .enter()
        .append('tr')
        .attr("data-id", function(d) {return  d["Id"];})
        .on("click", function(d) { selectCampaign(d, selector)})
        .classed("data", true);

    // create a cell in each row for each column
    var cells = rows.selectAll('td')
        .data(function (row) {
            return [row["Name"], row["Send date"].format("YYYY-MM-DD hh:mm")]
        })
        .enter()
        .append('td')
        .text(function (d) { return d; });
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
                "Click Rate": clicks
                    .filter(function(d){ return d.key == m.CampaignID}).map(function(d) { 
                        return d3.sum(d.values, function(d2){ return d2.value; })/m["Mails"] * 100
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

    var keys = ["Open Rate", "Click Rate", "Reading Duration"];

    y0.domain(keys);
    y1.domain(data.map(function (d) { return d.Campaign; })).rangeRound([0, y0.bandwidth()]);

    x.domain([0, d3.max(data, function (d) { return d3.max(keys, function (key) { return d[key]; }); })]).nice();

    var gdata = g.select("g.data")
        .selectAll("g")
        .data(data);

    gdata.exit().remove();
    gdata.enter().append("g")
        .attr("transform", function (d) { return "translate(0," + y1(d.Campaign) + ")"; });
    gdata.transition()
        .attr("transform", function (d) { return "translate(0," + y1(d.Campaign) + ")"; });
    
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
        .on("click", function(d){ selectedMapDataType = d.key; updateBars(); addMapData();})
        .transition()
        .attr("width", function (d) { 
            return barwidth - x(d.value); })
            
    rectData.transition()
        .attr("y", function (d) { return y0(d.key); })
        .attr("width", function (d) { 
            return barwidth - x(d.value); })
        .attr("height", y1.bandwidth())
        .attr("fill", function (d) { return selectedColor(d.Id); })

    g.select("g.axis")
        .call(d3.axisLeft(y0))
        .selectAll("text")
        .attr("text-decoration", function(d, i) { return d == selectedMapDataType  ? "underline" : "none";});
}

function drawBars() {
    var svg = d3.select("#chart_performance").append("svg");
    svg.attr("width", 400);
    svg.attr("height", 200);
    var margin = { top: 20, right: 20, bottom: 30, left: 100 },
        width = +svg.attr("width") - margin.left - margin.right,
        height = +svg.attr("height") - margin.top - margin.bottom,
        g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    g.append("g").attr("class", "data");
    g.append("g").attr("class", "axis");
    g.append("g").attr("class", "legend");
};



