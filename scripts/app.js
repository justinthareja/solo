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

var currentTheme = undefined;
var themes = {
  cool: {
    stroke: "green",
    compliment: "warm",
    colors: [
      "#63EFFF",
      "#63BCFF",
      "#637EFF",
      "#6316FF"
    ]
  },
  warm: {
    stroke: "#FF008E",
    compliment: "cool",
    colors: [
      "#E8DD0D",
      "#E8A40D",
      "#E85A0D",
      "#E81517"
    ]
  },
  watermelon: {
    stroke: "FF4864",
    colors: [
      "#FFA59E",
      "#DFDFE8",
      "#3BFF77",
      "#E8C343"
    ]
  }
};

// Button class used to represent theme buttons
var Button = function (x, y, h, w, id) {
  this.x = x;
  this.y = y;
  this.height = h;
  this.width = w;
  this.id = id;
};

// Circle class to define cx cy radius and color attribute
var Circle = function (x, y, r, color) {
  this.x = x;
  this.y = y;
  this.r = r;
  this.color = color;
};

var svgOptions = {
  width: 1400,
  height: 1000
};

// Append SVG visualization canvas to body based on svgOptions
var canvas = d3.select("body")
  .append("svg")
  .attr("width", svgOptions.width)
  .attr("height", svgOptions.height)
  .attr("id", "svg-canvas");

canvas.append("svg")
  .attr("width", 50)
  .attr("height", 50)
  .attr("id", "icon")
  .attr("viewBox", "0 0 5 5")
  .attr("xmlns","http://www.w3.org/2000/svg")
  .append("path")
    .attr("d", "M2 1 h1 v1 h1 v1 h-1 v1 h-1 v-1 h-1 v-1 h1 z")


// Helper functions to format data for d3
var buildThemeButtons = function (themes) {
  var buttons = [];
  var padding = 10;
  var xPos = 50, yPos = 10;
  var height = 30, width = 80;
  var xStep = width + padding;

  _.each(themes, function (theme, key) {
    buttons.push(new Button (xPos, yPos, height, width, key));
    xPos += xStep;
  });

  return buttons;
};

// Append theme buttons to canvas
var appendThemes = function () {
  canvas.selectAll(".button")
    .data(buildThemeButtons(themes))
    .enter()
    .append("rect")
    .attr("height", function(d) { return d.height; })
    .attr("width", function(d) { return d.width; })
    .attr("y", function(d) { return d.y; })
    .attr("x", function(d) { return d.x; })
    .attr("id", function(d) { return d.id; })
    .attr("class", "button")
    .attr("fill", function(d) { return themes[d.id].colors[1]; });

  addClickListeners(themes);
};

// Generate a random X or Y coordinate based on svgOptions
var randX = function () { return Math.floor(Math.random() * svgOptions.width); };
var randY = function () { return Math.floor(Math.random() * svgOptions.height); };


var buildRings = function (colorTheme, strokeWidth) {
  
  var init = [];
  init.push(new Circle (svgOptions.width / 2, svgOptions.height / 2, 2, themes[colorTheme].stroke));

  var circles = canvas.selectAll(".ring")
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
    .attr("stroke", themes[colorTheme].colors[0])
    .attr("stroke-width", strokeWidth * 10)
    .each("end", function () {
      this.remove();
    });

};

var buildCircles = function (wave, freq, colorTheme) {
  
  var circles = [];
  var xInc = svgOptions.width / analyser.frequencyBinCount;
  var xPos = 0;
  var yPos = svgOptions.height/2;

  _.each(freq, function(e, i) {
    var colorIndex = Math.floor(e / 75);
    var color = themes[colorTheme].colors[colorIndex];
    xPos += xInc;
    circles.push(new Circle(xPos, yPos, e/4, color));
  });

  return circles;
};


var buildMeter = function (data) {
  // Update
  var circles = canvas.selectAll(".meter-circle")
    .data(data)
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

var animateCircles = function (wave, freq, colorTheme) {
  // Build new circles for meter with new data set
  var meterCircles = buildCircles(wave, freq, colorTheme);
  buildMeter(meterCircles);

  // Random constraints to try and match the heavy bass line
  if (freq[0] > 235 && freq[1] > 220 && wave[0] > 150) {
    buildRings(colorTheme, parseInt(wave[0]/20));
  }
};

var requestID;

var render = function (colorTheme) {
  animateCircles(getWaveFormData(), getFrequencyData(), colorTheme);
  requestID = requestAnimationFrame(function () {
    return render(colorTheme);
  });
};

var start = function (colorTheme) {
  if (!requestID) {
    render(colorTheme);
  }
};

var stop = function () {
  if (requestID) {
    window.cancelAnimationFrame(requestID);
    requestID = undefined;
  }
};

var updateTheme = function (colorTheme) {
  console.log("switched themese from:", currentTheme, "to:", colorTheme);
  stop();
  currentTheme = colorTheme;
  start(currentTheme);
};

var addClickListeners = function (collection) {
  _.each(collection, function (theme, i) {
    var el = document.getElementById(i);
    el.addEventListener("click", function () {
      updateTheme(this.id);
    });
  });
};


var buildBubbles = function (data) {
  var opacity = Math.random() * 0.5;
 
  // Enter
  var bubbles = canvas.selectAll(".bubble")
    .data(data);
    bubbles.enter().insert("circle", ":first-child")
      .attr("cx", function (d) { return d.x; })
      .attr("cy", function (d) { return d.y; })
      .attr("r", function (d) { return d.r; })
      .attr("fill", function (d) { return d.color; })
      .attr("fill-opacity", opacity);

  // Update + Remove
    bubbles.transition()
    .duration(5000)
    .attr("r", 0)
    .attr("fill-opacity", 0)
    .each("end", function () {
      this.remove();
    });
};

document.getElementById("svg-canvas").addEventListener("mousemove", function (event) {
  var padding = Math.random() * 25;
  var x = event.screenX + padding;
  var y = event.screenY + padding;
  var r = (getWaveFormData()[0] / 100) * 50;
  var colorIndex = Math.floor(Math.random() * 4);
  var color = themes[themes[currentTheme].compliment].colors[colorIndex];
  var bubble = [];
  bubble.push(new Circle (x, y, r, color));
  buildBubbles(bubble);
});

document.getElementById("icon").addEventListener("click", function (event) {
  pause();
  var themeName = window.prompt("enter a new theme name");
  var themeColors = window.prompt("enter 5 colors for " + themeName + " separated by commas:");
  var themeCompliment = window.prompt("enter complementary theme");

  themes[themeName] = {
    compliment: themeCompliment,
    colors: themeColors.split(",")
  };

  // console.log(themes)
  appendThemes();
  updateTheme(themeName);
  play();

});

var app = {
  init: function () {
    // Append defined themes
    appendThemes();
    // Play the audio on load
    play();
    // Default theme
    updateTheme("warm");
  }
};
// Kick it off!
app.init();

// #E16AFF, #E86FA1, #FF8F7A, #E8A46F, #FFDF9D