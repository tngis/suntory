let mainModel, faceModel;
const canvasDraw = document.getElementById("canvasDraw")
async function loadModels() {
    [mainModel, faceModel] = await Promise.all([
        loadTensorFlowModel(MAIN_MODEL_DB_PATH, MAIN_MODEL_FILE_PATH),
        loadTensorFlowModel(FACE_MODEL_DB_PATH, FACE_MODEL_FILE_PATH),
    ]);
}
async function loadTensorFlowModel(modelDBPath, modelFilePath) {
    const mPromise = new Promise(async (resolve, reject) => {
        let mModel;
        try {
            mModel = await tf.loadGraphModel(modelDBPath);
            // モデルの読み込みに成功した場合の処理
            console.log("モデルの読み込みに成功しました。");
            resolve(mModel);
        } catch (error) {
            // エラーハンドリング
            mModel = await tf.loadGraphModel(modelFilePath);
            await mModel.save(modelDBPath);
            console.log("モデルのキャッシュに入れました");
            resolve(mModel);
        }
    });
    const result = await mPromise;
    return result;
}


// TfJSの計算
function xywh2xyxy(x) {
    //Convert boxes from [x, y, w, h] to [x1, y1, x2, y2] where xy1=top-left, xy2=bottom-right
    var y = [];
    y[0] = x[0] - x[2] / 2; //top left x
    y[1] = x[1] - x[3] / 2; //top left y
    y[2] = x[0] + x[2] / 2; //bottom right x
    y[3] = x[1] + x[3] / 2; //bottom right y
    return y;
}

// TfJSの計算
function non_max_suppression(
    res,
    conf_thresh = 0.5,
    iou_thresh = 0.2,
    max_det = 300
) {
    // Initialize an empty list to store the selected boxes
    const selected_detections = [];

    for (let i = 0; i < res.length; i++) {
        // Check if the box has sufficient score to be selected
        if (res[i][4] < conf_thresh) {
            continue;
        }

        var box = res[i].slice(0, 4);
        const cls_detections = res[i].slice(5);
        var klass = cls_detections.reduce(
            (imax, x, i, arr) => (x > arr[imax] ? i : imax),
            0
        );
        const score = res[i][klass + 5];

        let object = xywh2xyxy(box);
        let addBox = true;

        // Check for overlap with previously selected boxes
        for (let j = 0; j < selected_detections.length; j++) {
            let selectedBox = xywh2xyxy(selected_detections[j]);

            // Calculate the intersection and union of the two boxes
            let intersectionXmin = Math.max(object[0], selectedBox[0]);
            let intersectionYmin = Math.max(object[1], selectedBox[1]);
            let intersectionXmax = Math.min(object[2], selectedBox[2]);
            let intersectionYmax = Math.min(object[3], selectedBox[3]);
            let intersectionWidth = Math.max(0, intersectionXmax - intersectionXmin);
            let intersectionHeight = Math.max(0, intersectionYmax - intersectionYmin);
            let intersectionArea = intersectionWidth * intersectionHeight;
            let boxArea = (object[2] - object[0]) * (object[3] - object[1]);
            let selectedBoxArea =
                (selectedBox[2] - selectedBox[0]) * (selectedBox[3] - selectedBox[1]);
            let unionArea = boxArea + selectedBoxArea - intersectionArea;

            // Calculate the IoU and check if the boxes overlap
            let iou = intersectionArea / unionArea;
            if (iou >= iou_thresh) {
                addBox = false;
                break;
            }
        }

        // Add the box to the selected boxes list if it passed the overlap check
        if (addBox) {
            const row = box.concat(score, klass);
            selected_detections.push(row);
        }
    }

    return selected_detections;
}

// TfJSの計算
function shortenedCol(arrayofarray, indexlist) {
    return arrayofarray.map(function (array) {
        return indexlist.map(function (idx) {
            return array[idx];
        });
    });
}

