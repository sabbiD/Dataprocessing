 /*
 Data processing 2018
 Sebile Demirtas 
 10548270
 Sources:
 -http://bl.ocks.org/MaciejKus/61e9ff1591355b00c1c1caf31e76a668(tooltips and zoom)
 -https://bl.ocks.org/MariellaCC/0055298b94fcf2c16940
 -https://bl.ocks.org/mbostock/3306362(chloropeth map)
 */

window.onload = function(){
	
	// OECD API to load dataset
	var gerdData = "https://stats.oecd.org/SDMX-JSON/data/MSTI_PUB/G_XGDP+TP_RS+TP_RSGRO+TP_RSXLF+TP_RSXEM+TP_TT+TP_TTGRO+TP_TTXLF+TP_TTXEM+G_FBXGDP+G_FGXGDP+TH_RS+TH_WRS+TH_WRXRS+P_PCT.AUS+AUT+BEL+CAN+CHL+CZE+DNK+EST+FIN+FRA+DEU+GRC+HUN+ISL+IRL+ISR+ITA+JPN+KOR+LVA+LUX+MEX+NLD+NZL+NOR+POL+PRT+SVK+SVN+ESP+SWE+CHE+TUR+GBR+USA+EU28+EU15+OECD+NMEC+ARG+CHN+ROU+RUS+SGP+ZAF+TWN/all?startTime=2000&endTime=2017&dimensionAtObservation=allDimensions&pid=d7b2f3d1-df85-470b-bb56-5c9c8c92ef6d"
	var betterLife = "betterLifeIndex.csv"

	d3.queue()
	  .defer(d3.request, gerdData)
	  .defer(d3.csv, betterLife)
	  .awaitAll(callback);


	// define dimensions
	var width = 400,
	height = 300 
	
	function callback(error, response) {
		if (error) throw error;

		var gerdData = JSON.parse(response[0].responseText);
		var betterLife = response[1]

		// list with countries from OECD dataset
		var countriesGerd = []

		// dictionary with country names and values for 
		// employees working very long hours
		var workBetterLife = [] 

		var oecdLength = gerdData.structure.dimensions.observation[1].values.length

		for (var i = 0; i < 38; i++){
			workBetterLife.push({
				
				key: betterLife[i].Country,
				value: betterLife[3164 + i].Value

		})}

		for (var i = 0; i < oecdLength; i++){

			countriesGerd.push(gerdData.structure.dimensions.observation[1].values[i].name)
		}

		// color scale map 
		var mapColor = d3.scaleThreshold()
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
		
		d3.json("europe.geo.json", function(json){

			// setting scales accoring to json file of continent
			projection.fitSize([width,height], json);

			// list with countries in geo.json file
			let countriesGeo = []
			for (var i = 0; i < json.features.length; i++){

				countriesGeo.push(json.features[i].properties.admin)

			}

			// add countries to map with country name as class
			svg.selectAll("path")
				.data(json.features)
				.enter()
				.append("path")
				.attr("d", path)
				.attr("class", function(d) { return d.properties.admin })
				.attr("stroke", "grey")
				.attr("fill", function(d){ return mapColor(d.properties.income_grp[0]);})
      			.on("mousemove", showTooltip)
          		.on("mouseout",  function(d,i) {
              	tooltip.classed("hidden", true);
           								})
      		})

		// changing map for continents
      	function changeMap(){

      	// clearing svg for new map
      	svg.selectAll("path")
        .remove()

        // get name of continent to update map
      	var continent = this.getAttribute('id');

		json_file = continent +".geo.json";

		d3.json(json_file, function(json){

			// setting scales according to json file of continent
			projection.fitSize([width,height], json);


			let countriesGeo = []
			for (var i = 0; i < json.features.length; i++){

				countriesGeo.push(json.features[i].properties.admin)

			}
			
			// add countries to map with country name as class
			svg.selectAll("path")
				.data(json.features)
				.enter()
				.append("path")
				.attr("d", path)
				.attr("class", function(d) { return d.properties.admin })
				.attr("stroke", "grey")
				.attr("fill", function(d){ return mapColor(d.properties.income_grp[0]);})
				.on("mousemove", showTooltip)
          		.on("mouseout",  function(d,i) {
              	tooltip.classed("hidden", true);
           								})
		
        })
	}

	// does not work yet!
	/*var zoom = d3.zoom()
	  .scaleExtent([1, 100])
	  .on('zoom', zoomFn);

	function zoomFn() {
	  d3.select('#container').select('svg').select("path")
	    .attr('transform', 'translate(' + 0 + ',' + 0 + ') scale(' + d3.event.transform.k + ')');
	}
	
	d3.select('#container').select("svg").select('path').call(zoom);*/
	
	// linking buttons to update correct maps
	document.getElementById("Europe").onclick=changeMap
	document.getElementById("Oceania").onclick=changeMap
	document.getElementById("Africa").onclick=changeMap
	document.getElementById("Asia").onclick=changeMap
	document.getElementById("South America").onclick=changeMap
	document.getElementById("North America").onclick=changeMap
	}
}
