var context = new window.AudioContext();
var audioElement = document.getElementById("player");
var analyser = context.createAnalyser();

audioElement.addEventListener("canplay", function() {
  var source = context.createMediaElementSource(audioElement);
  console.log('source =', source);
  source.connect(analyser);
  analyser.connect(context.destination);
  analyser.fftSize = 256;
  var bufferLength = analyser.frequencyBinCount;
  console.log(bufferLength);
  var dataArray = new Float32Array(bufferLength);
  console.log(dataArray);
});

