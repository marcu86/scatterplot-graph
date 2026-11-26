const CYCLIST_DATA_URL =
  "https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/cyclist-data.json";

const layout = {
  width: 860,
  height: 480,
  padding: 60
};

const svgCanvas = d3
  .select("#chart")
  .append("svg")
  .attr("width", layout.width)
  .attr("height", layout.height);

const hoverCard = d3
  .select("body")
  .append("div")
  .attr("id", "tooltip");

fetch(CYCLIST_DATA_URL)
  .then((res) => res.json())
  .then((riders) => {
    // Parsear tiempo "MM:SS" a objeto Date para que D3 formatee el eje Y automáticamente
    const parseMinutes = d3.timeParse("%M:%S");
    riders.forEach((rider) => {
      rider.parsedTime = parseMinutes(rider.Time);
    });

    // Escalas: años en X (con un margen de +-1 año) y tiempos en Y
    const xScale = d3
      .scaleLinear()
      .domain([
        d3.min(riders, (d) => d.Year - 1),
        d3.max(riders, (d) => d.Year + 1)
      ])
      .range([layout.padding, layout.width - layout.padding]);

    const yScale = d3
      .scaleTime()
      .domain(d3.extent(riders, (d) => d.parsedTime))
      .range([layout.padding, layout.height - layout.padding]);

    // Ejes que exige el test 
    const xAxis = d3.axisBottom(xScale).tickFormat(d3.format("d"));
    const yAxis = d3.axisLeft(yScale).tickFormat(d3.timeFormat("%M:%S"));

    svgCanvas
      .append("g")
      .attr("id", "x-axis")
      .attr("transform", `translate(0, ${layout.height - layout.padding})`)
      .call(xAxis);

    svgCanvas
      .append("g")
      .attr("id", "y-axis")
      .attr("transform", `translate(${layout.padding}, 0)`)
      .call(yAxis);

    // Puntos del gráfico de dispersión
    svgCanvas
      .selectAll(".dot")
      .data(riders)
      .enter()
      .append("circle")
      .attr("class", "dot")
      .attr("r", 6)
      .attr("cx", (d) => xScale(d.Year))
      .attr("cy", (d) => yScale(d.parsedTime))
      .attr("data-xvalue", (d) => d.Year)
      .attr("data-yvalue", (d) => d.parsedTime.toISOString())
      .style("fill", (d) => (d.Doping !== "" ? "#e53e3e" : "#38a169"))
      .on("mouseover", (event, d) => {
        hoverCard
          .style("opacity", 1)
          .style("left", `${event.pageX + 12}px`)
          .style("top", `${event.pageY - 35}px`)
          .attr("data-year", d.Year)
          .html(
            `<strong>${d.Name}</strong> (${d.Nationality})<br>` +
            `Año: ${d.Year} | Tiempo: ${d.Time}` +
            (d.Doping ? `<br><em>${d.Doping}</em>` : "<br>Sin acusaciones de dopaje")
          );
      })
      .on("mouseout", () => {
        hoverCard.style("opacity", 0);
      });

    // Leyenda obligatoria (#legend)
    const legendGroup = svgCanvas
      .append("g")
      .attr("id", "legend")
      .attr("transform", `translate(${layout.width - 230}, ${layout.padding + 10})`);

    const categories = [
      { label: "Con acusaciones de dopaje", color: "#e53e3e" },
      { label: "Sin acusaciones de dopaje", color: "#38a169" }
    ];

    categories.forEach((item, idx) => {
      const row = legendGroup
        .append("g")
        .attr("transform", `translate(0, ${idx * 24})`);

      row
        .append("rect")
        .attr("width", 14)
        .attr("height", 14)
        .attr("fill", item.color);

      row
        .append("text")
        .attr("x", 22)
        .attr("y", 12)
        .style("font-size", "12px")
        .text(item.label);
    });
  });
