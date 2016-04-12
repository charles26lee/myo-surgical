//This tells Myo.js to create the web sockets needed to communnicate with Myo Connect
Myo.connect("com.myojs.deviceGraphs");

var resolution1 = 100;

var graphColors = ["#0072bd", "#d95319", "#edb120", "#7e2f8e"]

var orientationRange = 1;
var orientationGraph;

var gyroscopeRange = 500;
var gyroscopeGraph;

var accelerometerRange = 5;
var accelerometerGraph;

var arrayOfZeros = Array.apply(null, Array(resolution1)).map(Number.prototype.valueOf,0);

var orientationGraphData = {
	x: arrayOfZeros.slice(0),
	y: arrayOfZeros.slice(0),
	z: arrayOfZeros.slice(0),
	w: arrayOfZeros.slice(0)
}
var gyroscopeGraphData = {
	x: arrayOfZeros.slice(0),
	y: arrayOfZeros.slice(0),
	z: arrayOfZeros.slice(0)
}
var accelerometerGraphData = {
	x: arrayOfZeros.slice(0),
	y: arrayOfZeros.slice(0),
	z: arrayOfZeros.slice(0)
}

var orientationFileData = ["timestamp,w,x,y,z"];
var gyroscopeFileData = ["timestamp,x,y,z"];
var accelerometerFileData = ["timestamp,x,y,z"];
var emgFileData = ["timestamp,emg1,emg2,emg3,emg4,emg5,emg6,emg7,emg8"];

var startTime = 0;
var currentTime = 0;
var isReady = true;
var isRecording = false;

var getElapsedTime = function() {
	return (currentTime - startTime)/1000000;
}

var recordData = function(fileData, newData) {
	var formattedData = getElapsedTime() + "," + Object.keys(newData).map(function(axis) {
		return newData[axis];
	}).join();
	fileData.push(formattedData);
}

Myo.on("connected", function() {
	console.log("connected");
	this.streamEMG(true);
});

$(document).ready(function(){
	Myo.on("orientation", function(newData, timestamp) {
		if (isReady && !isRecording) {
			startTime = timestamp;
		} else if (isRecording) {
			$("#timer").text(getElapsedTime().toFixed(2));
			recordData(orientationFileData, newData);
		}
		
		if ((Math.asin(Math.max(-1, Math.min(1, 2*(newData.y*newData.w - newData.x*newData.z)))) + Math.PI/2)*18/Math.PI > 15) {
			if (getElapsedTime() > 5 && isRecording) {
				$("#recording").removeClass("btn-danger");
				$("#completed").addClass("btn-success");
				$("#saveModal").modal("show");
				isRecording = false;
				isReady = false;
			} else if (!isRecording && isReady) {
				$("#ready").removeClass("btn-warning");
				$("#recording").addClass("btn-danger");
				isRecording = true;
			}
		}
		
		currentTime = timestamp;
		updateGraph(orientationGraph, orientationGraphData, newData);
	});

	Myo.on("gyroscope", function(newData) {
		if (isRecording) {
			recordData(gyroscopeFileData, newData);
		}
		updateGraph(gyroscopeGraph, gyroscopeGraphData, newData);
	});

	Myo.on("accelerometer", function(newData) {
		if (isRecording) {
			recordData(accelerometerFileData, newData);
		}
		updateGraph(accelerometerGraph, accelerometerGraphData, newData);
	});

	Myo.on('emg', function(data){
		rawData = data;
		if (isRecording) {
			recordData(emgFileData, data);
		}
	})

	orientationGraph = $(".orientationGraph").plot(formatFlotData(orientationGraphData), {
		colors: graphColors,
		xaxis: {
			show: false,
			min : 0,
			max : resolution1
		},
		yaxis: {
			min : -orientationRange,
			max : orientationRange,
		},
		shadowSize: 0,
		grid : {
			borderColor : "#427F78",
			borderWidth : 1
		}
	}).data("plot");
	
	gyroscopeGraph = $(".gyroscopeGraph").plot(formatFlotData(gyroscopeGraphData), {
		colors: graphColors,
		xaxis: {
			show: false,
			min : 0,
			max : resolution1
		},
		yaxis : {
			min : -gyroscopeRange,
			max : gyroscopeRange,
		},
		shadowSize: 0,
		grid : {
			borderColor : "#427F78",
			borderWidth : 1
		}
	}).data("plot");
	
	accelerometerGraph = $(".accelerometerGraph").plot(formatFlotData(accelerometerGraphData), {
		colors: graphColors,
		xaxis: {
			show: false,
			min : 0,
			max : resolution1
		},
		yaxis : {
			min : -accelerometerRange,
			max : accelerometerRange,
		},
		shadowSize: 0,
		grid : {
			borderColor : "#427F78",
			borderWidth : 1
		}
	}).data("plot");
	
	$("#save").on("click", function() {
		var zip = new JSZip();
		
		var date = new Date();
		var dateParts = date.toLocaleDateString().split("/");
		var dateStamp = dateParts[2] + dateParts[1] + dateParts[0];
		
		var trial = zip.folder(($("#trial-number").val() || "test") + "_" + ($("#trial-type").val() || "test"));
		trial.file(dateStamp + "-orientation.csv", orientationFileData.join("\n"));
		trial.file(dateStamp + "-gyroscope.csv", gyroscopeFileData.join("\n"));
		trial.file(dateStamp + "-accelerometer.csv", accelerometerFileData.join("\n"));
		trial.file(dateStamp + "-emg.csv", emgFileData.join("\n"));
		
		var content = zip.generate({type: "blob"});
		
		saveAs(content, ($("#user-name").val() || "we just want to graduate") + ".zip");
		
		$(".reset").trigger("click");
	});

	$(".reset").on("click", function() {
		$("#completed").removeClass("btn-success");
		$("#ready").addClass("btn-warning");
		$("#timer").text("0.00");
		
		orientationFileData = ["timestamp,w,x,y,z"];
		gyroscopeFileData = ["timestamp,x,y,z"];
		accelerometerFileData = ["timestamp,x,y,z"];
		emgFileData = ["timestamp,emg1,emg2,emg3,emg4,emg5,emg6,emg7,emg8"];
		
		isReady = true;
	});
});

var formatFlotData = function(graphData){
	return Object.keys(graphData).map(function(axis){
		return {
			label : axis + " axis",
			data : graphData[axis].map(function(val, index){
				return [index, val]
			})
		}
	});
}

var updateGraph = function(graph, graphData, newData){
	Object.keys(graphData).map(function(axis){
		graphData[axis] = graphData[axis].slice(1);
		graphData[axis].push(newData[axis]);
	});
	
	console.log(formatFlotData(graphData));
	graph.setData(formatFlotData(graphData));
	graph.draw();
}

/*




*/