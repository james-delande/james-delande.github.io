var w=500;
var h=500;

var xscale = d3.scale.linear()
					 .domain([-1500,2000])
					 .range([0,w]);
					 
var yscale = d3.scale.linear()
					 .domain([3000,-500])
					 .range([0,h]);
					 					 
var timeScale = d3.scale.linear()
				.domain([0, 100])
				.range([0, 1]);

				
var scaleColors = brightScaleColors = ["#FFFFFF","#0000FF","#FFFF00","#00FF00","#FF9900","#FF0000"];
var greyScaleColors = ["#FFFFFF","#D0D0D0","#A0A0A0","#787878","#505050","#000000"];
var greyscale = false;
var svgContainer = d3.select("body")
			.append("svg")
			.attr("class", "svgContainer")
			.attr("width",w)
			.attr("height",h);

var xAxisSvg = d3.select("body")
			.append("svg")
			.attr("width", w+50)
			.attr("height",30)
			.attr("class","xaxis");
			
xAxisSvg.append("g")
	.attr("transform","translate(25,5)")
	.call(d3.svg.axis()
		.scale(xscale)
		.orient("top")
		.tickFormat(function(d) { return d; })
		.tickPadding(0))
    .selectAll("text")
		.attr("transform", "translate(0,25)");
	  
var yAxisSvg = d3.select("body")
			.append("svg")
			.attr("width", 50)
			.attr("height",h+50)
			.attr("class","yaxis");

yAxisSvg.append("g")
	.attr("transform", "translate(45,25)")
	.call(d3.svg.axis()
	  .scale(yscale)	  
	  .orient("right")
	  .tickFormat(function(d) { return d; })
	  .tickPadding(0))
	.selectAll("text")
		.attr("transform", "translate(-40,0)");
	  
d3.selectAll("canvas")
    .attr("width", w)
    .attr("height", h);
	
var canvas = document.getElementById('heatmap');
heatmap = canvas.getContext('2d');

var canvas2 = document.getElementById('heatmap2');
heatmap2 = canvas2.getContext('2d');
var groupImage = heatmap2.createImageData(canvas2.width,canvas2.height);
var image = heatmap2.createImageData(canvas2.width,canvas2.height);
//create off screen canvas
var off = document.createElement('canvas');
off.width = w;
off.height = h;
var ctx = off.getContext('2d');
ctx.webkitImageSmoothingEnabled=false;

var sonarRange = xscale(750) - xscale(0), sonarAngle = Math.PI/4, draggable = true;
var overlapData = new Array();
var lineData = new Array();
	lineData.push([{ "x": 100,   "y": -100},  { "x": 300,  "y": -100},
                 { "x": 100,  "y": 100}, { "x": 300,  "y": 100}]);
	lineData.push([{ "x": -400,   "y": 400},  { "x": -200,  "y": 400},
                 { "x": -400,  "y": 600}, { "x": -200,  "y": 600}]);		 
	lineData.push([{ "x": 700,   "y": 400},  { "x": 900,  "y": 400},
                 { "x": 700,  "y": 600}, { "x": 900,  "y": 600}]);
	lineData.push([{ "x": 1000,   "y": 1000},  { "x": 1200,  "y": 1000},
                 { "x": 1000,  "y": 1200}, { "x": 1200,  "y": 1200}]);
	lineData.push([{ "x": 100,   "y": 1000},  { "x": 300,  "y": 1000},
                 { "x": 100,  "y": 1200}, { "x": 300,  "y": 1200}]);	
	lineData.push([{ "x": -600,   "y": 1000},  { "x": -400,  "y": 1000},
                 { "x": -600,  "y": 1200}, { "x": -400,  "y": 1200}]);				 
//Create the path line
var lineFunction = d3.svg.line()
                         .x(function(d) { return xscale(d.x); })
                         .y(function(d) { return yscale(d.y); })
                         .interpolate("cardinal-closed");

var overlap = d3.svg.line()
			.x(function(d) { return xSliderScale(d.t); })
			.y(function(d) { return 100 - timeScale.invert((d.max)/5);});

var colors = new Array();
	colors.push(d3.rgb("red"));
	colors.push(d3.rgb("blue"));
	colors.push(d3.rgb("green"));
	colors.push(d3.rgb("cyan"));
	colors.push(d3.rgb("magenta"));
	colors.push(d3.rgb("orange"));
