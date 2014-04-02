//Slider using Brush
//Modified from http://bl.ocks.org/mbostock/6452972
var width = 500,
    height = 100;
	
var x = d3.scale.linear()
	.domain([0, 100])
	.range([25, 475])
	.clamp(true);
	
function singleSlider(loc){	
	var brush = d3.svg.brush()
		.x(x)
		.extent([loc, loc])
		.on("brush", brushed);

	var sliderSvg = d3.select("body").append("svg")
		.attr("width", width)
		.attr("height", height)
		.attr("class", "sliderSVG")	
		.on("dblclick",function(d){ doubleSlider(brush.extent()[0]);this.remove();});

	sliderSvg.append("g")
		.attr("class", "x axis")
		.attr("transform", "translate(0," + height / 2 + ")")
		.call(d3.svg.axis()
		  .scale(x)
		  .orient("bottom")
		  .tickFormat(function(d) { return d + "%"; })
		  .tickSize(0)
		  .tickPadding(12))
	  .select(".domain")
	  .select(function() { return this.parentNode.appendChild(this.cloneNode(true)); })
		.attr("class", "halo");

	var slider = sliderSvg.append("g")
		.attr("class", "slider")
		.call(brush);

	slider.selectAll(".extent,.resize")
		.remove();

	slider.select(".background")
		.attr("height", height)
		.attr("x",25);
		
	var handle = slider.append("circle")
		.attr("class", "handle")
		.attr("transform", "translate(0," + height / 2 + ")")
		.attr("r", 9)
		.attr("cx",x(loc));
		
	function brushed() {
		var value = brush.extent()[0];
		//console.log(d3.event.sourceEvent);
		if (d3.event.sourceEvent) { // not a programmatic event
			value = x.invert(d3.mouse(this)[0]);
			brush.extent([value, value]);
		}
		if(last>=2){
			d3.select(".legendSVG").remove();
			last = 0;
			image = heatmap3.createImageData(canvas2.width,canvas2.height); 
		}
		handle.attr("cx", x(value));
		drawInTime(value,value);
	}	
};
//End single slider

//Double slider
function doubleSlider(loc){
	var brush = d3.svg.brush()
		.x(x)
		.extent([loc, loc+10])
		.on("brushstart", brushstart)
		.on("brush", brushmove)
		.on("brushend", brushend);

	var arc = d3.svg.arc()
		.outerRadius(height / 2 - 10)
		.startAngle(0)
		.endAngle(function(d, i) { return i ? -Math.PI : Math.PI; });
		
	var sliderSvg = d3.select("body").append("svg")
		.attr("width", width)
		.attr("height", height)
		.attr("class", "sliderSVG")
		.on("dblclick",function(d){singleSlider(brush.extent()[0]);this.remove(); });;

	sliderSvg.append("g")
		.attr("class", "x axis")
		.attr("transform", "translate(0," + (height-15) + ")")
		.attr("y",height)
		.call(d3.svg.axis()
		  .scale(x)
		  .orient("bottom")
		  .tickFormat(function(d) { return d + "%"; })
		  .tickSize(-height +20)
		  .tickPadding(8))
	  .select(".domain")
	  .select(function() { return this.parentNode.appendChild(this.cloneNode(true)); })
		.attr("class", "halo");


	var brushg = sliderSvg.append("g")
		.attr("class", "brush")
		.call(brush);

	brushg.selectAll(".resize").append("path")
		.attr("transform", "translate(0," +  (height / 2-10) + ")")
		.attr("d", arc);

	brushg.selectAll("rect")
		.attr("height", height-20);
		
	brushstart();
	brushmove();
	
	function brushstart() {
	
	};

	function brushmove() {

	  //circle.classed("selected", function(d) { return s[0] <= d && d <= s[1]; });  
	};

	function brushend() {
		var s = brush.extent();
		//console.log(s);
		drawInTime(s[0],s[1]);
	};
};