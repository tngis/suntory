async function camera() {
  const video = document.getElementById("video");
  video.autoplay = true;
  video.muted = true;
  video.playsInline = true;
  navigator.getUserMedia =
    navigator.getUserMedia ||
    navigator.webkitGetUserMedia ||
    navigator.mozGetUserMedia ||
    navigator.msGetUserMedia;
  const facingMode = "environment" || "user"; // "environment"

  const constraints = {
    audio: false,
    video: {
      facingMode: facingMode,
      // width: 720,
      // height: 720 * 1.333
    },
  };
  const mPromise = new Promise((resolve, reject) => {
    navigator.mediaDevices
      .getUserMedia(constraints)
      .then((stream) => {
        video.setAttribute("autoplay", "");
        video.setAttribute("muted", "");
        video.setAttribute("playsinline", "");
        video.width = window.innerWidth;
        video.srcObject = stream;
        video.play()
        console.log("STREAM")
        try {
          setTimeout(() => {
            video.style.height = "calc(100%)";
            video.style['zIndex'] = "";
          }, 1000);
        } catch (error) {
          // console.log("🚀 ~ .then ~ error:", error)
        }
        resolve();
      })
      .catch((e) => {
        reject(e);
        // device don't support camera → write link function here
      });
  })
  let result = await mPromise;
  return result;
}
function fixCamera() {
  const mVideo = document.getElementById('video')
  if ('375x667' == `${window.screen.width}x${window.screen.height}`) {
    mVideo.style.height = '';
    setTimeout(async () => {
      mVideo.style.height = 'calc(100%)';
      // await camera()
    }, 2000);
  }
}