var sonarType = new Array();
	sonarType.push("fw");
	sonarType.push("ss");
	sonarType.push("fw");
	sonarType.push("ss");
	sonarType.push("fw");
	sonarType.push("ss");	
	
function updateVehicle(num){
		var path = d3.selectAll(".path"+num)[0][0];
		var l = path.getTotalLength();
		var x;
		if(d3.select(".handle")[0][0] != null){
			x = d3.select(".handle").attr("x");
		}else{
			x = d3.select(".extent").attr("x");
		}
		var time = xSliderScale.invert(x)/100;
		var p = path.getPointAtLength(time * l);
		d3.selectAll(".UUV"+num).attr({
								cx: p.x,
								cy: p.y
							});
};	
var dragPoint = d3.behavior.drag()
	.on("drag", function(d,i) {
	//only drag if it is allowed at the time
	if(draggable){
		var num = this.classList[0].slice(-1); //Path number we are working with
		var dx = Math.max(0, Math.min(w, d3.event.x));
		var dy = Math.max(0, Math.min(h, d3.event.y));
		//set point location
		//console.log(num, i);
		d3.select(this).attr("cx", dx).attr("cy",dy);
		//Update vehicle location 
		updateVehicle(num);
		//Now working with rest of line data, need to invert to SVG coordinate system for continuity
		lineData[num][i].x = xscale.invert(dx);
		lineData[num][i].y = yscale.invert(dy);
		//Update path with new line data
		d3.selectAll(".path"+num).attr("d", lineFunction(lineData[num]));

		d3.select(".center"+num).remove();
		d3.selectAll(".rotate"+num).remove();
		drawBox(num);
	}
});	

var dragGroup = d3.behavior.drag()
	.on("drag", function(d,i) {
	//only drag if it is allowed at the time
	if(draggable){
		var num = this.classList[0].slice(-1); //Path number we are working with
		var mx = Math.max(0, Math.min(w, d3.event.x)),
			my = Math.max(0, Math.min(h, d3.event.y)); //Mouse event x,y
		var x = parseFloat(d3.select(this).attr("x"))+4,
			y = parseFloat(d3.select(this).attr("y"))+4;//Center of the box
		var dx = mx - x, dy = my - y; //Change in x,y

		d3.select(this).attr("x",mx-4).attr("y",my-4);
		
		d3.selectAll(".line"+num)
					.data(d3.selectAll(".line"+num)[0])
					.each(function(d,i){
						//Update point data here
						var px = parseFloat(d3.select(this).attr("cx")) + dx,
						py = parseFloat(d3.select(this).attr("cy")) + dy;
						d3.select(this).attr("cx",px);
						d3.select(this).attr("cy",py);
						//Update line data
						lineData[num][i].x = xscale.invert(px);
						lineData[num][i].y = yscale.invert(py);
						});
	// //Update path data
	d3.selectAll(".path"+num).attr("d", lineFunction(lineData[num]));
	// //Update vehicle location
	updateVehicle(num);
	d3.select(".center"+num).remove();
	d3.selectAll(".rotate"+num).remove();
	drawBox(num);
	}
});	
singleSlider(15);
svgContainer.selectAll(".path").data(lineData).enter().append("path")
						.attr("class", function(d,i){return "paths path"+i})
						.attr("d", function(d){return lineFunction(d)})
						.style("stroke-dasharray", ("3,3"))//dashed line
						.attr("stroke", function(d,i){return colors[i]})
						.attr("stroke-width", 2)
						.attr("fill", "none");

svgContainer.append("linearGradient")                
        .attr("id", "bright-gradient")            
        .attr("gradientUnits", "userSpaceOnUse")    
        .attr("x1", 0).attr("y1", 100)         
        .attr("x2", 0).attr("y2", 0)      
    .selectAll("stop")                      
        .data([                             
            {offset: "0%", color: "#0000FF"},
			{offset: "25%", color: "#0000FF"},			
            {offset: "26%", color: "#FFFF00"},  
			{offset: "50%", color: "#FFFF00"},
            {offset: "51%", color: "#00FF00"},   
			{offset: "75%", color: "#00FF00"}, 
            {offset: "76%", color: "#FF9900"},
			{offset: "95%", color: "#FF9900"},
            {offset: "100%", color: "#FF0000"}   
        ])                  
    .enter().append("stop")         
        .attr("offset", function(d) { return d.offset; })   
        .attr("stop-color", function(d) { return d.color; });
		
