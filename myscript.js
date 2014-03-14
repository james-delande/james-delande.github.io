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
			
d3.selectAll("canvas")
    .attr("width", w)
    .attr("height", h);
	
var canvas = document.getElementById('heatmap');
heatmap = canvas.getContext('2d');
var sonarRange = 100, sonarAngle = Math.PI/4, switchSonar = true;

var lineData = [ { "x": 0,   "y": 500},  { "x": 200,  "y": 500},
                 { "x": 0,  "y": 700}, { "x": 200,  "y": 700}];

//Create the path line
var lineFunction = d3.svg.line()
                         .x(function(d) { return xscale(d.x); })
                         .y(function(d) { return yscale(d.y); })
                         .interpolate("cardinal-closed");


//The line SVG Path we draw
var path = svgContainer.append("path")
                            .attr("d", lineFunction(lineData))
							.style("stroke-dasharray", ("3,3"))//dashed line
                            .attr("stroke", "green")
                            .attr("stroke-width", 2)
                            .attr("fill", "none");


	
//Circle object, might be replacing with triangle	
var circle = svgContainer
					.append("circle")
					.attr("r", 5)
					.attr("transform","translate("+[xscale(lineData[0].x), yscale(lineData[0].y)] + ")");


transition();

function transition() {
  circle.transition()
      .duration(10000)
	  .ease("linear")
      .attrTween("transform", translateAlong(path.node()))
      .each("end", transition);
  switchSonar = !switchSonar;
}

// Returns an attrTween for translating along the specified path element.
function translateAlong(path) {
  var l = path.getTotalLength();
  return function(d, i, a) {
    return function(t) {
		var p = path.getPointAtLength(t * l),p1;
		if(t-.0001 < 0){
			p1 = path.getPointAtLength(0);
		}else{
			p1 = path.getPointAtLength((t-.0001) * l);
		}
		if(switchSonar){
			drawForwardSonar(p,p1);
		}else{
			drawSideScanSonar(p,p1);
		}
		return "translate(" + p.x + "," + p.y + ")";
    };
  };
};

function drawForwardSonar(p,p1){
		heatmap.clearRect(0,0,canvas.width,canvas.height);
		var heading = Math.atan2((p.y-p1.y),(p.x-p1.x));//heading in radians, 0 is 3 O'Clock
		if(isNaN(heading)){//we are going vertically, i.e. p1.x == p.x
			if(p.y>p1.y){
				heading = Math.PI/2;
			}else{
				heading = -Math.PI/2;
			}
			console.log(heading);
		}

		var center = [p.x+sonarRange * Math.cos(heading), p.y+sonarRange * Math.sin(heading)];
		//console.log(heading + " " + Math.sqrt(Math.pow(p.x-center[0],2) + Math.pow(p.y-center[1],2)));
		heatmap.beginPath();
		
		heatmap.lineTo(center[0]+sonarRange*Math.cos(heading-sonarAngle),center[1]+sonarRange*Math.sin(heading-sonarAngle));
		heatmap.moveTo(p.x,p.y);
		heatmap.arc(center[0],center[1], sonarRange/2, heading-sonarAngle, heading+sonarAngle, false);
		heatmap.fill();
		heatmap.closePath();

		
};

function drawSideScanSonar(p,p1){
		heatmap.clearRect(0,0,canvas.width,canvas.height);
		var heading = Math.atan2((p.y-p1.y),(p.x-p1.x));//heading in radians, 0 is 3 O'Clock
		if(isNaN(heading)){//we are going vertically, i.e. p1.x == p.x
			if(p.y>p1.y){
				heading = Math.PI/2;
			}else{
				heading = -Math.PI/2;
			}
			console.log(heading);
		}
		var perp = [heading+Math.PI/2, heading-Math.PI/2];
		var center = [p.x+sonarRange * Math.cos(perp[0]), p.y+sonarRange * Math.sin(perp[0]),
					p.x+sonarRange * Math.cos(perp[1]), p.y+sonarRange * Math.sin(perp[1])];
		heatmap.beginPath();		
		heatmap.lineTo(center[0]+sonarRange*Math.cos(perp[0]-sonarAngle),center[1]+sonarRange*Math.sin(perp[0]-sonarAngle));
		heatmap.moveTo(p.x,p.y);
		heatmap.arc(center[0],center[1], sonarRange/2, perp[0]-sonarAngle, perp[0]+sonarAngle, false);
		heatmap.moveTo(p.x,p.y);
		heatmap.lineTo(center[2]+sonarRange*Math.cos(perp[1]-sonarAngle),center[3]+sonarRange*Math.sin(perp[1]-sonarAngle));
		heatmap.moveTo(p.x,p.y);
		heatmap.arc(center[2],center[3], sonarRange/2, perp[1]-sonarAngle, perp[1]+sonarAngle, false);
		heatmap.fill();
		heatmap.closePath();		
};

