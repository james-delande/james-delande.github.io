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

var sonarRange = 100, sonarAngle = Math.PI/4,
	last = 0, samples=0, draggable = true;

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
	colors.push(d3.rgb("red"));
	colors.push(d3.rgb("green"));
var sonarType = new Array();
	sonarType.push("fw");
	sonarType.push("ss");
function updateVehicle(num){
		var path = d3.selectAll(".path"+num)[0][0];
		var l = path.getTotalLength();
		var time = xSliderScale.invert(d3.select(".handle").attr("cx"))/100;
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
		d.x = Math.max(0, Math.min(w, d3.event.x));
		d.y = Math.max(0, Math.min(h, d3.event.y));
		//set point location
		d3.select(this).attr("cx", d.x).attr("cy",d.y);
		//Update vehicle location 
		updateVehicle(num);
		//Now working with rest of line data, need to invert to SVG coordinate system for continuity
		d.x = xscale.invert(d.x);
		d.y = yscale.invert(d.y);
		//Update path with new line data
		d3.selectAll(".path"+num).attr("d", lineFunction(lineData[num]));

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
var rotatePaths = d3.behavior.drag()
	//.origin(function(d){return d;})
	.on("drag", function(d) {
	//only drag if it is allowed at the time
	if(draggable){	
		console.log(this);
		var num = this.classList[0].slice(-1); //group number we are working with
		var x = parseFloat(d3.select(this).attr("cx"));
		var y = parseFloat(d3.select(this).attr("cy"));		
		var rect = d3.select(".center"+num);
		var rectx = parseFloat(rect.attr("x")), recty = parseFloat(rect.attr("y"));
		var dx = Math.max(0, Math.min(w, d3.event.x));
		var dy = Math.max(0, Math.min(h, d3.event.y));
		var theta = Math.atan((recty-dy)/(rectx-dx));
		var dtheta = Math.atan((recty-y)/(rectx-x))-theta;
		console.log(theta*180/Math.PI);
		if(dx > rectx){
			dx = (Math.cos(theta)*30) + rectx;
			dy = (Math.sin(theta)*30) + recty;		
		}else{
			dx = rectx-(Math.cos(theta)*30);
			dy = recty-(Math.sin(theta)*30);
		}

		d3.select(this).attr("cx",dx).attr("cy",dy);
		d3.selectAll(".hinge"+num).attr("d","M"+[(rectx+4),(recty+4)]+"L"+[dx,dy]);
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
	var xRotate = Math.floor(bbox.x + bbox.width/2.0);
	var yRotate = Math.floor(bbox.y + bbox.height/2.0);
	
	d3.select(".group"+i).append("path")
				.attr("class", "hinge"+i +" rotate"+i)
				.attr("d","M"+[(xRotate),(yRotate)]+"V"+(yRotate-30))
				.attr("stroke","gray")
				.style("stroke-dasharray", ("2,1"));
				
	d3.select(".group"+i).append("circle")
				.attr("class", "handle"+i +" rotate"+i)
				.attr("cx",xRotate)
				.attr("cy",yRotate-30)
				.attr("r",5)
				.attr("stroke","black")
				.attr("fill", "gray")
				.call(rotatePaths);
				
	d3.select(".group"+i).append("rect")
			.attr("class", "center"+i)
			.attr("x",xRotate-4)
			.attr("y",yRotate-4)
			.attr("width",8)
			.attr("height",8)
			.attr("fill", d3.select(node).attr("stroke"))
			.attr("stroke","black");
};
function getRotatedPath(num){
		var path = Raphael.transformPath(d3.select(".path"+num).attr("d"),"R15"); //get the transformed path
		d3.selectAll(".path"+num).attr("d",path.toString());//Rotate the path
		updateVehicle(num);
	};

function clearAll(){
	heatmap.clearRect(0,0,canvas.width,canvas.height);
	heatmap2.clearRect(0,0,canvas2.width,canvas2.height);
	heatmap3.clearRect(0,0,canvas3.width,canvas3.height);
	image = heatmap3.createImageData(canvas3.width,canvas3.height);
	d3.select(".legendSVG").remove();
	last = 0;
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
									if(sonarType[i]==="fw"){
										drawForwardSonar(p,p1,i);
									}else if(sonarType[i]==="ss"){
										drawSideScanSonar(p,p1,i);
									}else{
										console.log("i = "+i);
									}
									return "translate("+[(p.x-d.getPointAtLength(0).x), (p.y - d.getPointAtLength(0).y)] + ")";
								}
							})
		.each("start",function(d,i){
					console.log(d);
					var p = d.getPointAtLength(0);
					d3.selectAll(".UUV"+i).attr({
											cx: p.x,
											cy: p.y
										});
		})
		.each("end",function(d,i){if(i===(sonarType.length-1)){finish()}});
};

