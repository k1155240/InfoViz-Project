(function (selector) {
    var svg = d3.select(selector).append("svg");

    var pie = d3.pie()
        .value(function (d) { return d.count })

    var sales = [
        { product: 'Hoodie', count: 12 },
        { product: 'Jacket', count: 7 },
        { product: 'Snuggie', count: 6 },
    ];

    var slices = pie(sales);
    // the result looks roughly like this:
    [
        {
            data: sales[0],
            endAngle: 3.0159289474462017,
            startAngle: 0,
            value: 12
        },
        {
            data: sales[1],
            startAngle: 3.0159289474462017,
            endAngle: 4.775220833456486,
            value: 7
        },
        {
            data: sales[2],
            startAngle: 4.775220833456486,
            endAngle: 6.283185307179587,
            value: 6
        }
    ]

    var arc = d3.arc()
        .innerRadius(0)
        .outerRadius(50);

    // helper that returns a color based on an ID
    var color = d3.scaleOrdinal(d3.schemeCategory10);

    var g = svg.append('g')
        .attr('transform', 'translate(200, 50)')

    g.selectAll('path.slice')
        .data(slices)
        .enter()
        .append('path')
        .attr('class', 'slice')
        .attr('d', arc)
        .attr('fill', function (d) {
            return color(d.data.product);
        });

    // building a legend is as simple as binding
    // more elements to the same data. in this case,
    // <text> tags
    svg.append('g')
        .attr('class', 'legend')
        .selectAll('text')
        .data(slices)
        .enter()
        .append('text')
        .text(function (d) { return '• ' + d.data.product; })
        .attr('fill', function (d) { return color(d.data.product); })
        .attr('y', function (d, i) { return 20 * (i + 1); })
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
            .attr("fill", function (d) { return z(d.campaign); });

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

(function (selector) {
    var svg = d3.select(selector).append("svg");
    svg.attr("width", 600);
    svg.attr("height", 350);
    svg.append("image")
    .attr("xlink:href", "at.svg")
    .attr("width", 600)

    var margin = { top: 0, right: 0, bottom: 0, left: 0 },
        width = +svg.attr("width") - margin.left - margin.right,
        height = +svg.attr("height") - margin.top - margin.bottom,
        g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var keys = ["value"];

    var data = [
        {Campaign: "Campaign1", value:10, state:"V"},
        {Campaign: "Campaign2", value:20, state:"V"},
        {Campaign: "Campaign1", value:20, state:"UA"},
        {Campaign: "Campaign2", value:10, state:"UA"},
        {Campaign: "Campaign1", value:30, state:"LA"},
        {Campaign: "Campaign2", value:20, state:"LA"},
        {Campaign: "Campaign1", value:30, state:"S"},
        {Campaign: "Campaign2", value:20, state:"S"},
        {Campaign: "Campaign1", value:30, state:"T"},
        {Campaign: "Campaign2", value:20, state:"T"},
        {Campaign: "Campaign1", value:50, state:"Vo"},
        {Campaign: "Campaign2", value:20, state:"Vo"},
        {Campaign: "Campaign1", value:30, state:"K"},
        {Campaign: "Campaign2", value:20, state:"K"},
        {Campaign: "Campaign1", value:30, state:"St"},
        {Campaign: "Campaign2", value:20, state:"St"},
        {Campaign: "Campaign1", value:30, state:"B"},
        {Campaign: "Campaign2", value:20, state:"B"},
    ]
    
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

    g.append("g")
        .selectAll("g")
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
        .attr("fill", function (d) { return z(d.campaign); });
})("#chart_location");