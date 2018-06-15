function drawTable(selector, data) {
    var table = d3.select(selector).append('table');

    var columns = ["Id", "Send date", "Color"];
    // append the header row
    table.append('tr')
        .selectAll('th')
        .data(columns).enter()
        .append('th')
        .text(function (column) { return column; });

    // create a row for each object in the data
    var rows = table.selectAll('tr')
        .data(data)
        .enter()
        .append('tr');

    // create a cell in each row for each column
    var cells = rows.selectAll('td')
        .data(function (row) {
            return [row["Id"], row["Send date"].format("YYYY-mm-DD hh:mm")]
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

(function (selector) {
    var svg = d3.select(selector).append("svg");
    svg.attr("width", 400);
    svg.attr("height", 200);
    var margin = { top: 20, right: 20, bottom: 30, left: 100 },
        width = +svg.attr("width") - margin.left - margin.right,
        height = +svg.attr("height") - margin.top - margin.bottom,
        g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var y0 = d3.scaleBand()
        .rangeRound([0, height])
        .paddingInner(0.1);

    var y1 = d3.scaleBand()
        .padding(0.05);

    var x = d3.scaleLinear()
        .rangeRound([width, 0]);

    var z = d3.scaleOrdinal()
        .range(["#f7f296", "#8d91bb"]);

    d3.csv("data.csv", function (d) {
        var columns = Object.getOwnPropertyNames(d);
        for (var i = 1, n = columns.length; i < n; ++i) {
            d[columns[i]] = +d[columns[i]];
        }
        return d;
    }).then(function (data) {
        var keys = data.columns.slice(1);

        y0.domain(keys);
        y1.domain(data.map(function (d) { return d.Campaign; })).rangeRound([0, y0.bandwidth()]);

        x.domain([0, d3.max(data, function (d) { return d3.max(keys, function (key) { return d[key]; }); })]).nice();

        g.append("g")
            .selectAll("g")
            .data(data)
            .enter().append("g")
            .attr("transform", function (d) { return "translate(0," + y1(d.Campaign) + ")"; })
            .selectAll("rect")
            .data(function (d) { return keys.map(function (key) { return { key: key, value: d[key], campaign: d.Campaign }; }); })
            .enter().append("rect")
            .attr("x", 0)
            .attr("y", function (d) { return y0(d.key); })
            .attr("width", function (d) { return width - x(d.value); })
            .attr("height", y1.bandwidth())
            .attr("fill", function (d) { return z(d.campaign); })
            .on("click", function(d){updateMap();});

        g.append("g")
            .attr("class", "axis")
            .call(d3.axisLeft(y0));

        var legend = g.append("g")
            .attr("font-family", "sans-serif")
            .attr("font-size", 10)
            .attr("text-anchor", "end")
            .selectAll("g")
            .data(data.map(function (d) { return d.Campaign; }))
            .enter().append("g")
            .attr("transform", function (d, i) { return "translate(0," + i * 20 + ")"; });

        legend.append("rect")
            .attr("x", width - 19)
            .attr("width", 19)
            .attr("height", 19)
            .attr("fill", z);

        legend.append("text")
            .attr("x", width - 24)
            .attr("y", 12)
            .attr("dy", "0.32em")
            .text(function (d) { return d; });
    });
})("#chart_performance");

function drawMap(selector, data, update) {
    var svg;

    if(update) {
        svg = d3.select(selector).select("svg");
    }
    else {
        svg = d3.select(selector).append("svg");
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
    }
    
    var margin = { top: 0, right: 0, bottom: 0, left: 0 },
        width = +svg.attr("width") - margin.left - margin.right,
        height = +svg.attr("height") - margin.top - margin.bottom;
    
    var g;

    if(update) {
        g = svg.select("g").select("g");
    }
    else {
        g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")").append("g");
    }

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

    g.selectAll("g").remove();
    g.selectAll("g")
        .data(data)
        .enter().append("g")
        .attr("transform", function (d) { return "translate(" + x(d.Campaign) + ",0)"; })
        .selectAll("rect")
        .data(function (d) { return keys.map(function (key) { return { key: key, value: d[key], campaign: d.Campaign, state: d.state }; }); })
        .enter().append("rect")
        .attr("x", function(d) { return x0(d.state); })
        .attr("y", function (d) { return y0(d.state) + y(d.value); })
        .attr("width", x.bandwidth())
        .attr("height", function (d) { return height/5 - y(d.value); })
        .attr("fill", function (d) { return z(d.campaign); })
        .transition(500);
}

function updateMap() {
    var data = [
        {Campaign: "Campaign1", value:20, state:"V"},
        {Campaign: "Campaign2", value:10, state:"V"},
        {Campaign: "Campaign1", value:40, state:"UA"},
        {Campaign: "Campaign2", value:10, state:"UA"},
        {Campaign: "Campaign1", value:30, state:"LA"},
        {Campaign: "Campaign2", value:40, state:"LA"},
        {Campaign: "Campaign1", value:30, state:"S"},
        {Campaign: "Campaign2", value:40, state:"S"},
        {Campaign: "Campaign1", value:30, state:"T"},
        {Campaign: "Campaign2", value:40, state:"T"},
        {Campaign: "Campaign1", value:50, state:"Vo"},
        {Campaign: "Campaign2", value:40, state:"Vo"},
        {Campaign: "Campaign1", value:30, state:"K"},
        {Campaign: "Campaign2", value:80, state:"K"},
        {Campaign: "Campaign1", value:30, state:"St"},
        {Campaign: "Campaign2", value:40, state:"St"},
        {Campaign: "Campaign1", value:30, state:"B"},
        {Campaign: "Campaign2", value:40, state:"B"},
    ]
    drawMap("#chart_location", data, true);
}