function calculatePrediction(scores_data, classes_data, labels, target_products, boxes_data = [], canvasElement = null, current_thresh = 0.5) {
    if (!canvasElement) {
        // console.error("Canvas element is null");
        return {};
    }

    let ctx = canvasElement.getContext("2d");
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height); // clean canvas

    const font = "18px sans-serif";
    const threshold = current_thresh;
    let calculation_result = {};

    const originalWidth = 640;
    const originalHeight = 640;

    const newWidth = window.innerWidth;
    const newHeight = window.innerHeight;

    let widthScale, heightScale;

    // Check if the new width is wider or narrower than the original width
    if (newWidth / newHeight > originalWidth / originalHeight) {
        // Wider
        widthScale = newWidth / originalWidth;
        heightScale = widthScale; // Maintain aspect ratio
    } else {
        // Narrower
        heightScale = newHeight / originalHeight;
        widthScale = heightScale; // Maintain aspect ratio
    }

    canvasElement.width = newWidth;
    canvasElement.height = newHeight;

    function calculateScaledCoordinates(box) {
        return new Promise((resolve) => {
            let [x1, y1, x2, y2] = xywh2xyxy(box);

            // Scale the coordinates
            x1 *= widthScale;
            y1 *= heightScale;
            x2 *= widthScale;
            y2 *= heightScale;

            // Calculate the width and height after scaling
            let width = x2 - x1;
            let height = y2 - y1;

            // Adjust coordinates to center the bounding box if necessary
            const xOffset = (newWidth - originalWidth * widthScale) / 2;
            const yOffset = (newHeight - originalHeight * heightScale) / 2;

            x1 += xOffset;
            y1 += yOffset;

            resolve({ x1, y1, width, height });
        });
    }
    
    function showWarning(warningId) {
        document.getElementById(warningId).style.display = 'block';
    }

    function hideAllWarnings() {
        document.querySelectorAll('.warning-text').forEach(warning => {
            warning.style.display = 'none';
        });
    }

    function hideWarningsByType(type) {
        document.querySelectorAll(`[id^=${type}-warning]`).forEach(warning => {
            warning.style.display = 'none';
        });
    }

    function checkTreshold(box) {
        let boxPromises = box.map(e => calculateScaledCoordinates(e));

        Promise.all(boxPromises).then(boxValues => {
            const [logo, ellipse, boundingBox] = boxValues;

            const middleOfLogo = logo.x1 + (logo.width / 2);
            const logoMinRange = boundingBox.x1 + boundingBox.width * 0.4;
            const logoMaxRange = logoMinRange + boundingBox.width * 0.2;
            const videoHeight = videoElement.getBoundingClientRect().height;

            hideAllWarnings(); // Hide all warnings initially

            // Camera warnings
            hideWarningsByType('camera');
            const boundingBoxHeightRatio = boundingBox.height / videoHeight;
            if (boundingBoxHeightRatio < 0.4) {
                showWarning('camera-warning-1');
            } else if (boundingBoxHeightRatio > 0.5) {
                showWarning('camera-warning-2');
            }

            // Ellipse warnings
            hideWarningsByType('ellipse');
            const ellipseHeightRatio = ellipse.height / boundingBox.height;
            if (ellipseHeightRatio < 0.2) {
                showWarning('ellipse-warning-1');
            } else if (ellipseHeightRatio > 0.3) {
                showWarning('ellipse-warning-2');
            }

            // Logo warnings
            hideWarningsByType('logo');
            if (middleOfLogo < logoMinRange) {
                showWarning('logo-warning-1');
            } else if (middleOfLogo > logoMaxRange) {
                showWarning('logo-warning-2');
            }
        }).catch(error => {
            console.error("Error in calculating scaled coordinates:", error);
        });
    }

    checkTreshold(boxes_data)
    for (let i = 0; i < scores_data.length; ++i) {
        if (scores_data[i] > threshold) {
            const _class = labels[classes_data[i]];
            const score = scores_data[i];

            calculateScaledCoordinates(boxes_data[i]).then(({ x1, y1, width, height }) => {
                // Draw the bounding box.
                ctx.strokeStyle = "red";
                ctx.lineWidth = 2;
                ctx.strokeRect(x1, y1, width, height);

                // Draw the label background.
                ctx.fillStyle = "#B033FF";
                const textWidth = ctx.measureText(_class + " - " + score + "%").width;
                const textHeight = parseInt(font, 10); // base 10
                ctx.fillRect(x1 - 1, y1 - (textHeight + 2), textWidth + 2, textHeight + 2);

                // Draw labels
                ctx.fillStyle = "#ffffff";
                ctx.fillText(_class + " - " + score + "%", x1 - 1, y1 - (textHeight + 2));

                if (target_products.includes(_class)) {
                    calculation_result[_class] = score;
                }
            });
        }
    }
    return calculation_result;
}

