var mailData;
var metaData;

var openings;
var clicks;
var readTime;

function startup() {
    d3.csv("data/meta_datav2.CSV", function (d_meta) {
        d_meta["Senddate"] = moment(d_meta["Senddate"], "DD.MM.YYYY HH:mm");
        return d_meta;
    }).then(function (meta_data) {
        d3.csv("data/data_v4.CSV", function (data) {
            return data;
        }).then(function (data) {
            var tableData = meta_data.map(function(d){ 
                var newData = [];
                newData["Id"] = d["CampaignID"].slice(0,10);
                newData["Send date"] = d["Senddate"];
                return newData;
            })

            mailData = data;
            metaData = meta_data;

            drawTable("#chart_table", tableData.slice(0,10)); 
            
            dataPerCamapign = d3.nest()
                .key(function(d) { return d.SendId; })
                .entries(data);

            openings = d3.nest()
                .key(function(d) { return { sendId: d.SendId, region: d.Region }; })
                .rollup(function(v) { return v.length; })
                .entries(data.filter(function(d){ d.type == "opening"}));

            clicks = d3.nest()
                .key(function(d) { return { sendId: d.SendId, region: d.Region }; })
                .rollup(function(v) { return v.length; })
                .entries(data.filter(function(d){ d.type == "clicks"}));

            readTime = d3.nest()
                .key(function(d) { return { sendId: d.SendId, region: d.Region }; })
                .rollup(function(v) { return d3.mean(selectedData, function(d) { return +d.ReadTime}); })
                .entries(data.filter(function(d){ d.type == "opening" && d.ReadTime != "NULL"}));

            drawMap("#chart_location", meta_data[0].Id, meta_data[1].Id, "OpenRate", false); 

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
        });
    });
}