function finish(){
		var colorScale = d3.scale.quantize()
						 .domain([0,6])
						 .range(scaleColors);
		drawHeatMap(colorScale,6);
		document.getElementById("transition").disabled = false;
		d3.selectAll(".slider").style("pointer-events","auto");
		draggable = true;//Now we can allow dragging again
};

function drawHeatMap(colorScale,count){
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
	console.log(min, max);
	if(count === 1){
		max = 6;
	}
	for (var i=0;i<imageData.length;i+=4){
		var col = colorScale(Math.round((imageData[i]/max)*6));
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
	console.log(percents);
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

function instant(count){
	var colorScale = d3.scale.quantize()
					 .domain([0,6])
					 .range(scaleColors);
	drawHeatMap(colorScale,count);
	//image = heatmap3.createImageData(canvas2.width,canvas2.height); 
};
function drawInTime(start, end){
	var count = 0;
	clearAll();
	d3.selectAll(".vehicle")
			.data(d3.selectAll(".paths")[0])
			.each(function(d,i){ 
								var l = d.getTotalLength();
								var p,p1;
								//console.log(timeScale(start),timeScale(end));
								for(time=timeScale(start);time<=timeScale(end);time+=.01){
									p = d.getPointAtLength(time * l);
									if(time-.0001 < 0){
										p1 = d.getPointAtLength(0);
									}else{
										p1 = d.getPointAtLength((time-.0001) * l);
									}
									if(sonarType[i]==="fw"){
										drawForwardSonar(p,p1,i);
									}else if(sonarType[i]==="ss"){
										drawSideScanSonar(p,p1,i);
									}else{
										console.log("fail");
									}
									count++;
								}									
								p = d.getPointAtLength(timeScale(end)*l);
								d3.select(this).attr({
									cx: p.x,
									cy: p.y									
								});
								if(i===(sonarType.length-1)){
									instant(count/2)
								}
				});		
};	


function drawForwardSonar(p,p1,color){		
		heatmap.clearRect(0,0,canvas.width,canvas.height);
		var heading = Math.atan2((p.y-p1.y),(p.x-p1.x));//heading in radians, 0 is 3 O'Clock
		// console.log(Math.atan2((p.y-p1.y),(p.x-p1.x)));
		// var heading = parseFloat(p.alpha);
		// console.log(parseFloat(Raphael.rad(p.alpha)));
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
		heatmap.fillStyle =  "rgba(1,1,1,1)";
		//heatmap.globalAlpha=.5;
		heatmap.beginPath();		
		heatmap.lineTo(center[0]+sonarRange*Math.cos(heading-sonarAngle),center[1]+sonarRange*Math.sin(heading-sonarAngle));
		heatmap.moveTo(p.x,p.y);
		heatmap.arc(center[0],center[1], sonarRange/2, heading-sonarAngle, heading+sonarAngle, false);
		heatmap.fill();
		heatmap.closePath();
		
		var temp = heatmap.getImageData(0,0,canvas2.width,canvas2.height);
		scaleHeatMap(temp);				
};

function drawSideScanSonar(p,p1,color){
		//console.log(color);
		//console.log(p);
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
		//console.log(heading);
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
		var temp = heatmap2.getImageData(0,0,canvas2.width,canvas2.height);
		scaleHeatMap(temp);		
};

function scaleHeatMap(temp){
	samples++;
	var imageData = image.data, tempData = temp.data;
	for (var i=0;i<imageData.length;i+=4){
		if(tempData[i]!=0){
			imageData[i] = imageData[i] + 1;
		}
	}
	image.data = imageData;
};