var audioCtx = new window.AudioContext(); // Create audio context
var audioElement = document.getElementById("player"); // Grab audio element from the DOM 
var analyser = audioCtx.createAnalyser(); // Create an analyzer sound node
analyser.fftSize = 32; // Size of data set = fftSize / 2
analyser.maxDecibels = -15; // Expand the variance of frequency data by increasing maxDecibels (default: -30)

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
  width: 1400,
  height: 800
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
  console.log("all rings removed");
  d3.selectAll(".complete").remove();
};



var buildRings = function (colorScheme, strokeWidth) {
  
  var init = [];
  init.push(new Circle (svgOptions.width / 2, svgOptions.height / 2, 2, colors[colorScheme].stroke));

  var circles = container.selectAll(".ring")
    .data(init);
    circles.enter().insert("circle", ":first-child")
      .attr("cx", function (d) { return d.x; })
      .attr("cy", function (d) { return d.y; })
      .attr("r", function (d) { return d.r; })
      .attr("stroke", function (d) { return d.color; })
      .attr("stroke-width", strokeWidth)
      .attr("fill", function (d) { return d.color; })
      .attr("fill-opacity", 0);

    circles.transition()
    .duration(2000)
    .attr("r", 1000)
    .attr("class","complete")
    .attr("stroke", colors[colorScheme].theme[0])
    .attr("stroke-width", 100)
    .each("end", function () {
      this.remove();
    });

};

var colors = {
  cool: {
    stroke: "green",
    theme: [
      "#63EFFF",
      "#63BCFF",
      "#637EFF",
      "#6316FF"
    ]
  },
  warm: {
    stroke: "#FF008E",
    theme: [
      "#E8DD0D",
      "#E8A40D",
      "#E85A0D",
      "#E81517"
    ]
  }
};


// var colors = [
//   "#63EFFF",
//   "#63BCFF",
//   "#637EFF",
//   "#6316FF"
// ];
var buildCircles = function (wave, freq, colorScheme) {

// console.log(colors[colorScheme]);
/******* various algorithms to try and understand the data ********/
  
  var bump = 0;
  var treble = 0;

  for (var i = 0; i < 7; i++) {
    bump += freq[i];
    bump /= 2;
  }

  var reduced = _.reduce(wave, function (a, b) {
    return (a + b) / 2;
  });

  // if (bump > 180) {
  //   console.log(bump);
  // }

  // if (reduced > 180) {
  //   console.log("BUMP")
  //   console.log(reduced);
  //   buildRings("green", parseInt(wave[0]/ 20));
  // }

  // if (treble > 150) {
  //   console.log(treble);
    
  // }

  // Random constraints to try and match the heavy bass line
  if (freq[0] > 235 && freq[1] > 220 && wave[0] > 150) {
    buildRings(colorScheme, parseInt(wave[0]/20));
  }

  var circles = [];
  var xInc = svgOptions.width / analyser.frequencyBinCount;
  var xPos = 0;
  var yPos = svgOptions.height/2;

  _.each(freq, function(e, i) {
    var colorIndex = Math.floor(e / 75);
    var color = colors[colorScheme].theme[colorIndex];
    xPos += xInc;
    circles.push(new Circle(xPos, yPos, e/4, color));
  });

  return circles;
};


var animateCircles = function (wave, freq, colorScheme) {
  // Build new circles with new data set
  var jsonCircles = buildCircles(wave, freq, colorScheme);

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

var requestID;

var render = function (colorScheme) {
  animateCircles(getWaveFormData(), getFrequencyData(), colorScheme);
  requestID = requestAnimationFrame(function () {
    return render(colorScheme);
  });
};

var start = function (colorScheme) {
  if (!requestID) {
    render(colorScheme);
  }
};

var stop = function () {
  if (requestID) {
    window.cancelAnimationFrame(requestID);
    requestID = undefined;
  }
};

var updateTheme = function (colorScheme) {
  stop();
  start(colorScheme);
};

play();
updateTheme("warm");