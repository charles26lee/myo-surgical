//This tells Myo.js to create the web sockets needed to communicate with Myo Connect
Myo.connect("com.myojs.deviceGraphs");

var arms = ["right", "left"];

var resolution = 100;
var arrayOfZeros = Array.apply(null, new Array(resolution)).map(Number.prototype.valueOf, 0);

var graphColors = ["#0072bd", "#d95319", "#edb120", "#7e2f8e"];

var orientationRange = 1;
var orientationGraphs = {};

var gyroscopeRange = 500;
var gyroscopeGraphs = {};

var accelerometerRange = 5;
var accelerometerGraphs = {};

var orientationDataNames = ["timestamp","w","x","y","z"];
var gyroscopeDataNames = ["timestamp","x","y","z"];
var accelerometerDataNames = ["timestamp","x","y","z"];
var emgDataNames = ["timestamp","emg1","emg2","emg3","emg4","emg5","emg6","emg7","emg8"];

var orientationFileData = initializeFileData(orientationDataNames);
var gyroscopeFileData = initializeFileData(gyroscopeDataNames);
var accelerometerFileData = initializeFileData(accelerometerDataNames);
var emgFileData = initializeFileData(emgDataNames);

function initializeFileData(dataNames) {
    var fileData = {};
    for (var i = 0 ; i < arms.length; ++i) {
        var arm = arms[i];
        fileData[arm] = [];
        fileData[arm].push(dataNames.join());
    }
    return fileData;
}

function initializeGraph(dataNames) {
    var graphKeys = dataNames.slice(1);
    var graphData = {};
    for (var i = 0; i < arms.length; ++i) {
        graphData[arms[i]] = {};
        for (var j = 0; j < graphKeys.length; ++j) {
            graphData[arms[i]][graphKeys[j]] = arrayOfZeros.slice(0);
        }
    }
    return graphData;
}

var orientationGraphData = initializeGraph(orientationDataNames);
var gyroscopeGraphData = initializeGraph(gyroscopeDataNames);
var accelerometerGraphData = initializeGraph(accelerometerDataNames);

var startTime = 0;
var currentTime = 0;
var isReady = true;
var isRecording = false;

function addEvents(myo) {
    myo.streamEMG(true);

    var arm = myo.arm;

    myo.on("orientation", function (newData, timestamp) {
        if (isReady && !isRecording) {
            startTime = timestamp;
        } else if (isRecording) {
            $("#timer").text(getElapsedTime().toFixed(2));
            recordVideo();
            recordData(orientationFileData[arm], newData);
        }

        if (arm === "right" && (Math.asin(Math.max(-1, Math.min(1, 2 * (newData.y * newData.w - newData.x * newData.z)))) + Math.PI / 2) * 18 / Math.PI > 15) {
            if (getElapsedTime() > 5 && isRecording) {
                $("#recording").removeClass("btn-danger");
                $("#completed").addClass("btn-success");
                $("#save-modal").modal("show");
                cancelAnimationFrame(rafId);
                // plotFinalGraphs();
                isRecording = false;
                isReady = false;
            } else if (!isRecording && isReady) {
                $("#ready").removeClass("btn-warning");
                $("#recording").addClass("btn-danger");
                $("#gesture-protocol-close").trigger("click");
                isRecording = true;
            }
        }

        currentTime = timestamp;
        updateGraph(orientationGraphs[arm], orientationGraphData[arm], newData);
    });

    myo.on("gyroscope", function (newData) {
        if (isRecording) {
            recordData(gyroscopeFileData[arm], newData);
        }
        updateGraph(gyroscopeGraphs[arm], gyroscopeGraphData[arm], newData);
    });

    myo.on("accelerometer", function (newData) {
        if (isRecording) {
            recordData(accelerometerFileData[arm], newData);
        }
        updateGraph(accelerometerGraphs[arm], accelerometerGraphData[arm], newData);
    });

    myo.on('emg', function (newData) {
        if (isRecording) {
            recordData(emgFileData[arm], newData);
        }
        emgRawData[arm] = newData;
    });

    setInterval(function(){
        updateEMGGraph(emgGraphs[arm], emgGraphData[arm], emgRawData[arm]);
    }, 25);
}

var graphs = ["orientation", "gyroscope", "accelerometer", "emg"];

function removeEvents(myo) {
    myo.streamEMG(false);

    var arm = myo.arm;

    for (var i = 0; i < graphs.length; ++i) {
        myo.off(graphs[i]);
    }
}

var getElapsedTime = function () {
    return (currentTime - startTime) / 1000000;
};

function recordData(fileData, newData) {
    var formattedData = getElapsedTime() + "," + Object.keys(newData).map(function (axis) {
            return newData[axis];
        }).join();
    fileData.push(formattedData);
}

function formatFlotData(graphData) {
    return Object.keys(graphData).map(function (axis) {
        return {
            label: axis + " axis",
            data: graphData[axis].map(function (val, index) {
                return [index, val]
            })
        }
    });
}

function updateGraph(graph, graphData, newData) {
    Object.keys(graphData).map(function (axis) {
        graphData[axis] = graphData[axis].slice(1);
        graphData[axis].push(newData[axis]);
    });

    graph.setData(formatFlotData(graphData));
    graph.draw();
}

function formatFinalFlotData(fileData) {
    var axis = fileData[0].split(",");
    axis = axis.slice(1);
    fileData = fileData.slice(1);
    return axis.map(function (val, pos) {
        return {
            label: val + " axis",
            data: fileData.map(function (data) {
                data = data.split(",");
                return [data[0], data[pos + 1]]
            })
        }
    });
}

