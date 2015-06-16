var audioCtx = new window.AudioContext(); // Create audio context
var audioElement = document.getElementById("player"); // Grab audio element from the DOM 
var analyser = audioCtx.createAnalyser(); // Create an analyzer sound node
analyser.fftSize = 64; // Size of data set = fftSize / 2

// Wait for audio element to be ready
audioElement.addEventListener("canplay", function() {
  var source = audioCtx.createMediaElementSource(audioElement); // Define the audio element as the streaming source 
  source.connect(analyser); // Connect the source to the analyzer node in the middle of the audio graph
  analyser.connect(audioCtx.destination); // Have the analyzer node connect to the destination
});

// Extract current frequency data from audio element
var getFrequencyData = function () {
  var frequencyData = new Uint8Array(analyser.frequencyBinCount);
  analyser.getByteFrequencyData(frequencyData);
  return frequencyData;
};

// Extract current wave data from audio element
var getWaveFormData = function () {
  var waveData = new Uint8Array(analyser.frequencyBinCount);
  analyser.getByteTimeDomainData(waveData);
  return waveData;
};

// At this point I have access to an array of numbers generated based on frequency.

var play = function () {
  audioElement.play();
};

var pause = function () {
  audioElement.pause();
};

var svgOptions = {
  width: 1000,
  height: 500
};

var svgContainer = d3.select("body")
   .append("svg")
   .attr("width", svgOptions.width)
   .attr("height", svgOptions.height)
   .attr("class", "svg-container");


// Circle class to define cx cy radius and color attribute
var Circle = function (x, y, r, color) {
  this.x = x;
  this.y = y;
  this.r = r;
  this.color = color;
};

// Generate a random X or Y coordinate based on svgOptions
var randX = function () { return Math.floor(Math.random() * svgOptions.width); };
var randY = function () { return Math.floor(Math.random() * svgOptions.height); };

var buildCircles = function (data) {
  var colors = [
    '#63EFFF',
    '#63BCFF',
    '#637EFF',
    '#6316FF'
  ];

  var circles = [];
  var xInc = svgOptions.width / analyser.frequencyBinCount;
  // var yInc = svgOptions.height / analyser.frequencyBinCount;
  var xPos = 0;
  var yPos = svgOptions.height/2;

  _.each(data, function(e, i) {
    var colorIndex = Math.floor(e / 85);
    console.log(colorIndex);
    xPos += xInc;
    circles.push(new Circle(xPos, yPos, e/10, colors[colorIndex]));
  });

  return circles;
};


var animateCircles = function (freqData) {
  // Build new circles with new data set
  var jsonCircles = buildCircles(freqData);

  // Update
  var circles = svgContainer.selectAll("circle")
    .data(jsonCircles)
    .attr("cx", function (d) { return d.x; })
    .attr("cy", function (d) { return d.y; })
    .attr("r", function (d) { return d.r; })
    .style("fill", function(d) { return d.color; });

  // Enter
  circles.enter().append("circle")
     .attr("cx", function (d) { return d.x; })
     .attr("cy", function (d) { return d.y; })
     .attr("r", function (d) { return d.r; })
     .style("fill", function(d) { return d.color; });

  // Exit
  circles.exit().remove();
};

var animateBackgroundColor = function (freqData) {

  

  var colors = [
    '#21E5FF',
    '#21D1FF',
    '#21C1FF',
    '#21CCFF',
    '#21CAFF',
    '#21BAFF',
    '#21AAFF',
    '#21D1FF',
    '#21A1FF',
    '#2191FF'
  ];

  var index = Math.floor(Math.random()*colors.length);
  svgContainer.style('background-color', colors[index]).transition(1500);

};






var animateAll = function () {
  var updatedData = getFrequencyData();
  animateCircles(updatedData);
  // animateBackgroundColor(updatedData);
};

var render = function () {
  requestAnimationFrame(render);
  animateAll();
};


// play();
// render();
