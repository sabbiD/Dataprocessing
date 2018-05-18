 /*
 Data processing 2018
 Sebile Demirtas 
 10548270
 This file contains drawing the scatter plot and calling the function to update both graphs.
 Sources:
 - https://bl.ocks.org/d3noob/1ea51d03775b9650e8dfd03474e202fe (for easeBounce)
 - http://bl.ocks.org/schluppeck/b8745d4f4b98714a03a1da8e080d6a4e (for animations/transitions)
 - http://bl.ocks.org/WilliamQLiu/bd12f73d0b79d70bfbae (for animations/transitions)
 - http://alignedleft.com/tutorials/d3 (introduction to making scatterplot in d3)
 - https://jnnnnn.blogspot.nl/2017/02/distinct-colours-2.html (for color scale with more than 20 colours)
 */
window.onload = function(){

  // OECD API to load dataset
  var researchWB = "researchDataWorldBank.json";
  var patentsWB= "patentDataWorldBank.json";

  // declare empty list for coordinates 
  var research60 = [] 
  var patents60 = [] 
  var total60 = []

  // size of scatters
  var scatterSize = 5;

  d3.queue()
    .defer(d3.json, patentsWB)
    .defer(d3.json, researchWB)
    .awaitAll(old_callback)


  function old_callback(error, data){
    if (error) throw error;
      
    var patents = data[0]
    var research = data[1]

    // collect datapoints for 267 countries
    for (var i = 3; i < 267; i++){
      
      // dictionary with country name and values 
      total60.push({
        
        key: patents[i].FIELD1,
        value: [research[i].FIELD60, patents[i].FIELD60]

      })

      // list with values on x axis
      research60.push(research[i].FIELD60)

      // list with values for y axis adjusted for scale
      patents60.push((patents[i].FIELD60 / 1000))
    }


    // define dimensions
    var margin = {top: 20, right: 20, bottom: 30, left: 40},
    width = 550 - margin.left - margin.right,
    height = 400 - margin.top - margin.bottom;

    // define range x 
    var x = d3.scaleLinear()
        .range([0, width]);

    // define range y
    var y = d3.scaleLinear()
        .range([height, 0]);

    // colorscale for scatters and legend
    var color = d3.scaleOrdinal(["#5776a9", "#678007", "#fa9316", "#85c070", "#6aa2a9", 
            "#989e5d", "#fe9169", "#cd714a", "#6ed014", "#c5639c", "#c23271", "#698ffc",
            "#678275", "#c5a121", "#a978ba", "#ee534e", "#d24506", "#59c3fa", "#ca7b0a", 
            "#6f7385", "#9a634a", "#48aa6f", "#ad9ad0", "#d7908c", "#6a8a53", "#8c46fc", 
            "#8f5ab8", "#fd1105", "#7ea7cf", "#d77cd1"]);

    // define X axis with range
    var xAxis = d3.axisBottom(x)
                  .ticks(5);

    // define Y axis with range 
    var yAxis = d3.axisLeft(y)
                  .ticks(3);

    // domain for X and Y axis
    x.domain([0, d3.max(research60, function (d) { return d + 0.5; })]).nice();
    y.domain([0, d3.max(patents60, function (d) { return d + 1000; })]).nice();

    // create SVG element
    var plot = d3.select("#scatter")
      .append("svg")
      .attr("class", "scatter")
    	.attr("width", width + margin.left + margin.right)
    	.attr("height", height + margin.top + margin.bottom)
    	.append("g")
    	.attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    
    // updating scatterplot
    function quickUpdate(){

      // remove old dots
      plot.selectAll("circle")
        .remove();

      // remove old legend
      plot.selectAll(".legend")
        .remove();

      // initialise list to fill with country names in current continent
      var countryNames = []

      
      // add scatters to plot only if country is in continent
      plot.selectAll("circle")
        .data(total60)
      .enter().append("circle")
      .transition()
      .duration(1000)
      .ease(d3.easeBounce)
      .on("start", function() {
          d3.select(this) 
            })
      .attr("cx", function(d) {
          var xCoord = d.value[0]

          return x(xCoord);
      })
      .attr("cy", function(d) {
          var yCoord =  d.value[1]

          return y(yCoord);
      })
      .attr("r", function(d, i){
        
        if (d.value[0] === null || d.value[1] === null){
          return 0;
        }

        else if (countriesGeo.includes(d.key) === true){
          countryNames.push(d.key)
          return scatterSize;
        }
        
        else {
        return 0;}
        })
      .style("fill", function(d, i){
        
          if (d.value[0] === null || d.value[1] === null){
          return 0;
        }

        else if (countriesGeo.includes(d.key) === true){
          return color(d.key);
        }
        
        else {
        return 0;}
        })
        .on("end", function() {
            d3.select(this)
                .transition()
                .duration(500)
        });
    
        // list with country names in specific scatter plot
        var namesLegend = d3.scaleOrdinal(countryNames);

        // create X axis
        plot.append("g")
        	.attr("class", "x axis")
        	.attr("transform", "translate(0," + height + ")")
        	.call(xAxis);

        // create Y axis
        plot.append("g")
          .attr("class", "y axis")
          .call(yAxis);

        // add label to Y axis
        plot.append("text")
        	.attr("class", "label")
        	.attr("y", 6)
          .attr("dy", ".71em")
          .attr("transform", "rotate(-90)")
        	.style("text-anchor", "end")
        	.text("Patent applications x 1000");
        
        // add label to X axis
        plot.append("text")
        	.attr("class", "label")
          .attr("x", width)
        	.attr("y", height - 6)
          .style("text-anchor", "end")
        	.text("GERD as % of GDP");

        // call legend 
        var legend = plot.selectAll("legend")
          .data(countryNames)
        .enter().append("g")
          .attr("class", "legend")
          .attr("transform", function(d,i){ return "translate(0," + i * 12 + " )"});

        // add squares to legend
        legend.append("rect")
          .attr("x", width)
          .attr("width", 10)
          .attr("height", 10)
          .style("fill", function(d){ return color(d)});

        // add country ids to legend
        legend.append("text")
        .data(countryNames)
          .attr("class", "label")
          .attr("x", width - 10)
          .attr("y", 4)
          .attr("dy", ".35em")
          .style("text-anchor", "end")
          .text(function(d){ 
                  return namesLegend(d);
            })

        // add function to legend 
        // when clicked on squares corresponding 
        legend.on("click", function(type){
          d3.selectAll("circle")
              .style("opacity", 0.35)
              .filter(function(d){
                return d.key == type;
              })
              .style("opacity", 1)

            })
    }
      
    // draw scatter first time
    quickUpdate();

    // function to update both graphs 
    function changeBoth(){

      // get id of button to choose correct continent
      var continent = this.getAttribute('id');

      changeMap(continent);
      quickUpdate();

    } 

    // linking buttons to update correct maps
    document.getElementById("europe").onclick=changeBoth
    document.getElementById("africa").onclick=changeBoth
    document.getElementById("asia").onclick=changeBoth
    document.getElementById("southAmerica").onclick=changeBoth
    document.getElementById("northAmerica").onclick=changeBoth
  }
}