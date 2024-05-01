navigator.getUserMedia =
  navigator.getUserMedia ||
  navigator.webkitGetUserMedia ||
  navigator.mozGetUserMedia;

var btnStart = document.querySelector(".start");
var btnStop = document.querySelector(".stop");

btnStart.onclick = () => {
  navigator.getUserMedia(constraints, successCallback, errorCallback);
};

btnStop.onclick = () => {
  const stream = video.srcObject;
  const tracks = stream.getTracks();

  tracks.forEach((track) => track.stop());

  video.srcObject = null;
};

var constraints = {
  audio: false,
  video: {
    width: { ideal: 1280 },
    height: { ideal: 720 },
  },
};
var video = document.querySelector("video");
function successCallback(stream) {
  window.stream = stream;
  if ("srcObject" in video) {
    video.srcObject = stream;
  } else {
    video.src = URL.createObjectURL(stream);
  }

  video.play();
}
function errorCallback(error) {
  console.log("navigator.getUserMedia error: ", error);
}
