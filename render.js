export default function render(country, svg, data, path, projection) {
  console.log(projection.scale());
  svg.selectAll("*").remove();
  const sphere_g = svg.append("g").attr("class", "sphere");
  sphere_g
    .insert("path")
    .datum(data.sphere)
    .attr("d", path)
    .attr("fill", "#3892dc");

  const borders_g = svg.append("g").attr("class", "borders");
  borders_g
    .insert("path")
    .datum(data.borders)
    .attr("d", path)
    .attr("stroke", "#fff")
    .attr("stroke-width", 1.5)
    .attr("fill", "none");

  const land_g = svg.append("g").attr("class", "land");
  land_g
    .insert("path")
    .datum(data.land)
    .attr("d", path)
    // .attr("stroke", "#000")
    .attr(
      "style",
      "box-shadow: 0 40px 80px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)"
    )
    .attr("fill", "#1fad49");

  const bg_def = svg.append("defs");
  const pattern = bg_def
    .append("pattern")
    .attr("id", "bg_img")
    .attr("patternUnits", "userSpaceOnUse")
    .attr("width", data.city.width)
    .attr("height", data.city.height);
  pattern
    .append("image")
    .attr("xlink:href", `img/${data.city.logoName}-bg.png`)
    .attr("x", 0)
    .attr("y", 0)
    .attr("width", data.city.width)
    .attr("height", data.city.height);

  const country_g = svg.append("g").attr("class", "country");
  country_g
    .insert("path")
    .datum(country)
    .attr("d", path)
    .attr("fill", "#fff")
    .attr("opacity", "0.5")
    .attr("stroke", data.city.stroke)
    .clone()
    .attr("fill", "url(#bg_img)")
    .attr("opacity", "0.2")
    .attr("stroke", data.city.stroke);

  const city_g = svg.append("g").attr("class", "city");

  const p2 = d3.geoCentroid(country);
  city_g
    .insert("svg:image")
    .datum(data.city)
    .attr("class", "logo")
    .attr("width", d => `80px`)
    .attr("x", (d, i) => {
      return projection(p2)[0] - 22.5;
    })
    .attr("y", (d, i) => {
      return projection(p2)[1] - 65;
    })
    .attr("xlink:href", (d, i) => `img/pin.png`);

  city_g
    .insert("text")
    .datum(data.city)
    .text(d => d.countryName)
    .attr("class", "city-name")
    .attr("fill", "#222")
    .attr('font-weight', 'bold')
    .attr('font-family', "Avenir,-apple-system,BlinkMacSystemFont,'Segoe UI','PingFang SC','Hiragino Sans GB','Microsoft YaHei','Helvetica Neue',Helvetica,Arial,sans-serif,'Apple Color Emoji','Segoe UI Emoji','Segoe UI Symbol',sans-serif")
    .attr("text-anchor", "middle")
    .attr("x", (d, i) => {
      return projection(p2)[0];
    })
    .attr("y", (d, i) => {
      return projection(p2)[1] + 20;
    });
}
