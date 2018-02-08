let width = window.innerWidth;
let height = window.innerHeight;
const contactScale = d3.scaleLinear().domain([1,2,3]);
const colorScale = d3.scaleLinear().domain([1,2,3]);
const opacityScale = d3.scaleLinear().domain([1,2,3]);

var projection = d3.geoCylindricalEqualArea().parallel([45]);

var path = d3.geoPath()
    .projection(projection);

var svg = d3.select("body").append("svg")
    .attr("width", width)
    .attr("height", height)
    .attr("class", "map");

d3.queue()
  .defer(d3.json, 'https://raw.githubusercontent.com/seiu503/careworks-density-map/master/oregon-counties.json?token=AX1nvcyQFzmMOxqYxLDsRngZNFVFt0fiks5ahdiIwA%3D%3D')
  .defer(d3.json, 'https://raw.githubusercontent.com/seiu503/careworks-density-map/master/cw.json?token=AX1nvY85DaeJj9L23zPSgCOwzb2Em0nVks5ahLVSwA%3D%3D')
  .await((error, or, contacts) => {

  if (error) console.log(error);

  var counties = topojson.feature(or, or.objects.cb_2015_oregon_county_20m);

  projection.scale(1)
    .translate([0, 0]);

  var b = path.bounds(counties),
    s = .95 / Math.max((b[1][0] - b[0][0]) / width, (b[1][1] - b[0][1]) / height),
    t = [(width - s * (b[1][0] + b[0][0])) / 2, (height - s * (b[1][1] + b[0][1])) / 2];

  projection.scale(s)
    .translate(t);

  svg.append("g")
    .attr("class", "counties")
    .selectAll("path")
    .data(topojson.feature(or, or.objects.cb_2015_oregon_county_20m).features)
    .enter().append("path")
    .attr("d", path);

  contactScale
    .range([1, 2, 3]);

  colorScale
    .range(["#ff0000", "#ff8000", "#ffff00"]);
  opacityScale
    .range([1, .6, .3]);

  svg.append('g')
    .selectAll('.contact')
    .data(contacts)
    .enter().append('circle')
      .attr('class', 'contact')
      .attr('cx', d => projection([d[7], d[6]])[0])
      .attr('cy', d => projection([d[7], d[6]])[1])
      .attr("r",  10)
      .attr("id", d => `id${d[0]}`)
      .attr("class", (d) => `circle circle-${d[5]}`)
      .attr('fill', d => colorScale(d[5]))
      .style('opacity', d => opacityScale(d[5]));

  const legendRectSize = 18;
  const legendSpacing = 8;

  const legend = svg.selectAll('.legend')
    .data(colorScale.domain())
    .enter()
    .append('g')
    .attr('class', 'legend')
    .attr('id', (d) => d)
    .attr('transform', function(d, i) {
      var h = legendRectSize + legendSpacing;
      var offset =  h * colorScale.domain().length / 2;
      let horz = 30 + (i * width / 6);
      return 'translate(' + horz + ',' + h + ')';
    })
    .on('click', (d) => {
      const allCircles = Array.from(document.getElementsByClassName('circle'));
      const otherAssessments = allCircles.filter(el => !el.classList.contains(`circle-${d}`));
      console.log(`${d}: otherAssessments`);
      console.log(otherAssessments);
      const assessmentMatches = Array.from(document.getElementsByClassName(`circle-${d}`));
      console.log(`${d}: assessmentMatches`);
      console.log(assessmentMatches);
      otherAssessments.forEach((el) => {
        el.classList.remove('visible');
        el.classList.add('hidden');
      });
      assessmentMatches.forEach((el) => {
        el.classList.remove('hidden');
        el.classList.add('visible');
      });
      document.getElementById('btn').classList.add('btn-show');
      document.getElementById('btn').classList.remove('btn-hide');
    });

legend.append('circle')
  .attr('r', legendRectSize / 2)
  .style('fill', colorScale)
  .style('stroke', colorScale);

legend.append('text')
  .attr('x', legendRectSize )
  .attr('y', legendRectSize - (legendSpacing * 1.5))
  .text(function(d) { return d; });

const showAll = () => {
  const allCircles = Array.from(document.getElementsByClassName('circle'));
  allCircles.forEach((el) => {
    el.classList.remove('hidden');
    el.classList.add('visible');
  });
  document.getElementById('btn').classList.add('btn-hide');
  document.getElementById('btn').classList.remove('btn-show');
  document.getElementById('button-wrap').classList.add('btn-hide');
  document.getElementById('button-wrap').classList.remove('btn-show');
}

document.getElementById('btn').addEventListener("click", showAll);

});

const zoom = d3.zoom()
  .scaleExtent([0.5, 20])
  .on('zoom', () => {
    d3.selectAll('g').attr("transform", d3.event.transform);
    d3.selectAll("circle")
      .attr("r", (10 / d3.event.transform.k));
  });

d3.select("body").call(zoom);