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
  var gerdData = "https://stats.oecd.org/SDMX-JSON/data/MSTI_PUB/G_XGDP+TP_RS+TP_RSGRO+TP_RSXLF+TP_RSXEM+TP_TT+TP_TTGRO+TP_TTXLF+TP_TTXEM+G_FBXGDP+G_FGXGDP+TH_RS+TH_WRS+TH_WRXRS+P_PCT.AUT+BEL+FIN+FRA+DEU+IRL+LUX+NLD+NOR/all?startTime=2014&endTime=2015&dimensionAtObservation=allDimensions&pid=d7b2f3d1-df85-470b-bb56-5c9c8c92ef6d"

/*  var gerdData = "https://stats.oecd.org/SDMX-JSON/data/MSTI_PUB/G_XGDP+TP_RS+TP_RSGRO+TP_RSXLF+TP_RSXEM+TP_TT+TP_TTGRO+TP_TTXLF+TP_TTXEM+G_FBXGDP+G_FGXGDP+TH_RS+TH_WRS+TH_WRXRS+P_PCT.AUS+AUT+BEL+CAN+CHL+CZE+FIN+FRA+DEU+GRC+HUN+ISL+IRL+ISR+ITA+JPN+KOR+LVA+LUX+MEX+NLD+NZL+NOR+POL+PRT+SVK+SVN+ESP+SWE+CHE+TUR+GBR+USA+EU28+EU15+OECD+NMEC+ARG+CHN+ROU+RUS+SGP+ZAF+TWN/all?startTime=2000&endTime=2017&dimensionAtObservation=allDimensions&pid=d7b2f3d1-df85-470b-bb56-5c9c8c92ef6d"
*/
  // declare empty list for coordinates 
  var gdpPercentage14 = [] //G_XGDP GERD as a percentage of GDP
  var patents14 = [] //P_PCT
  var total14 = []
  var total15 = []

  // declare empty list for country Ids
  var countryNames = []

  // size of scatters
  var scatterSize = 5;

  function old_callback(data){

    // check if data loads correctly
    if (data.lenght == 0){
      throw error;
    } 
    

    // collect datapoints for 9 countries
    for (var i = 0; i < 9 ; i++){
    
    	gdpPercentage14.push(data.dataSets["0"]
                          .observations["0:"+i+":0"][0])
      
    	patents14.push(data.dataSets["0"]
                    .observations["14:"+i+":0"][0])
    	
      total14.push([data.dataSets["0"].observations["14:"+i+":0"][0],
                    data.dataSets["0"].observations["0:"+i+":0"][0]])

    	total15.push([data.dataSets["0"].observations["14:"+i+":1"][0], 
                    data.dataSets["0"].observations["0:"+i+":1"][0]])

      countryNames.push(data.structure.dimensions
                      .observation[1].values[i].id)

    }

    // list for countries to append to legend 
    var countries = d3.scaleOrdinal(countryNames)

    // define dimensions
    var margin = {top: 20, right: 20, bottom: 30, left: 40},
    width = 400 - margin.left - margin.right,
    height = 300 - margin.top - margin.bottom;

    // define range x 
    var x = d3.scaleLinear()
        .range([0, width]);

    // define range y
    var y = d3.scaleLinear()
        .range([height, 0]);

    // colorscale for scatters and legend
    var color = d3.scaleOrdinal(d3.schemeCategory10);

    // define X axis with range
    var xAxis = d3.axisBottom(x);

    // define Y axis with range 
    var yAxis = d3.axisLeft(y);

    // domain for X and Y axis
    x.domain(d3.extent(gdpPercentage14, function(d) { return d; })).nice();
    y.domain(d3.extent(patents14, function(d) { return d; })).nice();

    // create SVG element
    var svg = d3.select("#scatter")
      .append("svg")
    	.attr("width", width + margin.left + margin.right)
    	.attr("height", height + margin.top + margin.bottom)
    	.append("g")
    	.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // creating points for 2014
    svg.selectAll("circle")
      .data(total14)
    .enter().append("circle")
      .attr("cx", function(d) {
          return x(d[1]);
      })
      .attr("cy", function(d) {
          return y(d[0]);
      })
      .attr("r", scatterSize)
      .style("fill", function(d){ return color(d[0]); });
    	
    // create X axis
    svg.append("g")
    	.attr("class", "x axis")
    	.attr("transform", "translate(0," + height + ")")
    	.call(xAxis);

    // create Y axis
    svg.append("g")
      .attr("class", "y axis")
      .call(yAxis);

    // add label to Y axis
    svg.append("text")
    	.attr("class", "label")
    	.attr("y", 6)
      .attr("dy", ".71em")
      .attr("transform", "rotate(-90)")
    	.style("text-anchor", "end")
    	.text("Patent applications");
    
    // add label to X axis
    svg.append("text")
    	.attr("class", "label")
      .attr("x", width)
    	.attr("y", height - 6)
      .style("text-anchor", "end")
    	.text("GERD as % of GDP");

    // call legend 
    var legend = svg.selectAll("legend")
      .data(total14)
    .enter().append("g")
      .attr("class", "legend")
      .attr("transform", function(d,i){ return "translate(0," + i * 20 + " )"})

    // add squares to legend
    legend.append("rect")
      .attr("x", width)
      .attr("width", 18)
      .attr("height", 18)
      .style("fill", function(d){ return color(d[0]);} )

    // add country ids to legend
    legend.append("text")
      .attr("class", "label")
      .attr("x", width - 6)
      .attr("y", 9)
      .attr("dy", ".35em")
      .style("text-anchor", "end")
      .text(countries, function(d){ return countries(d); })

    // add function to legend 
    // when clicked on squares corresponding 
    // scatter gets bigger
    legend.on("click", function(type){
      d3.selectAll("circle")
          .style("opacity", 0.35)
          .attr("r", scatterSize)
          .filter(function(d){
            return d == type;
          })
          .style("opacity", 1)
          .attr("r", scatterSize * 2)

        })

    // calling 2014 data
    function scatter(){

      // changing back to old domains 
      x.domain(d3.extent(gdpPercentage14, function(d) { return d; })).nice();
      y.domain(d3.extent(patents14, function(d) { return d; })).nice();

      // creating points for 2014
      svg.selectAll("circle")
        .data(total14)
        .transition()
        .duration(1000)
        .ease(d3.easeBounce)
        .on("start", function() {
            d3.select(this)
                .attr("r", scatterSize * 2)
                .style("opacity", 1)
              })
        .attr("cx", function(d) {
            return x(d[1]);
        })
        .attr("cy", function(d) {
            return y(d[0]);
        })
        .on("end", function() {
            d3.select(this)
                .transition()
                .duration(500)
                .attr("r", scatterSize)
        });

      // legend with attributes as mentioned above
      legend.on("click", function(type){
          d3.selectAll("circle")
            .style("opacity", 0.35)
            .attr("r", scatterSize)
            .filter(function(d){
              return d == type;
            })
            .style("opacity", 1)
            .attr("r", scatterSize * 2);
        })
    }

    // calling 2015 data
    function update(){

      // updating scales for new data
      var xNew = d3.scaleLinear()
      .range([0, width]);

      var yNew = d3.scaleLinear()
      .range([height, 0]);

      // updating dowmains for new data
      xNew.domain(d3.extent(total15, function(d) { 
          return d[1]; 
      })).nice();

      yNew.domain(d3.extent(total15, function(d) { 
          return d[0]; 
      })).nice();
      
      // creating points for 2015
      svg.selectAll("circle")
        .data(total15)
        .transition()
        .duration(1000)
        .ease(d3.easeBounce)
        .on("start", function() {
            d3.select(this) 
                .attr("r", scatterSize * 2)  
                .style("opacity", 1)
              })
        .attr("cx", function(d) {
            return xNew(d[1]);
        })
        .attr("cy", function(d) {
            return yNew(d[0]);
        })
        .on("end", function() {
            d3.select(this)
                .transition()
                .duration(500)
                .attr("r", scatterSize)
        });

      // legend with attributes as mentioned above
      legend.on("click", function(type){
        d3.selectAll("circle")
          .data(total14)
          .style("opacity", 0.35)
          .attr("r", scatterSize)
          .filter(function(d){
            return d == type;
          })
          .style("opacity", 1)
          .attr("r", scatterSize * 2);
      });
    }

    // call 2014 data when 2014 button is clicked
    document.getElementById("2014").onclick=scatter;

    // call 2015 data when 2015 button is clicked
    document.getElementById("2015").onclick=update;

  }

  // get data from OECD-API
  d3.request(gerdData)
  .get(function(xhr) {old_callback(JSON.parse(xhr.responseText))});
//};
