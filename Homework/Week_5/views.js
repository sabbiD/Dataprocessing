 /*
 Data processing 2018
 Sebile Demirtas 
 10548270
 Sources:
 -http://bl.ocks.org/MaciejKus/61e9ff1591355b00c1c1caf31e76a668(tooltips and zoom)
 -https://bl.ocks.org/MariellaCC/0055298b94fcf2c16940
 -https://bl.ocks.org/mbostock/3306362(chloropeth map)
 */

//window.onload = function(){
	
	// find datasets
	var countriesGeo = []//new Set();
	var africa = "Africa.json"
	var asia = "Asia.json"
	var southAmerica = "SouthAmerica.json"
	var northAmerica = "NorthAmerica.json"
	var europe = "Europe.json"
	var oceania = "Oceania.json"
	var world = "World.json"
	var changeMap;

	d3.queue()
	  .defer(d3.request, southAmerica)
	  .defer(d3.request, northAmerica)
	  .defer(d3.request, africa)
	  .defer(d3.request, europe)
	  .defer(d3.request, asia)
	  .defer(d3.request, oceania)
	  .defer(d3.request, world)
	  .awaitAll(callback);


	// define dimensions
	var width = 400
	var height = 300 
	
	function callback(error, response) {
		if (error) throw error;

			// define dimensions
	var width = 400
	var height = 300

		var southAmerica = JSON.parse(response[0].responseText)
		var northAmerica = JSON.parse(response[1].responseText)
		var africa = JSON.parse(response[2].responseText)
		var europe = JSON.parse(response[3].responseText)
		var asia = JSON.parse(response[4].responseText)
		var oceania = JSON.parse(response[5].responseText)
		var world = JSON.parse(response[6].responseText)

		// dict with json files as values to use in update function
		var continents = []

		continents["asia"] = asia
		continents["africa"] = africa
		continents["southAmerica"] = southAmerica
		continents["northAmerica"] = northAmerica
		continents["europe"] = europe
		continents["oceania"] = oceania
		continents["world"] = world

		// color scale map 
		var legendColor = d3.scaleOrdinal()
		.domain(["High", "High (non-OECD)", "Upper Middle", "Lower Middle", "Low"])
		.range(["#f0f9e8" ,"#bae4bc" ,"#7bccc4", "#43a2ca", "#0868ac"].reverse())

		// color scale map 
		var mapColor = d3.scaleOrdinal()
		.domain([1, 2, 3, 4, 5])
		.range(["#f0f9e8" ,"#bae4bc" ,"#7bccc4", "#43a2ca", "#0868ac"].reverse())

		// initialize placing for tooltips
		var offsetL = document.getElementById('container').offsetLeft+10;
		var offsetT = document.getElementById('container').offsetTop+10;

		// initialize tooltips
		var tooltip = d3.select("#container")
			.append("div")
			.attr("class", "tooltip hidden")

		// define map projection
		var projection = d3.geoMercator()

		var path = d3.geoPath()
					.projection(projection)

		var svg = d3.select("#container")
				.append("svg")
				.attr("width", width)
				.attr("height", height);
  		
  		var ordinal = d3.scaleOrdinal()
		  .domain(["1", "2", "3", "4", "5"])
		  .range(["#f0f9e8" ,"#bae4bc" ,"#7bccc4", "#43a2ca", "#0868ac"]); 

		var svg = d3.select("svg");

		svg.append("g")
		  .attr("class", "legendOrdinal")
		  .attr("transform", "translate(20,250)");

		var legendOrdinal = d3.legendColor()
		  .shapeWidth(30)
		  .orient('horizontal')
		  .scale(ordinal);

		svg.select(".legendOrdinal")
		  .call(legendOrdinal);


		// tooltips with info on map
		function showTooltip(d) {

		  // info for tooltips
	      label = d.properties.name;
	      gdp = d.properties.gdp_md_est;
	      income_grp = d.properties.income_grp;
	      
	      var mouse = d3.mouse(svg.node())
	        .map( function(d) { return parseInt(d); } );
	      	 tooltip.classed("hidden", false)
	        .attr("style", "left:"+(mouse[0]+offsetL)+"px;top:"+(mouse[1]+offsetT)+"px")
	        .html(label + "</br>" + income_grp)
			}
		

		// setting scales accoring to json file of continent
		projection.fitSize([width, height], europe);

		// list with countries in geo.json file
		for (var i = 0; i < europe.features.length; i++){

			countriesGeo.push(europe.features[i].properties.admin)

		}

		// add countries to map with country name as class
		svg.selectAll("path")
			.data(europe.features)
			.enter()
			.append("path")
			.attr("d", path)
			.attr("id", function(d) { return d.properties.admin })
			.attr("stroke", "grey")
			.attr("fill", function(d){ return mapColor(d.properties.income_grp[0]);})
  			.on("mousemove", showTooltip)
      		.on("mouseout",  function(d,i) {
          	tooltip.classed("hidden", true);
       								})
  		

		// changing map for continents
      	function changeMapz(continent){

      	// clearing svg for new map
      	svg.selectAll("path")
        .remove()

        // color scale map 
		var mapColor = d3.scaleOrdinal()
		.domain([1, 2, 3, 4, 5])
		.range(["#f0f9e8" ,"#bae4bc" ,"#7bccc4", "#43a2ca", "#0868ac"].reverse())

        // get name of continent to update map
      	var json = continents[continent]
		
		// setting scales according to json file of continent
		projection.fitSize([width,height], json);
		
		// empty list with countries for new continent
		countriesGeo = []
			
			for (var i = 0; i < json.features.length; i++){

				countriesGeo.push(json.features[i].properties.admin)

			}
			
		// add countries to map with country name as class
		svg.selectAll("path")
			.data(json.features)
			.enter()
			.append("path")
			.attr("d", path)
			.attr("id", function(d) { return d.properties.admin })
			.attr("class", "country")
			.attr("stroke", "grey")
			.attr("fill", function(d){ return mapColor(d.properties.income_grp[0]);})
  			.on("mousemove", showTooltip)
      		.on("mouseout",  function(d,i) {
          	tooltip.classed("hidden", true);
           								})
      		.on("click", function(type){
      			d3.selectAll("circle")
          		.style("opacity", 0.35)
          		.filter(function(d){
          			console.log(d.key, type.properties.admin)
            	return d.key == type.properties.admin;
          		})
          		.style("opacity", 1)
          	})

	}

  // making function global to be able to call later
  changeMap = changeMapz;
}




