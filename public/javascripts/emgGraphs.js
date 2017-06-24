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
var finalEmgGraphs;

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

var emgGraphDataComplete;

$(document).ready(function(){
	emgGraphs = emgGraphData.map(function(podData, podIndex) {
		return $('#pod' + podIndex + '-left').plot(formatEMGFlotData(podIndex, podData), {
			colors: ['#60907e'],
			xaxis: {
				show: false,
				min: 0,
				max: resolution
			},
			yaxis: {
				min: -range,
				max: range,
			},
			shadowSize: 0,
			grid: {
				borderColor: "#427f78",
				borderWidth: 1
			}
		}).data("plot");
	});
});

var formatEMGFlotData = function(index, data) {
	if (index == 3) {
		return [{
			label: "<img src='images/logo.png'>3",
			data: data.map(function(val, t) {
				return [t, val];
			})
		}];
	} else {
		return [{
			label: index.toString(),
			data: data.map(function(val, t) {
				return [t, val];
			})
		}];
	}
}

var updateEMGGraph = function(emgData) {
	emgGraphData.map(function(data, index) {
		emgGraphData[index] = emgGraphData[index].slice(1);
		emgGraphData[index].push(emgData[index]);

		emgGraphs[index].setData(formatEMGFlotData(index, emgGraphData[index]));
		emgGraphs[index].draw();
	})
}

var formatFinalEMGFlotData = function(emgFileData, pod) {
	var axis = emgFileData[0].split(",");
	axis = axis.slice(1);
	emgFileData = emgFileData.slice(1);
	return [{
		label: pod.toString(),
		data: emgFileData.map(function(data) {
			data = data.split(",");
			return [data[0], data[pod + 1]]
		})
	}];
}

/*




*/