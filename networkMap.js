var nw = 200,
    nh = 200;
	
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
}

function redrawGrid(){
	d3.selectAll(".networkSVG").remove();
	drawGrid();
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
				  
	var col = row.selectAll(".cell")
				 .data(function (d) { return d; })
				.enter().append("rect")
				 .attr("class", function(d,i){return "cell"+i;})
				 .attr("x", function(d,i) { return i*20; })
				 .attr("y", function(d,i) { return d*20; })
				 .attr("width", function(d) { return 20; })
				 .attr("height", function(d) { return 20; })
				 .on('mouseover', function() {
					// d3.select(this)
                        // .style('fill', '#FFF');
				 })
				 .on('mouseout', function() {
					// d3.select(this)
                        // .style('fill', '#FFF');
				 })
				 .on('click', function() {
					console.log(d3.select(this));
				 })
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
					
	var labels = row.selectAll(".cell")
					 .data(function (d) { return d; })
					.enter().append("text")
					 .attr("class", function(d,i){return "label"+i;})
					 .attr("x", function(d,i) { return i*20+5; })
					 .attr("y", function(d,i) { return d*20+15; })
					 .text(function(d,i){
						if(d===0 && i===0){
							return "#";
						}else if(d===i){
							return "-"
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
};