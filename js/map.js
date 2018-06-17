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
            var name = metaData.filter(function(md){ return md.CampaignID == d.key})[0]["Name"];
            var id = metaData.filter(function(md){ return md.CampaignID == d.key})[0]["CampaignID"];
            return d.values.map(function(d2){
                return {Id: id, Campaign: name, value:d2.value, state:convertRegion(d2.key)}  
            })
            .filter(function(a) {return a.state !== null})
            .sort(function(a, b) {
                if (a.state < b.state) {
                  return -1;
                }
                if (a.state > b.state) {
                  return 1;
                }

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

    var mapType = d3.select('input[name="mapType"]:checked').node().value;
    var y = d3.scaleLinear()
        .rangeRound([height/5, 0])
        .domain([0, d3.max(data, function (d) { return d3.max(keys, function (key) { return d[key]; }); })])
        .nice();

    var getY = function(state) {
        if(mapType == "all")
            return y;
        else {
            return d3.scaleLinear()
            .rangeRound([height/5, 0])
            .domain([0, d3.max(data.filter(function(d) {return d.state == state;}), function (d) { return d3.max(keys, function (key) { return d[key]; }); })])
            .nice();
        }
    }
    
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
            return keys.map(function (key) { return { key: key, value: d[key], Id:d.Id, campaign: d.Campaign, state: d.state }; }); })
    
    var tooltip = d3.select("body").select("div.tooltip");

    rectData.exit().remove();
    rectData.enter().append("rect")
        .attr("x", function(d) { return x0(d.state); })
        .attr("y", function (d) { return y0(d.state) + height/5; })
        .attr("width", x.bandwidth())
        .attr("height", function (d) { return 0; })
        .attr("fill", function (d) {  return selectedColor(d.Id); })
        .on("mouseover", function(d) {
            tooltip.transition()
                .duration(200)
                .style("opacity", 1);
            tooltip.html(toolTipTextMap(d, data))
                .style("left", (d3.event.pageX + 10) + "px")
                .style("top", (d3.event.pageY - 35) + "px");
        })
        .on("mouseout", function(d) {
            tooltip.transition()
                .duration(500)
                .style("opacity", 0);
        })
        .transition()
        .attr("x", function(d) { return x0(d.state); })
        .attr("y", function (d) { return y0(d.state) + getY(d.state)(d.value); })
        .attr("width", x.bandwidth())
        .attr("height", function (d) { return height/5 - getY(d.state)(d.value); })
        .attr("fill", function (d) {  return selectedColor(d.Id); });

    rectData.transition()
        .duration(500)
        .attr("x", function(d) { return x0(d.state); })
        .attr("y", function (d) { return y0(d.state) + getY(d.state)(d.value); })
        .attr("width", x.bandwidth())
        .attr("height", function (d) { return height/5 - getY(d.state)(d.value); })
        .attr("fill", function (d) {  return selectedColor(d.Id); });
}

function drawMap() {
    var svg = d3.select("#chart_location").append("svg");
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

function toolTipTextMap(d, data) {
    var text = d["campaign"];
    var campaign = metaData.filter(function(d2) {return d2.CampaignID == d.Id})[0];
    
    if(selectedMapDataType == "Open Rate") {
        text += '<br/>' + d.value  + " Openings";
    }

    if(selectedMapDataType == "Click Rate") {
        text += '<br/>' + d.value  + " Clicks";
    }

    if(selectedMapDataType == "Open Rate" || selectedMapDataType == "Click Rate")
        text += "<br/>("+ (d.value/campaign.Mails * 100).toPrecision(2) + "% of all)";

    if(selectedMapDataType == "Reading Duration") {
        text += d["campaign"] + "<br/> " + selectedMapDataType + ": " + d.value + "s";
    }

    return text;
}

d3.selectAll("#mapType").on("change", function(){
    addMapData();
});