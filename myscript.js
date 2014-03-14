var w=500;
var h=500;

var xscale = d3.scale.linear()
					 .domain([-1500,2000])
					 .range([0,w]);
					 
var yscale = d3.scale.linear()
					 .domain([2500,-500])
					 .range([0,h]);
var colorScale = d3.scale.linear()
					 .domain([0,6])
					 .range(["blue","red"]);

var svgContainer = d3.select("body")
			.append("svg")
			.attr("width",w)
			.attr("height",h);
			
d3.selectAll("canvas")
    .attr("width", w)
    .attr("height", h);
	
var canvas = document.getElementById('heatmap');
heatmap = canvas.getContext('2d');

var canvas2 = document.getElementById('heatmap2');
heatmap2 = canvas2.getContext('2d');

var sonarRange = 100, sonarAngle = Math.PI/4;

var lineData = new Array();
	lineData.push([{ "x": 0,   "y": 500},  { "x": 200,  "y": 500},
                 { "x": 0,  "y": 700}, { "x": 200,  "y": 700}]);
	lineData.push([{ "x": 100,   "y": 1000},  { "x": 300,  "y": 1000},
                 { "x": 100,  "y": 1200}, { "x": 300,  "y": 1200}]);		 

//Create the path line
var lineFunction = d3.svg.line()
                         .x(function(d) { return xscale(d.x); })
                         .y(function(d) { return yscale(d.y); })
                         .interpolate("cardinal-closed");

var colors = new Array();
	colors.push("red");
	colors.push("green");
var className = new Array();
	className.push("one");
	className.push("two");
var sonarType = new Array();
	sonarType.push("fw");
	sonarType.push("ss");

//The line SVG Path we draw
var path = new Array();
var circle = new Array();
for(i=0;i<lineData.length;i++){
	path.push(svgContainer.append("path")
				.attr("class", ""+className[i]+" "+ sonarType[i]+" "+colors[i])
				.attr("d", lineFunction(lineData[i]))
				.style("stroke-dasharray", ("3,3"))//dashed line
				.attr("stroke", colors[i])
				.attr("stroke-width", 2)
				.attr("fill", "none"));
	//Circle object, might be replacing with triangle	
	circle.push(svgContainer.append("circle")
					.attr("class",className[i])
					.attr("r", 5)
					.attr("transform","translate("+[xscale(lineData[i][0].x), yscale(lineData[i][0].y)] + ")"));
}


transition();


function transition() {
	
	d3.selectAll("circle")
		.data(path)
		.transition()
		.duration(10000)
		.ease("linear")
		.attrTween("transform", function(d){ // Returns an attrTween for translating along the specified path element.
										var path = d.node();
										console.log(path.classList);
										var classList = path.classList;
										var l = path.getTotalLength();
										return function(t) {												
											var p = path.getPointAtLength(t * l),p1;
											if(t-.0001 < 0){
												p1 = path.getPointAtLength(0);
											}else{
												p1 = path.getPointAtLength((t-.0001) * l);
											}
											if(classList[1]==="fw"){
												drawForwardSonar(p,p1,classList[2]);
											}else if(classList[1]==="ss"){
												drawSideScanSonar(p,p1,classList[2]);
											}else{
												
											}
											return "translate(" + p.x + "," + p.y + ")";
										}
									});
											
		//.each("end", transition);		
}


function drawForwardSonar(p,p1,color){		
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
		heatmap.fillStyle =  "rgba(1,1,1,1)";
		//heatmap.globalAlpha=.5;
		heatmap.beginPath();		
		heatmap.lineTo(center[0]+sonarRange*Math.cos(heading-sonarAngle),center[1]+sonarRange*Math.sin(heading-sonarAngle));
		heatmap.moveTo(p.x,p.y);
		heatmap.arc(center[0],center[1], sonarRange/2, heading-sonarAngle, heading+sonarAngle, false);
		heatmap.fill();
		heatmap.closePath();
		
};

function drawSideScanSonar(p,p1,color){
		heatmap2.clearRect(0,0,canvas2.width,canvas2.height);
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
		heatmap2.fillStyle = "rgba(1,1,1,1)";
		//heatmap2.globalAlpha=.5;
		heatmap2.beginPath();		
		heatmap2.lineTo(center[0]+sonarRange*Math.cos(perp[0]-sonarAngle),center[1]+sonarRange*Math.sin(perp[0]-sonarAngle));
		heatmap2.moveTo(p.x,p.y);
		heatmap2.arc(center[0],center[1], sonarRange/2, perp[0]-sonarAngle, perp[0]+sonarAngle, false);
		heatmap2.moveTo(p.x,p.y);
		heatmap2.lineTo(center[2]+sonarRange*Math.cos(perp[1]-sonarAngle),center[3]+sonarRange*Math.sin(perp[1]-sonarAngle));
		heatmap2.moveTo(p.x,p.y);
		heatmap2.arc(center[2],center[3], sonarRange/2, perp[1]-sonarAngle, perp[1]+sonarAngle, false);
		heatmap2.fill();
		heatmap2.closePath();	
		//heatmap2.stroke();
		
		//console.log(heatmap2.getImageData(0,0,canvas2.width,canvas2.height));
};
