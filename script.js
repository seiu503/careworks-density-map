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
  .scale(1370)
  .translate([width / 2, height / 2]);

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
    .attr('cx', d => projection([d[10], d[11]])[0])
    .attr('cy', d => projection([d[10], d[11]])[1]);
}


d3.queue()
  // .defer(d3.json, 'https://raw.githubusercontent.com/deldersveld/topojson/master/countries/us-states/OR-41-oregon-counties.json')
  .defer(d3.json, 'https://raw.githubusercontent.com/deldersveld/topojson/master/countries/united-states/us-albers-counties.json')
  .defer(d3.json, './careworks_123_geo.json')
  .await((error, json, contacts) => {

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
      .data(contact)
      .enter().append('circle')
        .attr('class', 'contact')
        .attr('cx', d => projection([d[10], d[11]])[0])
        .attr('cy', d => projection([d[10], d[11]])[1])
        .attr("r",  10)
        .attr("id", d => `id${d.id}`)
        .attr('fill', d => colorScale(d.properties.assessment))
        .style('opacity', '0.5')
        .on('mouseover', (d) => {
          const assessment = d[7];
          tooltip.transition()
            .duration(100)
            .style('opacity', .9);
          tooltip.html(`<span class="tip-name">${d[0]} ${d[1]} </span><span class="tip-date">&nbsp;(${d[7]})</span>`) // first last assessment
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