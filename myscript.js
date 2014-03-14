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
function getPath()
{
 return "M"+mx+","+my+" v-150 a150,150 0 0,0 -150,150 z"
};
var lineData = [ { "x": 0,   "y": 500},  { "x": 500,  "y": 500},
                 { "x": 0,  "y": 250}, { "x": 500,  "y": 250}];

//This is the accessor function we talked about above
var lineFunction = d3.svg.line()
                         .x(function(d) { return xscale(d.x); })
                         .y(function(d) { return yscale(d.y); })
                         .interpolate("cardinal-closed");


//The line SVG Path we draw
var path = svgContainer.append("path")
                            .attr("d", lineFunction(lineData))
							.style("stroke-dasharray", ("3,3"))
                            .attr("stroke", "blue")
                            .attr("stroke-width", 2)
                            .attr("fill", "none");

//Puts circles at the points in the path							
svgContainer.selectAll(".point")
    .data(lineData)
  .enter().append("circle")
    .attr("r", 2)
	.attr("fill","red")
    .attr("transform", function(d) { return "translate(" + [xscale(d.x), yscale(d.y)] + ")"; });
	
//Circle object, replacing with triangle	
var circle = svgContainer
					.append("circle")
					.attr("r", 5)
					.attr("transform","translate("+[xscale(lineData[0].x), yscale(lineData[0].y)] + ")");
					
var triangle = svgContainer
					.append("path")
					.attr("d", "M"+mx+","+my+"l-3,-8 l-3,8")
					.attr("stroke","red")
					.attr("fill","red");
transition();

function transition() {
  circle.transition()
      .duration(10000)
      .attrTween("transform", translateAlong(path.node()))
      .each("end", transition);
};

// Returns an attrTween for translating along the specified path element.
function translateAlong(path) {
  var l = path.getTotalLength();
  return function(d, i, a) {
    return function(t) {
      var p = path.getPointAtLength(t * l);
      return "translate(" + p.x + "," + p.y + ")";
    };
  };
};