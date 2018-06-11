function startup() {
    d3.csv("data/meta_datav2.CSV", function (d_meta) {
        d_meta["Senddate"] = moment(d_meta["Senddate"], "DD.MM.YYYY HH:mm");
        return d_meta;
    }).then(function (meta_data) {
        d3.csv("data/data_v4.CSV", function (data) {
            return data;
        }).then(function (data) {
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
            drawMap("#chart_location", data, false); 
        });
    });
}