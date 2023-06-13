// 配置模型地址
const MODEL_PATH = '../models';
const video = document.querySelector('.video');

/**
 * @author topu
 * @date 2023/6/13
 * @Description 打开摄像头
 * @return 返回值
 */
async function getCamera () {
  try {
    video.srcObject = await navigator.mediaDevices.getUserMedia({ video: true });
  } catch (e) {
    console.error(e)
  }
}

/**
 * @author topu
 * @date 2023/6/13
 * @Description 进行模型记载
 * @return 返回值
 */

async function loadModels () {
  await faceapi.loadTinyFaceDetectorModel(MODEL_PATH);
  await faceapi.loadFaceLandmarkTinyModel(MODEL_PATH);
  await faceapi.loadFaceExpressionModel(MODEL_PATH);
  await faceapi.loadAgeGenderModel(MODEL_PATH);
  getCamera();
}

/**
 * @author topu
 * @date 2023/6/13
 * @Description 创建画布，绘制信息
 * @return 返回值
 */
async function drawFace () {
  const canvas = faceapi.createCanvasFromMedia(video);
  const ctx = canvas.getContext('2d');
  const width = video.width;
  const height = video.height;
  
  document.body.append(canvas);
  // 每300ms进行绘制一次
  setInterval(async () => {
    const detections = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks(true).withFaceExpressions().withAgeAndGender();
    const resizedDetections = faceapi.resizeResults(detections, {
      width,
      height
    });
    
    ctx.clearRect(0, 0, width, height);
    faceapi.draw.drawDetections(canvas, resizedDetections);
    faceapi.draw.drawFaceLandmarks(canvas, resizedDetections);
    faceapi.draw.drawFaceExpressions(canvas, resizedDetections);
    
    resizedDetections.forEach(result => {
      const { age, gender, genderProbability } = result;
      new faceapi.draw.DrawTextField(
          [
            `${~~age} years`,
            `${gender} (${genderProbability.toFixed(1)})`,
          ],
          result.detection.box.bottomRight
      ).draw(canvas);
    });
  }, 300);
  
}

// 播放视屏的时候进行绘制
video.addEventListener('play', drawFace);

loadModels();
