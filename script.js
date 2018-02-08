const initialWidth = window.innerWidth;
let width = initialWidth;
let height = width / 1.4;
const tooltip = d3.select('body').append('div').attr('class', 'tooltip').attr('id', 'tip');
const tip = document.getElementById('tip');
const contactScale = d3.scaleLinear().domain([1,2,3]);
const colorScale = d3.scaleLinear().domain([1,2,3]);


  var projection = d3.geoAlbers();

  var path = d3.geoPath()
      .projection(projection);

  var svg = d3.select("body").append("svg")
      .attr("width", width)
      .attr("height", height)
      .attr("class", "map");

  d3.queue()
    .defer(d3.json, 'https://raw.githubusercontent.com/seiu503/careworks-density-map/9cecda9bd8677c2a9fab1a38cb4b397cca074bfe/jsoncounties-OR.min.js?token=AX1nvdjg-LYt62aZtxafLSC3aUPge284ks5ahdL7wA%3D%3D')
    .defer(d3.json, 'https://raw.githubusercontent.com/seiu503/careworks-density-map/master/us.json?token=AX1nvaGCOcfTt-j9YBYKBop1VoQl94w2ks5ahNdbwA%3D%3D')
    .defer(d3.json, 'https://raw.githubusercontent.com/seiu503/careworks-density-map/master/cw.json?token=AX1nvY85DaeJj9L23zPSgCOwzb2Em0nVks5ahLVSwA%3D%3D')
    .await((error, or, us, contacts) => {

    if (error) console.log(error);

    console.log(or.features);
    console.log(us.objects.states);

    // var states = topojson.feature(us, us.objects.states),
    //     state = states.features.filter(function(d) { return d.id === 41; })[0];

    var counties = topojson.feature(or, or.features);

    // projection.scale(1)
    //   .translate([0, 0]);

    // var b = path.bounds(state),
    //   s = .95 / Math.max((b[1][0] - b[0][0]) / width, (b[1][1] - b[0][1]) / height),
    //   t = [(width - s * (b[1][0] + b[0][0])) / 2, (height - s * (b[1][1] + b[0][1])) / 2];

    // projection.scale(s)
    //   .translate(t);

    svg.append("g")
      .attr("class", "counties")
      .selectAll("path")
      .data(topojson.feature(or, or.features).features)
      .enter().append("path")
      .attr("d", path);

  svg.append("path")
      .attr("class", "county-borders")
      .attr("d", path(topojson.mesh(
        or, or.features.counties,
        (a, b) => a !== b
        )
      ));


    // svg.append("path")
    //     .datum(topojson.mesh(or, or.features.counties, function(a, b) { return a !== b; }))
    //     .attr("class", "mesh")
    //     .attr("d", path);


    // svg.append("path")
    //     .data(counties)
    //     .attr("class", "outline")
    //     .attr("d", path)
    //     .attr('id', 'land');


     // svg.append("clipPath")
     //    .attr("id", "clip-land")
     //    .append("use")
     //    .attr("xlink:href", "#land");
        // .attr("transform", transform(d3.zoomIdentity));

    // svg.selectAll("path")
    //     .data(topojson.feature(or, or.features.counties).features)
    //     .enter().append("path")
    //     .attr("d", path)
    //     .attr('county-id', function(d){
    //        return d.id
    //     }).attr("clip-path", "url(#clip-land)")
    //     .attr('class', 'county');
        // .attr("transform", transform(d3.zoomIdentity));

    contactScale
      .range([1, 2, 3]);

    colorScale
      .range(["#CC0000", "#E68000", "#FFFF66"]);

    svg.append('g')
      .selectAll('.contact')
      .data(contacts)
      .enter().append('circle')
        .attr('class', 'contact')
        .attr('cx', d => projection([d[7], d[6]])[0])
        .attr('cy', d => projection([d[7], d[6]])[1])
        .attr("r",  10)
        .attr("id", d => `id${d[0]}`)
        .attr('fill', d => colorScale(d[5]))
        .style('opacity', '0.5')
        .attr("transform", d3.zoomIdentity)
        .on('mouseover', (d) => {
          tooltip.transition()
            .duration(100)
            .style('opacity', .9);
          tooltip.html(`<span class="tip-name">${d[5]}</span>`) // assessment
            .style('left', `${d3.event.pageX}px`)
            .style('zIndex', 3)
            // keep tooltips from overlapping with circles
            .style('top', `${d3.event.pageY + 20}px`);
        })
        .on('mouseout', () => {
          tooltip.transition()
          .duration(400)
          .style('opacity', 0);
        });
        ;

});

// const transform = (t) => {
//   return (d) => {
//     return "translate(" + t.apply(d) + ")";
//   };
// }

const zoom = d3.zoom()
  .scaleExtent([0.5, 10])
  .on('zoom', () => {
    svg.attr("transform", d3.event.transform);
    d3.selectAll('g').attr("transform", d3.event.transform);
    d3.selectAll('path').attr("transform", d3.event.transform);
    d3.selectAll('clipPath').attr("transform", d3.event.transform);
  });

d3.select("body").call(zoom);