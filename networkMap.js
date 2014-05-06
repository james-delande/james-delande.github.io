var nw = 142,
    nh = 142;
	
var networkMap = new Array();
//networkMap.push([0,1,2,3,4,5,6]);
for(i = 0; i<=6; i++){
	networkMap.push([i,i,i,i,i,i,i]);	
}


	
function inRange(v1, v2){
	var v1x = parseFloat(d3.selectAll(".UUV"+v1).attr("cx")),
						v1y = parseFloat(d3.selectAll(".UUV"+v1).attr("cy"));
	var v2x = parseFloat(d3.selectAll(".UUV"+v2).attr("cx")),
						v2y = parseFloat(d3.selectAll(".UUV"+v2).attr("cy"));					
	var dist = Math.sqrt(Math.pow(v1x-v2x,2)+Math.pow(v1y-v2y,2));
	if(dist <= sonarRange){
		return true;
	}else{
		return false;
	}
};

function redrawGrid(){
	d3.selectAll(".networkSVG").remove();
	drawGrid();
};

function drawConnection(v1, v2){
	var v1x = parseFloat(d3.selectAll(".UUV"+v1).attr("cx")),
						v1y = parseFloat(d3.selectAll(".UUV"+v1).attr("cy"));
	var v2x = parseFloat(d3.selectAll(".UUV"+v2).attr("cx")),
						v2y = parseFloat(d3.selectAll(".UUV"+v2).attr("cy"));
	var dist = Math.sqrt(Math.pow(v1x-v2x,2)+Math.pow(v1y-v2y,2));
	var conn = svgContainer.append("line")
			.attr("class", "connection")
			.attr("x1", v1x)
			.attr("y1", v1y)
			.attr("x2", v2x)
			.attr("y2", v2y)
			.attr("stroke-width", 2);
			
	if(dist <= sonarRange){
		conn.style("stroke", "green");
	}else{
		conn.style("stroke", "red")
			.style("stroke-dasharray", ("3,2,3"));
	}
};
function highlight(veh){
var node = d3.select(".path"+veh).node();
var bbox = node.getBBox();
var xBox = Math.floor(bbox.x + bbox.width/2.0);
var yBox = Math.floor(bbox.y + bbox.height/2.0);
svgContainer.append("rect")
			.attr("class", "highlight")
			.attr("x",bbox.x)
			.attr("y",bbox.y)
			.attr("width",bbox.width)
			.attr("height",bbox.height)
			.attr("fill", "none")
			.attr("stroke","black")
			.transition()
			.duration(2000)
			.ease("bounce")
			.attr("transform", "translate("+[-xBox*.5, -yBox*.5]+") scale(1.5)")
			.each("end", function(){
					d3.select(this).transition()
					.duration(2000)
					.ease("bounce")
					.attr("transform", "translate("+[-xBox*.2, -yBox*.2]+") scale(1.2)");
					});
};
function drawGrid(){

	var networkSvg = d3.select("body").append("svg")
		.attr("width", nw)
		.attr("height", nh)
		.attr("class", "networkSVG");
		
	var row = networkSvg.selectAll(".row")
					.attr("class", "grid")
					.data(networkMap)
                .enter().append("g")
                  .attr("class", function(d,i){return "row"+i;});
				  
	row.selectAll(".cell")
				 .data(function (d) { return d; })
				.enter().append("rect")
				 .attr("class", function(d,i){return "cell cell"+i;})
				 .attr("x", function(d,i) { return i*20; })
				 .attr("y", function(d,i) { return d*20; })
				 .attr("width", function(d) { return 20; })
				 .attr("height", function(d) { return 20; })
				 .style("fill", function(d,i){
						if(d===i){
							return "#AAA"
						}else if(d===0){
							return colors[i-1];
						}else if(i===0){
							return colors[d-1];
						}else if(inRange(d-1,i-1)){
							return "green";
						}else{
							return "red";
						}
					})
				 .style("stroke", function(d,i){
						if(d===0 || i===0){
							return "#EEE";
						}else{
							return "#000";
						}
					});
					
	row.selectAll(".label")
					 .data(function (d) { return d; })
					.enter().append("text")
					 .attr("class", function(d,i){return "label label"+i;})
					 .attr("x", function(d,i) { return i*20+5; })
					 .attr("y", function(d,i) { return d*20+15; })
					 .text(function(d,i){
						if(d===0 && i===0){
							return "#";
						}else if(d===i){
							return "\u2013"
						}else if(d===0){
							return i;
						}else if(i===0){
							return d;
						}else if(inRange(d-1,i-1)){
							return "\u2713";
						}else{
							return "\u2717";
						}
					});
					 
	row.selectAll(".capture")
			 .data(function (d) { return d; })
			.enter().append("rect")
			 .attr("class", "mouse-capture")
			 .attr("x", function(d,i) { return i*20; })
			 .attr("y", function(d,i) { return d*20; })
			 .attr("width", function(d) { return 20; })
			 .attr("height", function(d) { return 20; })
			 .style("fill", "transparent")
			 .style("stroke", "none")
			 .on('mouseover', function(d,i) {
				if(d===i){
					//do nothing
				}else if(d===0){
					highlight(i-1);
				}else if(i===0){
					highlight(d-1);
				}else{
					drawConnection(d-1,i-1);
				}
			 })
			 .on('mouseout', function(d,i) {
				if(d===i){
					//do nothing
				}else if(d===0 || i ===0){
					d3.selectAll(".highlight").remove();
				}else{
					d3.selectAll(".connection").remove();
				}
			 });
};