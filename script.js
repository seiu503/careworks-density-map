// const initialWidth = window.innerWidth;
// let width = initialWidth;
// let height = width / 2;
// const tooltip = d3.select('body').append('div').attr('class', 'tooltip').attr('id', 'tip');
// const tip = document.getElementById('tip');
// const contactScale = d3.scaleLinear().domain([1,2,3]);

// const colorScale = d3.scaleLinear().domain([1,2,3]);

// const svg = d3.select('body').append('svg')
//   .attr('width', width)
//   .attr('height', height);

// const projection = d3.geoAlbersUsa()
//   .scale(1)
//   .translate([0, 0]);

// const path = d3.geoPath().projection(projection);

// const borders = svg.append("g")
//   .attr('class', 'borders');

// const resize = () => {
//   let width = window.innerWidth;
//   let height = width / 2;
//   svg.attr('width', width).attr('height', height);
//   projection.scale(width / 2 / Math.PI).translate([width / 2, height / 2]);
//   d3.select("g").attr("transform", `scale(${width / initialWidth})`);
//   d3.selectAll("circle")
//     .attr('cx', d => projection([d[6], d[7]]))
//     .attr('cy', d => projection([d[6], d[7]]));
// }

  var width = 960,
    height = 500;

  var projection = d3.geoAlbers();

  var path = d3.geoPath()
      .projection(projection);

  var svg = d3.select("body").append("svg")
      .attr("width", width)
      .attr("height", height);

  d3.json("https://raw.githubusercontent.com/seiu503/careworks-density-map/master/us.json?token=AX1nvaGCOcfTt-j9YBYKBop1VoQl94w2ks5ahNdbwA%3D%3D", function(error, us) {
    if (error) throw error;

    var states = topojson.feature(us, us.objects.states),
        state = states.features.filter(function(d) { return d.id === 41; })[0];

    projection.scale(1)
      .translate([0, 0]);

    var b = path.bounds(state),
      s = .95 / Math.max((b[1][0] - b[0][0]) / width, (b[1][1] - b[0][1]) / height),
      t = [(width - s * (b[1][0] + b[0][0])) / 2, (height - s * (b[1][1] + b[0][1])) / 2];

    projection.scale(s)
      .translate(t);


    svg.append("path")
        .datum(topojson.mesh(us, us.objects.states, function(a, b) { return a !== b; }))
        .attr("class", "mesh")
        .attr("d", path);

    svg.append("path")
        .datum(state)
        .attr("class", "outline")
        .attr("d", path)
        .attr('id', 'land');

     svg.append("clipPath")
        .attr("id", "clip-land")
        .append("use")
        .attr("xlink:href", "#land");

    svg.selectAll("path")
        .data(topojson.feature(us, us.objects.counties).features)
        .enter().append("path")
        .attr("d", path)
        .attr('county-id', function(d){
           return d.id
        }).attr("clip-path", "url(#clip-land)")
        .attr('class', 'county');
});



// d3.queue()
//   .defer(d3.json, 'https://unpkg.com/us-atlas@1/us/10m.json')
//   .defer(d3.json, 'https://raw.githubusercontent.com/seiu503/careworks-density-map/master/cw.json?token=AX1nvY85DaeJj9L23zPSgCOwzb2Em0nVks5ahLVSwA%3D%3D')
//   .await((error, us, contacts) => {
//     console.log(us.objects.states);

//     var states = topojson.feature(us, us.objects.states),
//     state = states.features.filter(function(d) { return d.id === 41; })[0];

//     projection
//       .scale(1)
//       .translate([0, 0]);

//     var b = path.bounds(state),
//         s = .95 / Math.max((b[1][0] - b[0][0]) / width, (b[1][1] - b[0][1]) / height),
//         t = [(width - s * (b[1][0] + b[0][0])) / 2, (height - s * (b[1][1] + b[0][1])) / 2];

//     projection
//         .scale(s)
//         .translate(t);

//     svg.append("path")
//         .datum(states)
//         .attr("class", "feature")
//         .attr("d", path);

//     svg.append("path")
//         .datum(topojson.mesh(us, us.objects.states, function(a, b) { return a !== b; }))
//         .attr("class", "mesh")
//         .attr("d", path);

//     svg.append("path")
//         .datum(state)
//         .attr("class", "outline")
//         .attr("d", path);

//     // contactScale
//     //   .range([1, 2, 3]);

//     // colorScale
//     //   .range(["#FFFF66", "#E68000", "#CC0000"]);

//     // svg.append('g')
//     //   .selectAll('.contact')
//     //   .data(contacts)
//     //   .enter().append('circle')
//     //     .attr('class', 'contact')
//     //     .attr('cx', d => projection([d[6], d[6]]))
//     //     .attr('cy', d => projection([d[6], d[7]]))
//     //     .attr("r",  10)
//     //     .attr("id", d => `id${d[0]}`)
//     //     .attr('fill', d => colorScale(d[5]))
//     //     .style('opacity', '0.5')
//     //     .on('mouseover', (d) => {
//     //       const assessment = d[5];
//     //       tooltip.transition()
//     //         .duration(100)
//     //         .style('opacity', .9);
//     //       tooltip.html(`<span class="tip-name">${d[1]}<br>${d[2]}, ${d[3]} ${d[4]}</span><span class="tip-date">&nbsp;Assessment: ${d[5]}</span>`) // first last assessment
//     //         .style('left', `${d3.event.pageX - 87}px`)
//     //         // keep tooltips from overlapping with circles
//     //         .style('top', `${d3.event.pageY - (tip.clientHeight + 20)}px`);
//     //     })
//     //     .on('mouseout', () => {
//     //       tooltip.transition()
//     //       .duration(400)
//     //       .style('opacity', 0);
//     //     });
// })

const zoom = d3.zoom()
  .scaleExtent([0.5, 10])
  .on('zoom', () => d3.selectAll('g').attr('transform', d3.event.transform));

svg.call(zoom);
// d3.select(window).on("resize", resize);