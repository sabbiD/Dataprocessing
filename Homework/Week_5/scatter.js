 /*
 Data processing 2018
 Sebile Demirtas 
 10548270
 Sources:
 - https://bl.ocks.org/d3noob/1ea51d03775b9650e8dfd03474e202fe (for easeBounce)
 - http://bl.ocks.org/schluppeck/b8745d4f4b98714a03a1da8e080d6a4e (for animations/transitions)
 - http://bl.ocks.org/WilliamQLiu/bd12f73d0b79d70bfbae (for animations/transitions)
 - http://alignedleft.com/tutorials/d3 (introduction to making scatterplot in d3)
 */

//window.onload = function(){
  
  // OECD API to load dataset
  var researchWB = "researchDataWorldBank.json"
  var patentsWB= "patentDataWorldBank.json"
  
  // declare empty list for coordinates 
  var research60 = [] //G_XGDP GERD as a percentage of GDP
  var patents60 = [] //P_PCT
  var total60 = []

  // declare empty list for country Ids
  var countryNames = []

  // size of scatters
  var scatterSize = 5;

  d3.queue()
    .defer(d3.json, patentsWB)
    .defer(d3.json, researchWB)
    .awaitAll(old_callback)


  function old_callback(error, data){
    
    var patents = data[0]
    var research = data[1]

    // check if data loads correctly
    if (data.lenght == 0){
      throw error;
    } 
    
    // collect datapoints for 267 countries
    for (var i = 3; i < 267; i++){
      

      total60.push({
        
        key: patents[i].FIELD1,
        value: [patents[i].FIELD60 , research[i].FIELD60]

      })

      research60.push(research[i].FIELD60)
      patents60.push(patents[i].FIELD60)

    }


    // define dimensions
    var margin = {top: 20, right: 20, bottom: 30, left: 40},
    width = 500 - margin.left - margin.right,
    height = 400 - margin.top - margin.bottom;

    // define range x 
    var x = d3.scaleLinear()
        .range([0, width]);

    // define range y
    var y = d3.scaleLinear()
        .range([height, 0]);

    // colorscale for scatters and legend
    var color = d3.scaleOrdinal(d3.schemeCategory20);

    // define X axis with range
    var xAxis = d3.axisBottom(x);

    // define Y axis with range 
    var yAxis = d3.axisLeft(y);

    // domain for X and Y axis
    x.domain(d3.extent(research60, function(d) { return d; })).nice();
    y.domain(d3.extent(patents60, function(d) { return d/1000; })).nice();

    // create SVG element
    var plot = d3.select("#scatter")
      .append("svg")
      .attr("class", "scatter")
    	.attr("width", width + margin.left + margin.right)
    	.attr("height", height + margin.top + margin.bottom)
    	.append("g")
    	.attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    
    
    function quickUpdate(){

    plot.selectAll("circle")
      .remove()

    plot.selectAll(".legend")
    .remove()

    countryNames = []

    // add scatters to plot only if country is in continent
    plot.selectAll("circle")
      .data(total60)
    .enter().append("circle")
      .attr("cx", function(d) {
          var xCoord = d.value[1]

          return x(xCoord);
      })
      .attr("cy", function(d) {
          var yCoord =  d.value[0]

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
        return 0;
        }
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
    
    var namesLegend = d3.scaleOrdinal(countryNames)

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
      .attr("transform", function(d,i){ return "translate(0," + i * 10 + " )"})

    // add squares to legend
    legend.append("rect")
      .attr("x", width)
      .attr("width", 9)
      .attr("height", 9)
      .style("fill", function(d){ return color(d)})

    // add country ids to legend
    legend.append("text")
    .data(countryNames)
      .attr("class", "label")
      .attr("x", width - 6)
      .attr("y", 1)
      .attr("dy", ".35em")
      .style("text-anchor", "end")
      .text(function(d){ 
        return namesLegend(d);
        })

    // add function to legend 
    // when clicked on squares corresponding 
    // scatter gets bigger
    legend.on("click", function(type){
      d3.selectAll("circle")
          .style("opacity", 0.35)
          .filter(function(d){
            return d.key == type;
          })
          .style("opacity", 1)
          .attr("r", r * 2)

        })
}
    
    // draw scatter first time
    quickUpdate();

    // function to update both graphs 
    function changeBoth(){

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
      document.getElementById("world").onclick=changeBoth

  }

  

  
//};
