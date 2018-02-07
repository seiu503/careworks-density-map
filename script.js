const initialWidth = window.innerWidth;
let width = initialWidth;
let height = width / 2;
const tooltip = d3.select('body').append('div').attr('class', 'tooltip').attr('id', 'tip');
const tip = document.getElementById('tip');
const contactScale = d3.scaleLinear().domain([1,2,3]);

const colorScale = d3.scaleLinear().domain([1,2,3]);

const svg = d3.select('body').append('svg')
  .attr('width', width)
  .attr('height', height);

const projection = d3.geoAlbersUsa()
  .scale(1)
  .translate([0, 0]);

const path = d3.geoPath().projection(projection);

const borders = svg.append("g")
  .attr('class', 'borders');

const resize = () => {
  let width = window.innerWidth;
  let height = width / 2;
  svg.attr('width', width).attr('height', height);
  projection.scale(width / 2 / Math.PI).translate([width / 2, height / 2]);
  d3.select("g").attr("transform", `scale(${width / initialWidth})`);
  d3.selectAll("circle")
    .attr('cx', d => projection([d[6], d[7]]))
    .attr('cy', d => projection([d[6], d[7]]));
}


d3.queue()
  // .defer(d3.json, 'https://bl.ocks.org/mbostock/raw/4090846/us.json')
  .defer(d3.json, 'https://raw.githubusercontent.com/seiu503/careworks-density-map/master/OR-41-oregon-counties.json?token=AX1nvY85DaeJj9L23zPSgCOwzb2Em0nVks5ahLVSwA%3D%3D')
  .defer(d3.json, 'https://raw.githubusercontent.com/seiu503/careworks-density-map/master/cw.json?token=AX1nvY85DaeJj9L23zPSgCOwzb2Em0nVks5ahLVSwA%3D%3D')
  .await((error, json, contacts) => {
    console.log(json)

    projection
      .scale(1)
      .translate([0, 0]);

    contactScale
    .range([1, 2, 3]);

    colorScale
    .range(["#FFFF66", "#E68000", "#CC0000"]);

    svg.selectAll("path")
       .attr("id", "state_fips")
       .data(topojson.feature(json, json.objects.collection).features.filter(function(d) { return d.properties.state_fips == 41; }))
       .enter()
       .append("path")
       .attr("d", path)
       .attr("stroke","white")
       .attr("fill", "gray");

    svg.append('g')
      .selectAll('.contact')
      .data(contacts)
      .enter().append('circle')
        .attr('class', 'contact')
        .attr('cx', d => projection([d[6], d[6]]))
        .attr('cy', d => projection([d[6], d[7]]))
        .attr("r",  10)
        .attr("id", d => `id${d[0]}`)
        .attr('fill', d => colorScale(d[5]))
        .style('opacity', '0.5')
        .on('mouseover', (d) => {
          const assessment = d[5];
          tooltip.transition()
            .duration(100)
            .style('opacity', .9);
          tooltip.html(`<span class="tip-name">${d[1]}<br>${d[2]}, ${d[3]} ${d[4]}</span><span class="tip-date">&nbsp;Assessment: ${d[5]}</span>`) // first last assessment
            .style('left', `${d3.event.pageX - 87}px`)
            // keep tooltips from overlapping with circles
            .style('top', `${d3.event.pageY - (tip.clientHeight + 20)}px`);
        })
        .on('mouseout', () => {
          tooltip.transition()
          .duration(400)
          .style('opacity', 0);
        });
})

const zoom = d3.zoom()
  .scaleExtent([0.5, 10])
  .on('zoom', () => d3.selectAll('g').attr('transform', d3.event.transform));

svg.call(zoom);
d3.select(window).on("resize", resize);