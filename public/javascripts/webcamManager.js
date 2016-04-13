var frames = new Array();
var canvas = document.createElement("canvas");
var ctx = canvas.getContext("2d");
var CANVAS_HEIGHT = canvas.height;
var CANVAS_WIDTH = canvas.width;

var recordVideo = function() {
	ctx.drawImage(document.getElementById("videoElement"), 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
	
	var url = canvas.toDataURL("image/webp", 1);
	frames.push(url);
}

$(document).ready(function() {
	var video = document.querySelector("#videoElement");
	
	navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia || navigator.oGetUserMedia;
	 
	if (navigator.getUserMedia) {
		navigator.getUserMedia({video: true}, handleVideo, videoError);
	}
	 
	function handleVideo(stream) {
		video.src = window.URL.createObjectURL(stream);
	}
	 
	function videoError(e) {
		// do something
	}
});