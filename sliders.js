//Slider using Brush
//Modified from http://bl.ocks.org/mbostock/6452972
var width = 500,
    height = 100;
	
var xSliderScale = d3.scale.linear()
	.domain([0, 100])
	.range([25, 475])
	.clamp(true);
	
function singleSlider(loc){	
	var brush = d3.svg.brush()
		.x(xSliderScale)
		.extent([loc, loc])
		.on("brush", brushed);

	var sliderSvg = d3.select("body").append("svg")
		.attr("width", width)
		.attr("height", height)
		.attr("class", "sliderSVG slider")
		.on("dblclick",function(d){doubleSlider(brush.extent()[0]);this.remove(); drawOverlap();});

	sliderSvg.append("g")
		.attr("class", "x axis slider")
		.attr("transform", "translate(0," + (height-15) + ")")
		.attr("y",height)
		.call(d3.svg.axis()
		  .scale(xSliderScale)
		  .orient("bottom")
		  .tickFormat(function(d) { return d + "%"; })
		  .tickSize(-height +20)
		  .tickPadding(8))
	  .select(".domain")
	  .select(function() { return this.parentNode.appendChild(this.cloneNode(true)); })
		.attr("class", "halo");

	var brushg = sliderSvg.append("g")
		.attr("class", "brush slider")
		.call(brush);
		
	var handle = brushg.append("rect")
		.attr("class", "handle")
		.attr("transform", "translate(-2.5,0)")
		.attr("x",xSliderScale(loc))
		.attr("y", 5)
		.attr("width", 5)
		.attr("height",78)
		.attr("stroke","black")
		.attr("fill","transparent");

	brushg.selectAll("rect")
		.attr("height", height-20);	
		
	brushg.selectAll(".extent,.resize")
		.remove();	
	function brushed() {
		var value = brush.extent()[0];
		//console.log(d3.event.sourceEvent);
		if (d3.event.sourceEvent) { // not a programmatic event
			value = xSliderScale.invert(d3.mouse(this)[0]);
			brush.extent([value, value]);
		}
		handle.attr("x", xSliderScale(value));
		drawInTime(value,value);
	}	
};
//End single slider

//Double slider
function doubleSlider(loc){
	var brush = d3.svg.brush()
		.x(xSliderScale)
		.extent([loc, loc+10])
		.on("brushend", brushend);

	var arc = d3.svg.arc()
		.outerRadius(height / 2 - 10)
		.startAngle(0)
		.endAngle(function(d, i) { return i ? -Math.PI : Math.PI; });
		
	var sliderSvg = d3.select("body").append("svg")
		.attr("width", width)
		.attr("height", height)
		.attr("class", "sliderSVG slider")
		.on("dblclick",function(d){singleSlider(brush.extent()[0]);this.remove(); drawOverlap();});

	sliderSvg.append("g")
		.attr("class", "x axis")
		.attr("transform", "translate(0," + (height-15) + ")")
		.attr("y",height)
		.call(d3.svg.axis()
		  .scale(xSliderScale)
		  .orient("bottom")
		  .tickFormat(function(d) { return d + "%"; })
		  .tickSize(-height +20)
		  .tickPadding(8))
	  .select(".domain")
	  .select(function() { return this.parentNode.appendChild(this.cloneNode(true)); })
		.attr("class", "halo");


	var brushg = sliderSvg.append("g")
		.attr("class", "brush slider")
		.call(brush);

	brushg.selectAll(".resize").append("path")
		.attr("transform", "translate(0," +  (height / 2-10) + ")")
		.attr("d", arc);

	brushg.selectAll("rect")
		.attr("height", height-20);


	function brushend() {
		var s = brush.extent();
		//console.log(s);
		drawInTime(s[0],s[1]);
	};
};