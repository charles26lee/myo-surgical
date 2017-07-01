//This tells Myo.js to create the web sockets needed to communicate with Myo Connect

var emgResolution = 50;

var emgPods = 8;

function initializeRawData() {
    var rawData = {};
    for (var i = 0; i < arms.length; ++i) {
        var arm = arms[i];
        rawData[arm] = [];
        for (var j = 0; j < emgPods; ++j) {
            rawData[arm].push(0);
        }
    }
    return rawData;
}

var emgRawData = initializeRawData();

var emgRange = 150;
var emgGraphs = {};

var emgGraphData = initializeEmgGraph();

function initializeEmgGraph() {
    var emgGraphData = {};
    for (var i = 0; i < arms.length; ++i) {
        var arm = arms[i];
        emgGraphData[arm] = [];
        for (var j = 0; j < emgPods; ++j) {
            emgGraphData[arm].push(Array.apply(null, new Array(emgResolution)).map(Number.prototype.valueOf,0));
        }
    }
    return emgGraphData;
}


function formatEMGFlotData(index, data) {
    if (index === 3) {
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

function updateEMGGraph(emgGraphs, emgGraphData, emgData) {
    emgGraphData.map(function(data, index) {
        emgGraphData[index] = emgGraphData[index].slice(1);
        emgGraphData[index].push(emgData[index]);

        emgGraphs[index].setData(formatEMGFlotData(index, emgGraphData[index]));
        emgGraphs[index].draw();
    })
}

function formatFinalEMGFlotData(emgFileData, pod) {
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

$(document).ready(function(){
    for (var i = 0; i < arms.length; ++i) {
        var arm = arms[i];
        emgGraphs[arm] = emgGraphData[arm].map(function(podData, podIndex) {
            return $('#pod' + podIndex + '-' + arm).plot(formatEMGFlotData(podIndex, podData), {
                colors: ['#60907e'],
                xaxis: {
                    show: false,
                    min: 0,
                    max: emgResolution
                },
                yaxis: {
                    min: -emgRange,
                    max: emgRange
                },
                shadowSize: 0,
                grid: {
                    borderColor: "#427f78",
                    borderWidth: 1
                }
            }).data("plot");
        });
    }
});