svgContainer.append("linearGradient")                
        .attr("id", "grey-gradient")            
        .attr("gradientUnits", "userSpaceOnUse")    
        .attr("x1", 0).attr("y1", 100)         
        .attr("x2", 0).attr("y2", 0)      
    .selectAll("stop")                      
        .data([                             
            {offset: "0%", color: "#D0D0D0"},       
            {offset: "25%", color: "#A0A0A0"},  
            {offset: "50%", color: "#787878"},        
            {offset: "75%", color: "#505050"},        
            {offset: "100%", color: "#000000"}   
        ])                  
    .enter().append("stop")         
        .attr("offset", function(d) { return d.offset; })   
        .attr("stop-color", function(d) { return d.color; });
		
svgContainer.selectAll(".vehicle").data(d3.selectAll(".paths")[0]).enter().append("circle")
						.each(function (d,i){
							var l = d.getTotalLength();
							var time = xSliderScale.invert(d3.select(".handle").attr("x"))/100;
							var p = d.getPointAtLength(time * l);
							d3.select(this).attr({
								class: "UUV"+i+" vehicle",
								fill: colors[i],
								r: 5,
								cx: p.x,
								cy: p.y
							})
						});		
var prev = [0,0,0,0,0,0];
var scale = [30,30,30,30,30,30];
var rotatePaths = d3.behavior.drag()
	.on("drag", function() {
	//only drag if it is allowed at the time
	if(draggable){
		var num = this.classList[0].slice(-1); //group number we are working with	
		var rect = d3.select(".center"+num);
		var evt = d3.event;
		var rectx = parseFloat(rect.attr("x"))+4, recty = parseFloat(rect.attr("y"))+4;
		//Don't let it drag outside the container
		var dx = Math.max(0, Math.min(w, evt.x));
		var dy = Math.max(0, Math.min(h, evt.y));
		var theta = Math.atan((recty-dy)/(rectx-dx));
		//convert to degrees and offset by 90 for the different coordinate system
		var deg = theta*180/Math.PI+90;
		//console.log(deg);
		var dist = Math.sqrt(Math.pow(rectx-dx,2)+Math.pow(recty-dy,2));

		if(dx > rectx){
			dx = (Math.cos(theta)*dist) + rectx;
			dy = (Math.sin(theta)*dist) + recty;	
		}else{
			dx = rectx-(Math.cos(theta)*dist);
			dy = recty-(Math.sin(theta)*dist);
			//Since Math.atan only goes from -pi to pi, need to adjust
			deg= deg-180;
		}
		var temp = dist;
		dist = dist/scale[num];
		scale[num] = temp;
		if(deg > 360){
			deg = deg - 360;
		}

		//Update the path
		temp = deg;
		deg = deg- prev[num]; //Change deg to only be the offset in rotation
		prev[num] = temp; //Set the new previous rotation
		getRotatedPoints(num,deg,dist);
		d3.select(".center"+num).remove();
		d3.selectAll(".rotate"+num).remove();
		drawBox(num);
	}
});						
svgContainer.selectAll(".rotate").data(lineData).enter().append("g")
						.attr("class", function(d,i){return "move group"+i})
						.each(function(d,i){
							drawBox(i);
							d3.select(this).selectAll(".point").data(d).enter()
									.append("circle")
									.attr("class", function(d,n){return "line"+i + " point"+n})
									.attr("r", 3)
									.attr("fill",colors[i])
									.attr("stroke","black")
									.attr("cx", function(d) { return xscale(d.x);})
									.attr("cy", function(d) { return yscale(d.y);})
									.call(dragPoint);
						});

