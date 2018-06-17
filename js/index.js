var mailData;
var metaData;

var openings;
var clicks;
var readTime;

function startup() {
    d3.csv("data/meta_datav4.CSV", function (d_meta) {
        d_meta["Senddate"] = moment(d_meta["Senddate"], "DD.MM.YYYY HH:mm");
        return d_meta;
    }).then(function (meta_data) {
        d3.csv("data/data_v5.CSV", function (data) {
            return data;
        }).then(function (data) {
            var tableData = meta_data.map(function(d){ 
                var newData = [];
                newData["Id"] = d["CampaignID"];
                newData["Name"] = d["Name"];
                newData["Send date"] = d["Senddate"];
                return newData;
            })

            mailData = data;
            metaData = meta_data;

            dataPerCamapign = d3.nest()
                .key(function(d) { return d.SendId; })
                .entries(data);

            openings = d3.nest()
                .key(function(d) { return  d.SendId; })
                .key(function(d) { return d.Region.toUpperCase(); })
                .rollup(function(v) { return v.length; })
                .entries(data.filter(function(d){ return d.Event == "opening"}));

            clicks = d3.nest()
                .key(function(d) { return  d.SendId; })
                .key(function(d) { return d.Region.toUpperCase(); })
                .rollup(function(v) { return v.length; })
                .entries(data.filter(function(d){ return d.Event == "click"}));

            readTime = d3.nest()
                .key(function(d) { return  d.SendId; })
                .rollup(function(v) { return d3.mean(v, function(d) { return +d.ReadTime}); })
                .entries(data.filter(function(d){ return d.Event == "opening" && d.ReadTime != "NULL"}));

            readTimePerRegion = d3.nest()
                .key(function(d) { return  d.SendId; })
                .key(function(d) { return d.Region.toUpperCase(); })
                .rollup(function(v) { return d3.mean(v, function(d) { return +d.ReadTime}); })
                .entries(data.filter(function(d){ return d.Event == "opening" && d.ReadTime != "NULL"}));

            drawTable("#chart_table", tableData.slice(0, 10)); 
            drawBars();
            drawMap(); 

            selectedCampaigns.push(tableData[0]["Id"]);
            selectedCampaigns.push(tableData[1]["Id"]);

            updateTable("#chart_table");
            updateBars();
            addMapData();
            drawScatterPlot();
        });
    });
}