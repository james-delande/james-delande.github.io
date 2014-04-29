var w=500;
var h=500;

var xscale = d3.scale.linear()
					 .domain([-1500,2000])
					 .range([0,w]);
					 
var yscale = d3.scale.linear()
					 .domain([2500,-500])
					 .range([0,h]);
					 					 
var timeScale = d3.scale.linear()
				.domain([0, 100])
				.range([0, 1]);
				
var scaleColors = ["#FFFFFF","#0000FF","#FFFF00","#00FF00","#FF9900","#FF0000"];

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

var canvas3 = document.getElementById('heatmap3');
heatmap3 = canvas3.getContext('2d');

var image = heatmap3.createImageData(canvas2.width,canvas2.height); 

var sonarRange = 100, sonarAngle = Math.PI/4, draggable = true;

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
			x = d3.select(".handle").attr("cx");
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
												
svgContainer.selectAll(".vehicle").data(d3.selectAll(".paths")[0]).enter().append("circle")
						.each(function (d,i){
							var l = d.getTotalLength();
							var time = xSliderScale.invert(d3.select(".handle").attr("cx"))/100;
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

		if(dx > rectx){
			dx = (Math.cos(theta)*30) + rectx;
			dy = (Math.sin(theta)*30) + recty;	
		}else{
			dx = rectx-(Math.cos(theta)*30);
			dy = recty-(Math.sin(theta)*30);
			//Since Math.atan only goes from -pi to pi, need to adjust
			deg= deg-180;
		}
		
		if(deg > 360){
			deg = deg - 360;
		}
		//Update the rotation handle
		d3.select(this).attr("cx",dx).attr("cy",dy);
		//Update the rotation handle line
		d3.selectAll(".hinge"+num).attr("d","M"+[(rectx),(recty)]+"L"+[dx,dy]);
		//Update the path
		var temp = deg;
		deg = deg- prev[num]; //Change deg to only be the offset in rotation
		prev[num] = temp; //Set the new previous rotation
		//Update the points, this currently breaks dragging
		getRotatedPoints(num,deg);
	}
});						
svgContainer.selectAll(".rotate").data(lineData).enter().append("g")
						.attr("class", function(d,i){return "group"+i})
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
	var dx = xBox, dy = yBox-30;
	var theta = Math.atan((yBox-dy)/(xBox-dx))+(prev[i]*Math.PI/180);
	//convert to degrees and offset by 90 for the different coordinate system

	if(dx > xBox){
		dx = (Math.cos(theta)*30) + xBox;
		dy = (Math.sin(theta)*30) + yBox;	
	}else{
		dx = xBox-(Math.cos(theta)*30);
		dy = yBox-(Math.sin(theta)*30);
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

function getRotatedPoints(num,deg){
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
								dx = Math.cos(theta)*hyp + rectx;
								dy = Math.sin(theta)*hyp + recty;
							}else{
								dx = rectx-(Math.cos(theta)*hyp);
								dy = recty-(Math.sin(theta)*hyp);								
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
	heatmap3.clearRect(0,0,canvas3.width,canvas3.height);
	image = heatmap3.createImageData(canvas3.width,canvas3.height);
	d3.select(".legendSVG").remove();
};
function transition() {
	document.getElementById("transition").disabled = true;
	d3.selectAll(".slider").style("pointer-events","none");
	clearAll();
	draggable = false; //Don't allow path dragging during transition

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

									drawSonar(p,p1,i);
									
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
		.each("end",function(d,i){if(i===(sonarType.length-1)){finish()}});
};

function finish(){
		drawHeatMap(7);
		document.getElementById("transition").disabled = false;
		d3.selectAll(".slider").style("pointer-events","auto");
		draggable = true;//Now we can allow dragging again
};

function drawHeatMap(count){
	var colorScale = d3.scale.quantize()
						 .domain([0,6])
						 .range(scaleColors);
	heatmap.clearRect(0,0,canvas.width,canvas.height);
	heatmap2.clearRect(0,0,canvas2.width,canvas2.height);
	var imageData = image.data;	//It's faster to work with a reference
	//Array for percentage of coverage area
	var percents = [0,0,0,0,0,0];
	var max= 0,	min= 255;	
	for (var i=0;i<imageData.length;i+=4){		
		if(imageData[i]>max){
			max = imageData[i];
		}
		if(imageData[i]<min){
			min = imageData[i];
		}		
	}
	//console.log(min, max);
	if(count <= 6){
		max = count;
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
	heatmap3.putImageData(image,0,0);
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
			.attr("stroke","black")
			.attr("stroke-width", 1);
	
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
	if(sonarType[num]==="fw"){
		drawForwardSonar(p,p1,num);
	}else if(sonarType[num]==="ss"){
		drawSideScanSonar(p,p1,num);
	}else{
		console.log("fail");
	}
};
function drawForwardSonar(p,p1,num){	
		heatmap.clearRect(0,0,canvas.width,canvas.height);
		var heading = Math.atan2((p.y-p1.y),(p.x-p1.x));//heading in radians, 0 is 3 O'Clock
		// console.log(Math.atan2((p.y-p1.y),(p.x-p1.x)));
		// var heading = parseFloat(p.alpha);
		if(isNaN(heading)){//we are going vertically, i.e. p1.x == p.x
			if(p.y>p1.y){
				heading = Math.PI/2;
			}else{
				heading = -Math.PI/2;
			}
			console.log(heading);
		}
		//console.log(heading);
		var center = [p.x+sonarRange * Math.cos(heading), p.y+sonarRange * Math.sin(heading)];
		//heatmap.globalCompositeOperation = "lighter";
		heatmap.fillStyle =  "rgba(1,0,0,1)";
		//heatmap.globalAlpha=.5;
		heatmap.beginPath();		
		heatmap.lineTo(center[0]+sonarRange*Math.cos(heading-sonarAngle),center[1]+sonarRange*Math.sin(heading-sonarAngle));
		heatmap.moveTo(p.x,p.y);
		heatmap.arc(center[0],center[1], sonarRange/2, heading-sonarAngle, heading+sonarAngle, false);
		heatmap.fill();
		heatmap.closePath();
		
		var temp = heatmap.getImageData(0,0,canvas.width,canvas.height);
		scaleHeatMap(temp,num);				
};

function drawSideScanSonar(p,p1,num){
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
		//console.log(heading);
		//heatmap.globalCompositeOperation = "lighter";
		var perp = [heading+Math.PI/2, heading-Math.PI/2];
		var center = [p.x+sonarRange * Math.cos(perp[0]), p.y+sonarRange * Math.sin(perp[0]),
					p.x+sonarRange * Math.cos(perp[1]), p.y+sonarRange * Math.sin(perp[1])];
		heatmap.fillStyle = "rgba(1,0,0,1)";
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
		//heatmap2.stroke();		
		var temp = heatmap.getImageData(0,0,canvas.width,canvas.height);
		scaleHeatMap(temp,num);		
};

function scaleHeatMap(temp,num){
	var imageData = image.data, tempData = temp.data;
	for (var i=0;i<imageData.length;i+=4){
		if(tempData[i]!=0){
			imageData[i] = imageData[i] + 1;
		}
	}
	image.data = imageData;
};
function greyscale(){
	  var d = image.data;
	  for (var i=0; i<d.length; i+=4) {
		var r = d[i];
		var g = d[i+1];
		var b = d[i+2];
		// CIE luminance for the RGB
		// The human eye is bad at seeing red and blue, so we de-emphasize them.
		var v = 0.2126*r + 0.7152*g + 0.0722*b;
		d[i] = d[i+1] = d[i+2] = v
	  }
	image.data = d;
	heatmap3.putImageData(image,0,0);
};