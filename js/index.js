var svg = d3.select('svg');

var pie = d3.pie()
  .value(function(d) { return d.count })

  var sales = [
    { product: 'Hoodie',  count: 12 },
    { product: 'Jacket',  count: 7 },
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
        .attr('fill', function(d) {
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
          .text(function(d) { return '• ' + d.data.product; })
          .attr('fill', function(d) { return color(d.data.product); })
          .attr('y', function(d, i) { return 20 * (i + 1); })