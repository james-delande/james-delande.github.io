var w=500;
var h=500;

var xscale = d3.scale.linear()
					 .domain([-1500,2000])
					 .range([0,w]);
					 
var yscale = d3.scale.linear()
					 .domain([2500,-500])
					 .range([0,h]);

var svgContainer = d3.select("body")
			.append("svg")
			.attr("width",w)
			.attr("height",h);
var mx = xscale(750);
var my = yscale(1000);

var circle = svgContainer
					.append("circle")
					.attr("cx", mx)
					.attr("cy", my)
					.attr("r", 5);

svgContainer.selectAll("circle")
			.transition()
			.duration(1000)
			.attr("cx", function(){
							return xscale(100);
				})
			.attr("cy", function(){
							return yscale(400);
				});
						
svgContainer
	.append("path")
	.attr("d","M"+mx+","+my+" v150 a150,150 0 0,0 150,-150 z")
	.attr("fill","red")
	.attr("stroke","blue")
	.attr("stroke-width",2);
						
svgContainer.selectAll("path")
			.transition()
			.duration(1000)
			.attr("d","M"+xscale(100)+","+yscale(400)+" v150 a150,150 0 0,0 150,-150 z");