function drawBox(i){
	var node = d3.select(".path"+i).node();
	var bbox = node.getBBox(); 
	var xBox = Math.floor(bbox.x + bbox.width/2.0);
	var yBox = Math.floor(bbox.y + bbox.height/2.0);
	var dx = xBox, dy = yBox-scale[i];
	var theta = Math.atan((yBox-dy)/(xBox-dx))+(prev[i]*Math.PI/180);
	//convert to degrees and offset by 90 for the different coordinate system

	if(dx > xBox){
		dx = (Math.cos(theta)*scale[i]) + xBox;
		dy = (Math.sin(theta)*scale[i]) + yBox;	
	}else{
		dx = xBox-(Math.cos(theta)*scale[i]);
		dy = yBox-(Math.sin(theta)*scale[i]);
		//Since Math.atan only goes from -pi to pi, need to adjust
	}
	//d3.selectAll(".hinge"+num).attr("d","M"+[(rectx),(recty)]+"L"+[dx,dy]);
	d3.select(".group"+i).append("path")
				.attr("class", "hinge"+i +" rotate"+i)
				.attr("d","M"+[(xBox),(yBox)]+"L"+[dx,dy])
				.attr("stroke","gray")
				.style("stroke-dasharray", ("2,1"));
				
	d3.select(".group"+i).append("circle")
				.attr("class", "handle"+i +" rotate"+i)
				.attr("cx",dx)
				.attr("cy",dy)
				.attr("r",5)
				.attr("stroke","black")
				.attr("fill", "gray")
				.call(rotatePaths);
				
	d3.select(".group"+i).append("rect")
			.attr("class", "center"+i)
			.attr("x",xBox-4)
			.attr("y",yBox-4)
			.attr("width",8)
			.attr("height",8)
			.attr("fill", d3.select(node).attr("stroke"))
			.attr("stroke","black")
			.call(dragGroup);
};