function plotFinalGraphs() {
    var arm = "left";

    $(".finalOrientationGraph").plot(formatFinalFlotData(orientationFileData[arm]), {
        colors: graphColors,
        xaxis: {
            min: 0,
            max: parseFloat(orientationFileData[arm][orientationFileData[arm].length - 1])
        },
        yaxis: {
            min: -orientationRange,
            max: orientationRange
        },
        shadowSize: 0,
        grid: {
            borderColor: "#427F78",
            borderWidth: 1
        }
    }).data("plot");

    $(".finalGyroscopeGraph").plot(formatFinalFlotData(gyroscopeFileData[arm]), {
        colors: graphColors,
        xaxis: {
            min: 0,
            max: parseFloat(gyroscopeFileData[arm][gyroscopeFileData[arm].length - 1])
        },
        yaxis: {
            min: -gyroscopeRange,
            max: gyroscopeRange
        },
        shadowSize: 0,
        grid: {
            borderColor: "#427F78",
            borderWidth: 1
        }
    }).data("plot");

    $(".finalAccelerometerGraph").plot(formatFinalFlotData(accelerometerFileData[arm]), {
        colors: graphColors,
        xaxis: {
            min: 0,
            max: parseFloat(accelerometerFileData[arm][accelerometerFileData[arm].length - 1])
        },
        yaxis: {
            min: -accelerometerRange,
            max: accelerometerRange
        },
        shadowSize: 0,
        grid: {
            borderColor: "#427F78",
            borderWidth: 1
        }
    }).data("plot");

    emgGraphData[arm].map(function (val, index) {
        return $("#finalPod" + index).plot(formatFinalEMGFlotData(emgFileData[arm], index), {
            colors: ['#60907e'],
            xaxis: {
                min: 0,
                max: parseFloat(emgFileData[arm][emgFileData[arm].length - 1])
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

$(document).ready(function () {
    for (var i = 0; i < arms.length; ++i) {
        var arm = arms[i];

        orientationGraphs[arm] = $(".orientationGraph." + arm).plot(formatFlotData(orientationGraphData[arm]), {
            colors: graphColors,
            xaxis: {
                show: false,
                min: 0,
                max: resolution
            },
            yaxis: {
                min: -orientationRange,
                max: orientationRange
            },
            shadowSize: 0,
            grid: {
                borderColor: "#427F78",
                borderWidth: 1
            }
        }).data("plot");

        gyroscopeGraphs[arm] = $(".gyroscopeGraph." + arm).plot(formatFlotData(gyroscopeGraphData[arm]), {
            colors: graphColors,
            xaxis: {
                show: false,
                min: 0,
                max: resolution
            },
            yaxis: {
                min: -gyroscopeRange,
                max: gyroscopeRange
            },
            shadowSize: 0,
            grid: {
                borderColor: "#427F78",
                borderWidth: 1
            }
        }).data("plot");

        accelerometerGraphs[arm] = $(".accelerometerGraph." + arm).plot(formatFlotData(accelerometerGraphData[arm]), {
            colors: graphColors,
            xaxis: {
                show: false,
                min: 0,
                max: resolution
            },
            yaxis: {
                min: -accelerometerRange,
                max: accelerometerRange
            },
            shadowSize: 0,
            grid: {
                borderColor: "#427F78",
                borderWidth: 1
            }
        }).data("plot");
    }

    $("#save").on("click", function () {
        var zip = new JSZip();

        var date = new Date();
        var dateParts = date.toLocaleDateString().split("/");
        var dateStamp = dateParts[2] + dateParts[1] + dateParts[0];

        var trial = zip.folder($("#trial-number").val() || "test");

        for (var i = 0; i < arms.length; ++i) {
            var arm = arms[i];
            trial.file(arm + "-" + dateStamp + "-orientation.csv", orientationFileData[arm].join("\n"));
            trial.file(arm + "-" + dateStamp + "-gyroscope.csv", gyroscopeFileData[arm].join("\n"));
            trial.file(arm + "-" + dateStamp + "-accelerometer.csv", accelerometerFileData[arm].join("\n"));
            trial.file(arm + "-" + dateStamp + "-emg.csv", emgFileData[arm].join("\n"));
        }

        var content = zip.generate({type: "blob"});

        saveAs(content, ($("#user-name").val() || "we just want to graduate") + ".zip");
    });

    $("#save-video").on("click", function () {
        var date = new Date();
        var dateParts = date.toLocaleDateString().split("/");
        var dateStamp = dateParts[2] + dateParts[1] + dateParts[0];

        saveAs(Whammy.fromImageArray(frames, 1000 / 60), dateStamp + "-video.webm");
    });

    $(".reset").on("click", function () {
        $("#completed").removeClass("btn-success");
        $("#ready").addClass("btn-warning");
        $("#timer").text("0.00");

        $("#user-name").val("");
        $("#trial-number").val("");
        $("#trial-type").val("");

        orientationFileData = initializeFileData();
        gyroscopeFileData = initializeFileData();
        accelerometerFileData = initializeFileData();
        emgFileData = initializeFileData();
        frames = [];

        isReady = true;
    });

    Myo.on("arm_synced", function () {
        console.log(this.arm + " arm synced.");
        addEvents(this);
    });

    Myo.on("arm_unsynced", function () {
        console.log(this.arm + " arm unsynced.");
        removeEvents(this);
    });
});
