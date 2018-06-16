var selectedCampaigns = [];
var selectedMapDataType = "Open Rate";

function updateTable(selector) {
    var color = d3.scaleOrdinal()
        .range(["#f7f296", "#8d91bb"]);

    d3.select(selector)
        .select('table')
        .selectAll('tr.data')
        .transition()
        .style("background-color", function(d, i) { 
            var id = d3.select(this).attr("data-id");
            return id !== null && selectedCampaigns.includes(id) ? color(id) : "" ;});
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

(function (selector) {
    var svg = d3.select(selector).append("svg");
    svg.attr("width", 450);
    svg.attr("height", 200);
    svg = svg.append("g").attr("transform", "translate(" + 5 + "," + 5 + ")");

    var data = [
        {Campaign: "Campaign1", senddate:new Date('2018-06-05T03:24:00')},
        {Campaign: "Campaign2", senddate:new Date('2018-06-05T03:26:00')},
        {Campaign: "Campaign3", senddate:new Date('2018-06-06T03:27:00')},
        {Campaign: "Campaign4", senddate:new Date('2018-06-06T03:28:00')},
        {Campaign: "Campaign5", senddate:new Date('2018-06-06T03:29:00')},
        {Campaign: "Campaign6", senddate:new Date('2018-06-07T03:24:00')},
        {Campaign: "Campaign7", senddate:new Date('2018-06-08T03:24:00')},
        {Campaign: "Campaign8", senddate:new Date('2018-06-08T03:24:00')},
        {Campaign: "Campaign9", senddate:new Date('2018-06-08T03:24:00')},
        {Campaign: "Campaign10", senddate:new Date('2018-06-09T03:24:00')},
        {Campaign: "Campaign11", senddate:new Date('2018-06-09T03:24:00')}
    ]

    var width = 440;
    var x = d3.scaleBand()
        .rangeRound([0, 200])
        .paddingInner(0.1)
        .domain(data.map(function(d){return d.senddate.setHours(0,0,0,0) }));

    var x1 = d3.scaleBand()
        .padding(0.05)
        .domain(data.map(function (d) { return d.Campaign; })).rangeRound([0, x.bandwidth()]);
    
    svg.append("g").append("rect")
        .attr("x", 0)
        .attr("y", 0)
        .attr("width", width)
        .attr("height", 100)
        .style("stroke", "black")
        .style("stroke-width", 1)
        .style("fill", "none");
           
    svg.append("g")
        .selectAll("g")
        .data(data)
        .enter().append("g")
        .attr("transform", function (d) { return "translate(" + x(d.senddate.setHours(0,0,0,0)) + ",0)"; })
        .selectAll("rect")
        .data(function (d) { return [d] })
        .enter().append("rect")
        .attr("x",10)
        .attr("y", 0)
        .attr("width", 10)
        .attr("height", 100)
        .attr("fill", "black");

})("#chart_timeline");

function updateBars() {
    var id1 = selectedCampaigns[0];
    var id2 = selectedCampaigns[1];

    var data = metaData.filter(function(md){ return md.CampaignID == id1 || md.CampaignID == id2})
        .map(function(m) { 
            return {
                Id: m["Name"],
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
    var z = d3.scaleOrdinal()
        .range(["#f7f296", "#8d91bb"]);

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
        .data(function (d) { return keys.map(function (key) { return { key: key, value: d[key], campaign: d.Campaign }; }); })
    
    rectData.exit().remove();
    rectData.enter().append("rect")
        .attr("x", 0)
        .attr("y", function (d) { return y0(d.key); })
        .attr("width", function (d) { return 0; })
        .attr("height", y1.bandwidth())
        .on("click", function(d){ selectedMapDataType = d.key; updateBars(); addMapData();});

    g.select("g.data")
    .selectAll("g")
    .selectAll("rect").data(function (d) { return keys.map(function (key) { return { key: key, value: d[key], campaign: d.Campaign }; }); }).transition()
        .duration(500)
        .attr("x", 0)
        .attr("y", function (d) { return y0(d.key); })
        .attr("width", function (d) { 
            return barwidth - x(d.value); })
        .attr("height", y1.bandwidth())
        .attr("fill", function (d) { return z(d.campaign); })

    g.select("g.axis")
        .call(d3.axisLeft(y0))
        .selectAll("text")
        .attr("text-decoration", function(d, i) { return d == selectedMapDataType  ? "underline" : "none";});

    var legend = g.select("g.legend")
        .attr("font-family", "sans-serif")
        .attr("font-size", 10)
        .attr("text-anchor", "end")
        .selectAll("g")
        .data(data.map(function (d) { return d.Campaign; }));

    legend.exit().remove();
    var gLegend = legend.enter().append("g")
        .attr("transform", function (d, i) { return "translate(0," + i * 20 + ")"; });

    gLegend.append("rect")
        .attr("x", width - 19)
        .attr("width", 19)
        .attr("height", 19)
        .attr("fill", z);

    gLegend.append("text")
        .attr("x", width - 24)
        .attr("y", 12)
        .attr("dy", "0.32em")
        .text(function (d) { return d; });
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

function addMapData() {
    var data = [];
    var filtered;

    var id1 = selectedCampaigns[0];
    var id2 = selectedCampaigns[1];

    if(selectedMapDataType == "Open Rate") {
        filtered = openings;
    }
    else if(selectedMapDataType == "Click Rate") {
        filtered = clicks;
    }
    else if(selectedMapDataType == "Reading Duration") {
        filtered = readTimePerRegion;
    }

    filtered = filtered
        .filter(function(d){ return d.key == id1 || d.key == id2}).map(function(d) { 
            var name = metaData.filter(function(md){ return md.CampaignID == d.key})[0]["Name"]
            return d.values.map(function(d2){
                return {Campaign: name, value:d2.value, state:convertRegion(d2.key)}  
            })
            .filter(function(a) {return a.state !== null})
            .sort(function(a, b) {
                if (a.state < b.state) {
                  return -1;
                }
                if (a.state > b.state) {
                  return 1;
                }
              
                // names must be equal
                return 0;
              });
        });

    filtered.forEach(e => {
        e.forEach(e2 => {
            data.push(e2);
        });
    });

    var svg = d3.select("#chart_location").select("svg");

    var margin = { top: 0, right: 0, bottom: 0, left: 0 },
        width = +svg.attr("width") - margin.left - margin.right,
        height = +svg.attr("height") - margin.top - margin.bottom;

    var g = svg.select("g");

    var keys = ["value"];
    
    var x0 = d3.scaleOrdinal()
        .domain(["V", "LA", "UA", "S", "T", "Vo", "K", "St", "B"])
        .range([525, 465, 360, 270, 130, 10, 370, 450,560]);

    var x = d3.scaleBand()
        .padding(0.1)
        .domain(data.map(function (d) { return d.Campaign; }))
        .rangeRound([0, width/20]);
    
    var y0 = d3.scaleOrdinal()
        .domain(["V", "LA", "UA", "S", "T", "Vo", "K", "St", "B"])
        .range([25, 20, 15, 75, 140, 120, 210, 160, 70]);

    var y = d3.scaleLinear()
        .rangeRound([height/5, 0])
        .domain([0, d3.max(data, function (d) { return d3.max(keys, function (key) { return d[key]; }); })])
        .nice();
    var z = d3.scaleOrdinal()
        .range(["#f7f296", "#8d91bb"]);

    var gdata = g.select("g.data")
        .selectAll("g")
        .data(data);

    gdata.exit().remove();
    gdata.enter().append("g")
        .attr("transform", function (d) { return "translate(" + x(d.Campaign) + ",0)"; })
    gdata.transition()
        .attr("transform", function (d) { return "translate(" + x(d.Campaign) + ",0)"; })
    
    var rectData = g.select("g.data")
        .selectAll("g")
        .selectAll("rect")
        .data(function (d) { 
            return keys.map(function (key) { return { key: key, value: d[key], campaign: d.Campaign, state: d.state }; }); })
    
    rectData.exit().remove();
    rectData.enter().append("rect")
        .attr("x", function(d) { return x0(d.state); })
        .attr("y", function (d) { return y0(d.state) + height/5; })
        .attr("width", x.bandwidth())
        .attr("height", function (d) { return 0; });

    g.select("g.data")
        .selectAll("g")
        .selectAll("rect")
        .data(function (d) { return keys.map(function (key) { return { key: key, value: d[key], campaign: d.Campaign, state: d.state }; }); })
        .transition()
        .duration(500)
        .attr("x", function(d) { return x0(d.state); })
        .attr("y", function (d) { return y0(d.state) + y(d.value); })
        .attr("width", x.bandwidth())
        .attr("height", function (d) { return height/5 - y(d.value); })
        .attr("fill", function (d) { return z(d.campaign); });
}

function drawMap(selector) {
    var svg = d3.select(selector).append("svg");
    svg.attr("width", 600);
    svg.attr("height", 350);
    svg.attr("viewBox", "0 0 600 350");

    var imagesvg = svg.append("svg"); 
    imagesvg.attr("viewBox", "0 0 1000 514");
    imagesvg.attr("width", "100%");
    imagesvg.attr("preserveAspectRatio", "xMidYMin meet");

    imagesvg.append("image")
    .attr("preserveAspectRatio", "xMidYMid meet")
    .attr("xlink:href", "at.svg")
    .attr("width", 1000).attr("height", 514);
    
    var margin = { top: 0, right: 0, bottom: 0, left: 0 },
        width = +svg.attr("width") - margin.left - margin.right,
        height = +svg.attr("height") - margin.top - margin.bottom;
    
    var g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")").append("g").attr("class", "data");;
}

function convertRegion(region) {
    switch(region) {
        case "WIEN":
            return "V";
            break; 
        case "NIEDEROSTERREICH":
            return "LA";
            break; 
        case "OBEROSTERREICH":
            return "UA";
            break; 
        case "SALZBURG":
            return "S";
            break; 
        case "TIROL":
            return "T";
            break; 
        case "VORARLBERG":
            return "Vo";
            break; 
        case "STEIERMARK":
            return "St";
            break; 
        case "KARNTEN":
            return "K";
            break; 
        case "BURGENLAND":
            return "B";
            break; 
        default:
            return null;
            break;
    }
}