function getRotatedPoints(num,deg,scale){
	var rect = d3.select(".center"+num);
	var evt = d3.event;
	var rectx = parseFloat(rect.attr("x"))+4, recty = parseFloat(rect.attr("y"))+4;
	//console.log(deg);
	deg = deg*Math.PI/180;	
	//console.log(rectx,recty);
	d3.selectAll(".line"+num)
						.data(d3.selectAll(".line"+num)[0])
						.each(function(d,i){
							//Update point data here
							var x = parseFloat(d3.select(this).attr("cx")),
							y = parseFloat(d3.select(this).attr("cy"));
							var theta = Math.atan((recty-y)/(rectx-x));
							var hyp = Math.sqrt(Math.pow(rectx-x,2)+Math.pow(recty-y,2));

							theta = theta + deg;
							if(theta<0){
								theta = theta+2*Math.PI;
							}							
							var dx,dy;
							if(x > rectx){
								dx = Math.cos(theta)*hyp*scale + rectx;
								dy = Math.sin(theta)*hyp*scale + recty;
							}else{
								dx = rectx-(Math.cos(theta)*hyp)*scale;
								dy = recty-(Math.sin(theta)*hyp)*scale;								
							}

							d3.select(this).attr("cx",dx);
							d3.select(this).attr("cy",dy);
							//Update line data
							lineData[num][i].x = xscale.invert(dx);
							lineData[num][i].y = yscale.invert(dy);
							});
	//Update path data
	d3.selectAll(".path"+num).attr("d", lineFunction(lineData[num]));
	//Update vehicle location
	updateVehicle(num);
};
function clearAll(){
	heatmap.clearRect(0,0,canvas.width,canvas.height);
	heatmap2.clearRect(0,0,canvas2.width,canvas2.height);
	ctx.clearRect(0,0,off.width,off.height);
	image = heatmap2.createImageData(canvas.width,canvas.height);
	d3.select(".legendSVG").remove();
	overlapData = new Array();
};
function transition() {
	document.getElementById("transition").disabled = true;
	if(d3.select(".handle")[0][0] != null){
		d3.select(".handle").attr("x",xSliderScale(0));
	}else{
		singleSlider(0);
		d3.select(".sliderSVG").remove();
	}
	d3.selectAll(".slider").style("pointer-events","none");
	clearAll();
	draggable = false; //Don't allow path dragging during transition
	var gCO = ctx.globalCompositeOperation;
	ctx.globalCompositeOperation = "lighter";
	ctx.fillStyle = "rgba(1,1,1,1)";
	heatmap.globalCompositeOperation = "lighter";
	d3.selectAll(".vehicle")
		.data(d3.selectAll(".paths")[0])
		.transition()
		.duration(10000)
		.ease("linear")
		.attrTween("transform", function(d,i){ // Returns an attrTween for translating along the specified path element.
						var l = d.getTotalLength();
						return function(t) {									
							var p = d.getPointAtLength(t * l),p1;
							if(t-.0001 < 0){
								p1 = d.getPointAtLength(0);
							}else{
								p1 = d.getPointAtLength((t-.0001) * l);
							}
							d3.select(".handle").attr("x",xSliderScale(t*100));
							drawSonar(p,p1,i);
							if(i===(sonarType.length-1)){
								var temp = ctx.getImageData(0,0,off.width,off.height);
								overlapData.push({"t" : t*100, "max":getMax(temp.data)});
								drawOverlap();
								scaleHeatMap(temp);
								heatmap.putImageData(temp,0,0);
								ctx.clearRect(0,0,off.width,off.height);
							}
							
							return "translate("+[(p.x-d.getPointAtLength(0).x), (p.y - d.getPointAtLength(0).y)] + ")";
						}
					})
		.each("start",function(d,i){
					//console.log(d);
					var p = d.getPointAtLength(0);
					d3.selectAll(".UUV"+i).attr({
											cx: p.x,
											cy: p.y
										});
		})
		.each("end",function(d,i){
			if(i===(sonarType.length-1)){
				heatmap.globalCompositeOperation = gCO;	
				finish();
			}
			});
};
function drawOverlap(){
	if(d3.select(".overlapLine")[0] != null){
		d3.select(".overlapLine").remove();
	}
	d3.select(".sliderSVG").append("path")
		.attr("d",overlap(overlapData))
		.attr("class", function() {
				var scale = greyscale ? "greyLine " : "brightLine ";
				return "overlapLine " + scale;
				});
};
function finish(){
		drawHeatMap(7);
		document.getElementById("transition").disabled = false;
		d3.selectAll(".slider").style("pointer-events","auto");
		draggable = true;//Now we can allow dragging again
};
function getMax(imageData){
	var max= 0, count = 0;	
	for (var i=0;i<imageData.length;i+=4){		
		if(imageData[i]>max){
			max = imageData[i];
			count = 1;
		}else if(max === imageData[i]){
			count++;
		}
	}
	if(count < 1000){
		max-=1;
	}
	return max;
}
function drawHeatMap(count){
	if(greyscale){
		scaleColors = greyScaleColors;
	}else{
		scaleColors = brightScaleColors;
	}
	var colorScale = d3.scale.quantize()
						 .domain([0,6])
						 .range(scaleColors);
	heatmap.clearRect(0,0,canvas.width,canvas.height);
	var imageData = image.data;	//It's faster to work with a reference
	//Array for percentage of coverage area
	var percents = [0,0,0,0,0,0];
	var max= getMax(imageData);
	//console.log(max);
	if(max < 6){
		max = 6;
	}
	for (var i=0;i<imageData.length;i+=4){
		var col = colorScale(Math.ceil((imageData[i]/max)*6));
		for(var j = 0; j<3;j++){
			imageData[i+j] = h2d(col.substring(2*j+1,2*j+3));
		}
		//Need to figure out a better way to handle alpha
		imageData[i+3] = 200;
		//Find out what category it falls into
		switch(col){
			case scaleColors[0]:
				percents[0]++;
				break;
			case scaleColors[1]:
				percents[1]++;
				break;
			case scaleColors[2]:
				percents[2]++;
				break;
			case scaleColors[3]:
				percents[3]++;
				break;
			case scaleColors[4]:
				percents[4]++;
				break;
			case scaleColors[5]:
				percents[5]++;
				break;
			default:
				console.log("booo!");
				break;
		}
	}
	
	//Get percentages of coverage area
	var total = 0;
	for(i=0; i< percents.length;i++){
		percents[i] = percents[i]/(imageData.length/4);
		total +=percents[i];		
	}
	//console.log(percents);
	image.data = imageData;
	heatmap2.putImageData(image,0,0);
	drawLegend(percents);

};
//Create heatmap legend
function drawLegend(percents){
	var legendSvg = d3.select("body")
			.append("svg")
			.attr("width",100)
			.attr("height",h)
			.attr("class","legendSVG");
			
	legendSvg.selectAll("rect")
			.data(percents)
			.enter()
			.append("rect")
			.attr("x", function(d,i){return 25;})
			.attr("y", function(d,i){return h - h/6 * i - 50;})
			.attr("width", 15)
			.attr("height", 15)
			.attr("fill", function(d,i){return scaleColors[i]})
			.attr("stroke",function(d,i){
					if(greyscale){
						return scaleColors[(i+5)%6];
					}else{
						return "black";
					}
				})
			.attr("stroke-width", 2);
	
	legendSvg.selectAll("text")
		.data(percents)
		.enter()
		.append("text")
		.text(function(d) {return (d*100).toFixed(2)+"%";})
		.attr("x", function(d,i){return 45;})
		.attr("y", function(d,i){return h - h/6 * i-38;});
}
//convert hex to decimal
function h2d(h) {return parseInt(h,16);};


