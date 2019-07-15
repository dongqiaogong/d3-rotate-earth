import Versor from "./Versor.js";
import render from "./render.js";

async function getWorld() {
  const chart_container = d3.select("#chart-wrapper").attr('style', 'width:0; height: 0;');
  const world = await d3.json(
    "https://cdn.jsdelivr.net/npm/world-atlas@1/world/110m.json"
  );
  const data = {};
  // console.log(world);
  data.land = topojson.feature(world, world.objects.land);
  // console.log(data.land);
  data.borders = topojson.mesh(
    world,
    world.objects.countries,
    (a, b) => a !== b
  );
  data.countries = topojson.feature(world, world.objects.countries).features;
  console.log(topojson.feature(world, world.objects.countries));
  const names = new Map(
    await d3.tsv(
      "https://cdn.jsdelivr.net/npm/world-atlas@1/world/110m.tsv",
      ({ iso_n3, name_long }) => [iso_n3, name_long]
    )
  );
  console.log(names);
  data.sphere = { type: "Sphere" };
  const tilt = 0,
    svg_width = document.body.clientWidth,
    svg_height = document.body.clientHeight,
    init_diameter = svg_height / 2,
    init_margin_left = (svg_width - init_diameter) / 2,
    init_margin_top = (svg_height - init_diameter) / 2,
    ext_diameter = parseInt(
      Math.pow(Math.pow(svg_width, 2) + Math.pow(svg_height, 2), 0.5)
    ),
    ext_margin_left = (svg_width - ext_diameter) / 2,
    ext_margin_top = (svg_height - ext_diameter) / 2;
  console.log(
    svg_width,
    svg_height,
    init_diameter,
    ext_diameter,
    init_margin_left,
    init_margin_top
  );

  let name = "";

  const projection = d3
    .geoOrthographic()
    .center([105, 40])
    .fitExtent(
      [
        [init_margin_left, init_margin_top],
        [svg_width - init_margin_left, svg_height - init_margin_top]
      ],
      data.sphere
    );
  const path = d3.geoPath().projection(projection);

  const svg = d3
    .select("body")
    .append("svg")
    .attr("width", svg_width)
    .attr("height", svg_height);

  data.cities = await d3.json("/economies.json");
  data.cities.map(city => {
    city.country = data.countries.find(country => country.id == city.countryId);
  });

  let p1,
    p2 = [0, 0],
    r1,
    r2 = [0, 0, 0];
  const sizeScale_s = d3
    .scaleLinear()
    .domain([0, 1])
    .range([
      [
        [ext_margin_left, ext_margin_top],
        [svg_width - ext_margin_left, svg_height - ext_margin_top]
      ],
      [
        [init_margin_left, init_margin_top],
        [svg_width - init_margin_left, svg_height - init_margin_top]
      ]
    ]);
  const sizeRevert_b = d3
    .scaleLinear()
    .domain([0, 1])
    .range([
      [
        [init_margin_left, init_margin_top],
        [svg_width - init_margin_left, svg_height - init_margin_top]
      ],
      [
        [ext_margin_left, ext_margin_top],
        [svg_width - ext_margin_left, svg_height - ext_margin_top]
      ]
    ]);

  const boxSizeScale_b = d3
    .scaleLinear()
    .domain([0, 1])
    .range([[0, 0], [600, 260]]);

  const boxSizeScale_s = d3
    .scaleLinear()
    .domain([0, 1])
    .range([[600, 260], [0, 0]]);

  for (const city of data.cities) {
    data.city = city;
    const country = city.country;
    console.log(country);
    
    (p1 = p2), (p2 = d3.geoCentroid(country));
    // (p1 = p2), (p2 = [city.lon, city.lat]);
    (r1 = r2), (r2 = [-p2[0], tilt - p2[1], 0]);
    // const ip = d3.geoInterpolate(p1, p2);
    const iv = Versor.interpolateAngles(r1, r2);
    
    
    
    render(country, svg, data, path, projection);
    await d3
      .transition()
      .duration(1250)
      .tween("render", () => t => {
        projection.rotate(iv(t));
        render(country, svg, data, path, projection);
      })
      .transition()
      .duration(1000)
      .tween("render", () => t => {
        projection.fitExtent(sizeRevert_b(t), data.sphere);
        render(country, svg, data, path, projection);
        const boxSize = boxSizeScale_b(t);
        const boxLeft = projection(p2)[0] + 50;
        const boxTop = projection(p2)[1];
        chart_container.attr(
          "style",
          `left:${boxLeft}px; top: ${boxTop}px; width: ${
            boxSize[0]
          }px; height: ${boxSize[1]}px`
        );
        // debugger;
      })
      .transition()
      .duration(5000)
      .tween("render4", () => t => {
        render(country, svg, data, path, projection);
        // debugger;
      })
      .transition()
      .duration(1000)
      .tween("render3", () => t => {
        projection.fitExtent(sizeScale_s(t), data.sphere);
        render(country, svg, data, path, projection);
        const boxSize = boxSizeScale_s(t);
        const boxLeft = projection(p2)[0] + 50;
        const boxTop = projection(p2)[1];
        chart_container.attr(
          "style",
          `left:${boxLeft}px; top: ${boxTop}px; width: ${
            boxSize[0]
          }px; height: ${boxSize[1]}px`
        );
      })
      .end();
  }
}
getWorld();

export default getWorld;
