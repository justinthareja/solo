var audioCtx = new window.AudioContext(); // Create audio context
var audioElement = document.getElementById("player"); // Grab audio element from the DOM 
var analyser = audioCtx.createAnalyser(); // Create an analyzer sound node
analyser.fftSize = 32; // Size of data set = fftSize / 2

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

var container = d3.select("body")
  .append("svg")
  .attr("width", svgOptions.width)
  .attr("height", svgOptions.height)
  .attr("class", "svg-container");

var rings = d3.select("body")
  .append("div")
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


var removeRings = function () {
  console.log('removed')
  d3.selectAll(".complete").remove();
};


// var isBuilding = false;

var buildRings = function (color) {
  
  // if (isBuilding) {
  //   return;
  // }

  // isBuilding = true;

  var init = [];
  init.push(new Circle (svgOptions.width / 2, svgOptions.height / 2, 2, color));

  var circles = container.selectAll(".ring")
    .data(init);
    // .attr("cx", function (d) { return d.x; })
    // .attr("cy", function (d) { return d.y; })
    circles.enter().append("circle")
      .attr("cx", function (d) { return d.x; })
      .attr("cy", function (d) { return d.y; })
      .attr("r", function (d) { return d.r; })
      .attr("stroke", function (d) { return d.color; })
      .attr("stroke-width", 5)
      .attr("fill-opacity", 0);

      // .style("fill", function(d) { return d.color; });
    circles.transition()
    .duration(1500)
    .attr("r", 750)
    .attr("class","complete")
    .each("end", function () {
      this.remove();
    });

};

var buildCircles = function (wave, freq) {

  var colors = [
    "#63EFFF",
    "#63BCFF",
    "#637EFF",
    "#6316FF"
  ];

  if (freq[0] >= 255 && freq[1] >= 255 && wave[0] > 170) {
    buildRings('black');
  }

  var circles = [];
  var xInc = svgOptions.width / analyser.frequencyBinCount;
  // var yInc = svgOptions.height / analyser.frequencyBinCount;
  var xPos = 0;
  var yPos = svgOptions.height/2;

  _.each(freq, function(e, i) {
    var colorIndex = Math.floor(e / 85);
    // if (wave[0] > 190) {
    //   // console.log(wave[i]);
    //   buildRings(colors[colorIndex]);
    // }
    xPos += xInc;
    circles.push(new Circle(xPos, yPos, e/5, colors[colorIndex]));
  });

  return circles;
};


var animateCircles = function (wave, freq) {
  // Build new circles with new data set
  var jsonCircles = buildCircles(wave, freq);

  // Update
  var circles = container.selectAll(".meter-circle")
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
    .attr("class", "meter-circle")
    .style("fill", function(d) { return d.color; });

  // Exit
  circles.exit().remove();
};



var animateAll = function () {
  animateCircles(getWaveFormData(), getFrequencyData());
  // hollowCircle(updatedData);
  // animateBackgroundColor(updatedData);
};

var render = function () {
  requestAnimationFrame(render);
  animateAll();
};


// setInterval(removeRings, 3000);
// var animateBackgroundColor = function (freqData) {

//   var colors = [
//     "#21E5FF",
//     "#21D1FF",
//     "#21C1FF",
//     "#21CCFF",
//     "#21CAFF",
//     "#21BAFF",
//     "#21AAFF",
//     "#21D1FF",
//     "#21A1FF",
//     "#2191FF"
//   ];

//   var index = Math.floor(Math.random()*colors.length);
//   container.style("background-color", colors[index]).transition(1500);

// };

// play();
// render();
