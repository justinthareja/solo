var context = new window.AudioContext();
var audioElement = document.getElementById("player");
var analyser = context.createAnalyser();

audioElement.addEventListener("canplay", function() {
  var source = context.createMediaElementSource(audioElement);
  console.log('source =', source);
  source.connect(analyser);
  analyser.connect(context.destination);
});

console.log(analyser.fftSize); // 2048 by default
console.log(analyser.frequencyBinCount); // will give us 1024 data points

analyser.fftSize = 64;
console.log(analyser.frequencyBinCount); // fftSize/2 = 32 data points




// var frequencyData = new Uint8Array(analyser.frequencyBinCount);
// analyser.getByteFrequencyData(frequencyData);
// console.log(frequencyData);


window.setInterval(function(){
    array = new Uint8Array(analyser.frequencyBinCount);
    analyser.getByteFrequencyData(array); 
    console.log(array);                                 
}, 1500)