function drawInTime(start, end){
	var count = 0;
	clearAll();
	ctx.fillStyle =  "rgba(1,1,1,1)";
	ctx.globalCompositeOperation = "lighter";
	d3.selectAll(".vehicle")
			.data(d3.selectAll(".paths")[0])
			.each(function(d,i){ 
								var l = d.getTotalLength();
								var p,p1;
								//console.log(i);
								for(time=timeScale(start);time<=timeScale(end);time+=.005){
									p = d.getPointAtLength(time * l);
									if(time-.0001 < 0){
										p1 = d.getPointAtLength(0);
									}else{
										p1 = d.getPointAtLength((time-.0001) * l);
									}									
									drawSonar(p,p1,i);
	
									count++;
									
									var temp = ctx.getImageData(0,0,off.width,off.height);
									scaleHeatMap(temp);									
									ctx.clearRect(0,0,off.width,off.height);
																	
								}	
								if(i===(sonarType.length-1)){
										drawHeatMap(count)
								}
								p = d.getPointAtLength(timeScale(end)*l);
								d3.select(this).attr({
									cx: p.x,
									cy: p.y									
								});

				});		
};	

function drawSonar(p,p1,num){
	var heading = Math.atan2((p.y-p1.y),(p.x-p1.x));//heading in radians, 0 is 3 O'Clock
	if(isNaN(heading)){//we are going vertically, i.e. p1.x == p.x
		if(p.y>p1.y){
			heading = Math.PI/2;
		}else{
			heading = -Math.PI/2;
		}
		console.log(heading);
	}
	//console.log(heading);
	if(sonarType[num]==="fw"){
		drawForwardSonar(p,heading,num);
	}else if(sonarType[num]==="ss"){
		drawSideScanSonar(p,heading,num);
	}else{
		console.log("fail");
	}
};
function drawForwardSonar(p,heading,num){		
	var center = [p.x+sonarRange * Math.cos(heading), p.y+sonarRange * Math.sin(heading)];
	ctx.beginPath();		
	ctx.lineTo(center[0]+sonarRange*Math.cos(heading-sonarAngle),center[1]+sonarRange*Math.sin(heading-sonarAngle));
	ctx.moveTo(p.x,p.y);
	ctx.arc(center[0],center[1], sonarRange/2, heading-sonarAngle, heading+sonarAngle, false);
	ctx.closePath();
	ctx.fill();					
};

function drawSideScanSonar(p,heading,num){
	var perp = [heading+Math.PI/2, heading-Math.PI/2];
	var center = [p.x+sonarRange * Math.cos(perp[0]), p.y+sonarRange * Math.sin(perp[0]),
				p.x+sonarRange * Math.cos(perp[1]), p.y+sonarRange * Math.sin(perp[1])];
	ctx.beginPath();		
	ctx.lineTo(center[0]+sonarRange*Math.cos(perp[0]-sonarAngle),center[1]+sonarRange*Math.sin(perp[0]-sonarAngle));
	ctx.moveTo(p.x,p.y);
	ctx.arc(center[0],center[1], sonarRange/2, perp[0]-sonarAngle, perp[0]+sonarAngle, false);
	ctx.moveTo(p.x,p.y);
	ctx.lineTo(center[2]+sonarRange*Math.cos(perp[1]-sonarAngle),center[3]+sonarRange*Math.sin(perp[1]-sonarAngle));
	ctx.moveTo(p.x,p.y);
	ctx.arc(center[2],center[3], sonarRange/2, perp[1]-sonarAngle, perp[1]+sonarAngle, false);
	ctx.closePath();
	ctx.fill();		
};

function scaleHeatMap(temp){
	var imageData = image.data, tempData = temp.data;
	for (var i=0;i<imageData.length;i+=4){
		if(tempData[i]!=0){
			imageData[i] = imageData[i] + 1;
			imageData[i+1] = imageData[i+1] + 1;
			imageData[i+2] = imageData[i+2] + 1;			
			imageData[i+3] = 255;
		}
	}
	image.data = imageData;
};

function toggle() {
	greyscale = !greyscale;
}