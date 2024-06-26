function apiUri() {
  const current_env = 'DEV'
  const API_URLS = {
    DEV: "https://suntory-dev.dev2.purchase-proof.com",
    STG: "https://suntory-stg.dev2.purchase-proof.com",
    PROD: "https://suntory.purchase-proof.com"
  }
  return API_URLS[current_env]
}
const AUTHORIZATION_KEY = 'b64a2fecdb5e4367bde6e98438b168a9'

const MAIN_MODEL_DB_PATH = "indexeddb://suntory_model_240530";
const MAIN_MODEL_FILE_PATH = 'model/model.json';
const FACE_MODEL_DB_PATH = "indexeddb://face_model";
const FACE_MODEL_FILE_PATH = "face_model/model.json";

const captureCanvasForFace = (canvas, video) => {
  const size = Math.min(video.clientWidth, video.clientHeight);
  canvas.width = size;
  canvas.height = size;
  canvas
    .getContext("2d")
    .drawImage(video, 0, 0, size, size);
  return canvas;
};

const captureCanvas = (canvas, video) => {
  const size = Math.min(video.clientWidth, video.clientHeight);
  canvas.width = size;
  canvas.height = size;

  // Calculate the center of the video frame
  const centerX = video.videoWidth / 2;
  const centerY = video.videoHeight / 2;

  // Calculate the top-left corner of the square region
  const startX = centerX - size / 2;
  const startY = centerY - size / 2;

  // Draw the current video frame onto the canvas
  canvas
    .getContext("2d")
    .drawImage(video, startX, startY, size, size, 0, 0, size, size);
  return canvas;
};

const captureCanvasFull = (canvas, video) => {
  const videoRect = video.getBoundingClientRect();
  const videoWidth = videoRect.width;
  const videoHeight = videoRect.height;
  
  const squareSize = Math.max(videoWidth, videoHeight);
  canvasElement.width = squareSize;
  canvasElement.height = squareSize;
  canvas.getContext('2d').fillStyle = 'white';
  canvas.getContext('2d').fillRect(0, 0, squareSize, squareSize);
  let drawHeight
  let drawWidth
  let scale
  if(squareSize === videoHeight) {
    drawHeight = squareSize
    scale = squareSize / videoElement.videoHeight
    drawWidth = videoElement.videoWidth * scale
  } else {
    drawWidth = squareSize
    scale = squareSize / videoElement.videoWidth
    drawHeight = videoElement.videoHeight * scale
  }
  const drawX = (squareSize - drawWidth) / 2;
  const drawY = (squareSize - drawHeight) / 2;
  // Draw the visible part of the video to the canvas, centered
  canvas.getContext('2d').drawImage(videoElement, 0, 0, videoElement.videoWidth, videoElement.videoHeight, drawX, drawY, drawWidth, drawHeight);
  return canvas
}

const captureCanvasFullNew = (canvas, videoElement) => {

  const videoRect = videoElement.getBoundingClientRect();
  const videoWidth = videoRect.width;
  const videoHeight = videoRect.height;
  // Determine the side length of the square canvas
  const squareSize = Math.max(videoWidth, videoHeight);
  // Set canvas size to 1x1 aspect ratio
  canvasElement.width = squareSize;
  canvasElement.height = squareSize;
  // Fill the entire canvas with white
  canvas.getContext('2d').fillStyle = 'white';
  canvas.getContext('2d').fillRect(0, 0, squareSize, squareSize);
  // Calculate the scale to maintain the aspect ratio
  const scale = Math.max(canvasElement.width / videoElement.videoWidth, canvasElement.height / videoElement.videoHeight);
  // Calculate draw dimensions to maintain aspect ratio
  const drawWidth = videoElement.videoWidth * scale;
  // 480
  const drawHeight = videoElement.videoHeight * scale;
  // Calculate the position to center the video in the canvas
  // 623 - 480 * 0.97 / 2
  const drawX = (squareSize - drawWidth) / 2;
  const drawY = (squareSize - drawHeight) / 2;
  // Draw the visible part of the video to the canvas, centered
  canvas.getContext('2d').drawImage(videoElement, 0, 0, videoElement.videoWidth, videoElement.videoHeight, drawX, drawY, drawWidth, drawHeight);
  return canvas
}

const hideElement = (elements) => {
  if (Array.isArray(elements)) {
    elements.forEach((element) => {
      element.classList.add('hidden');
    });
  } else {
    elements.classList.add('hidden');
  }
};
const showElement = (elements) => {
  if (Array.isArray(elements)) {
    elements.forEach((element) => {
      element.classList.remove('hidden');
    });
  } else {
    elements.classList.remove('hidden');
  }
};