//This tells Myo.js to create the web sockets needed to communnicate with Myo Connect

Myo.on('connected', function(){
	console.log('connected');
	this.streamEMG(true);

	setInterval(function(){
		updateEMGGraph(rawData);
	}, 25)
})

var rawData = [0,0,0,0,0,0,0,0];

var range = 150;
var resolution = 50;
var emgGraphs;

var emgGraphData = [
	Array.apply(null, Array(resolution)).map(Number.prototype.valueOf,0),
	Array.apply(null, Array(resolution)).map(Number.prototype.valueOf,0),
	Array.apply(null, Array(resolution)).map(Number.prototype.valueOf,0),
	Array.apply(null, Array(resolution)).map(Number.prototype.valueOf,0),
	Array.apply(null, Array(resolution)).map(Number.prototype.valueOf,0),
	Array.apply(null, Array(resolution)).map(Number.prototype.valueOf,0),
	Array.apply(null, Array(resolution)).map(Number.prototype.valueOf,0),
	Array.apply(null, Array(resolution)).map(Number.prototype.valueOf,0)
]

$(document).ready(function(){
	emgGraphs = emgGraphData.map(function(podData, podIndex){
		return $('#pod' + podIndex).plot(formatEMGFlotData(podData), {
			colors: ['#60907e'],
			xaxis: {
				show: false,
				min : 0,
				max : resolution
			},
			yaxis : {
				min : -range,
				max : range,
			},
			shadowSize: 0,
			grid : {
				borderColor : "#427f78",
				borderWidth : 1
			}
		}).data("plot");
	});
});

var formatEMGFlotData = function(data){
	return [data.map(function(val, index){
		return [index, val];
	})]
}

var updateEMGGraph = function(emgData){
	emgGraphData.map(function(data, index){
		emgGraphData[index] = emgGraphData[index].slice(1);
		emgGraphData[index].push(emgData[index]);

		emgGraphs[index].setData(formatEMGFlotData(emgGraphData[index]));
		emgGraphs[index].draw();
	})
}

/*




*/