async function checkProductTFJS(canvas, video, mainModel) {
    let result = 0
    const mLabels = ["suntorynama", "yoasobi", "opened", "other", "yoasobi_label"]
    const mTargets = ["suntorynama", "yoasobi"]
    const mCanvas = captureCanvasFull(canvas, video);
    // const mCanvas = captureCanvasFull(canvas, video);
    // ENABLE FOR CHECK FACE CANVAS
    // setTimeout(() => {
    //     mCanvas.toBlob((blob) => {
    //         const tempUrl = URL.createObjectURL(blob);
    //         window.location = tempUrl
    //       }) 
    // }, 5000);
    tf.engine().startScope()
    const mainModelImage = tf.browser
        .fromPixels(mCanvas, 3).resizeNearestNeighbor([640, 640])
        .div(255.0)
        .transpose([2, 0, 1])
        .expandDims(0);
    const tensorPredictions = await mainModel.executeAsync(mainModelImage);
    tf.dispose(mainModelImage);
    let res = tensorPredictions.arraySync()[0];
    tf.engine().endScope()
    const detections = non_max_suppression(res);
    const boxes = shortenedCol(detections, [0, 1, 2, 3]);
    const scores = shortenedCol(detections, [4]);
    const class_detect = shortenedCol(detections, [5]);
    // Draw boxes on canvas
    const product_threshold = 0.5;
    const product_result = calculatePrediction(scores, class_detect, mLabels, mTargets, boxes, canvasDraw, product_threshold);

    mTargets.forEach((key) => {
        if (Object.prototype.hasOwnProperty.call(product_result, key)) {
            result = Math.max(result, product_result[key])
        }
    })
    return result;
}
async function checkFaceTFJS(canvas, video, faceModel) {
    let result = 0
    const mCanvas = captureCanvasFull(canvas, video);
    // ENABLE FOR CHECK FACE CANVAS
    // mCanvas.toBlob((blob) => {
    //   const tempUrl = URL.createObjectURL(blob);
    //   window.location = tempUrl
    // })
    tf.engine().startScope()
    let faceModelImage = tf.browser
        .fromPixels(mCanvas, 3)
        .resizeNearestNeighbor([640, 640])
        .div(255.0)
        .transpose([2, 0, 1])
        .expandDims(0);
    const tensorPredictions = await faceModel.executeAsync(faceModelImage);
    tf.dispose(faceModelImage);
    let res = tensorPredictions.arraySync()[0];
    tf.engine().endScope()
    const detections = non_max_suppression(res);
    // const boxes = shortenedCol(detections, [0, 1, 2, 3]);
    const scores = shortenedCol(detections, [4]);
    const class_detect = shortenedCol(detections, [5]);
    const face_threshold = 0.5;
    const face_result = calculatePrediction(scores, class_detect, ["face"], ["face"], face_threshold);
    result = face_result.face ? face_result.face : 0;

    return result;
}
