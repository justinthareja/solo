// Create audio context
var audioCtx = new window.AudioContext();
// Grab audio element from the DOM 
var audioElement = document.getElementById("player");
// Create an analyzer sound node
var analyser = audioCtx.createAnalyser();


// Wait for audio element to be ready
audioElement.addEventListener("canplay", function() {
  // Define the audio element as the streaming source 
  var source = audioCtx.createMediaElementSource(audioElement);
  // Connect the source to the analyzer node in the middle of the audio graph
  source.connect(analyser);
  // Have the analyzer node connect to the destination
  analyser.connect(audioCtx.destination);
});

// Size of data set = fftSize / 2  
analyser.fftSize = 64;


// Extract current frequency data from audio element
var getFrequencyData = function () {
  var frequencyData = new Uint8Array(analyser.frequencyBinCount);
  analyser.getByteFrequencyData(frequencyData);
  // console.log('freq:', frequencyData);
  return frequencyData;
};

// Extract current wave data from audio element
var getWaveFormData = function () {
  var waveData = new Uint8Array(analyser.frequencyBinCount);
  analyser.getByteTimeDomainData(waveData);
  // console.log('wave:', waveData);
  return waveData;
};



// window.setInterval(getFrequencyData, 50);
// window.setInterval(getWaveFormData, 50);