const cvs = document.querySelector("canvas");
const ctx = cvs.getContext("2d");

const img = new Image();
img.src = "./img/Rachel Platten - Fight Song.png";
let rotationAngle = 0; // 初始图片旋转角度

// 初始化canvas的尺寸
function initCvs() {
  const size = 500;
  cvs.width = size * devicePixelRatio;
  cvs.height = size * devicePixelRatio;
  cvs.style.width = cvs.style.height = size + "px";
}

initCvs();

function draw(datas, maxValue) {
  const r = cvs.width / 4 + 20 * devicePixelRatio;
  const center = cvs.width / 2;
  ctx.clearRect(0, 0, cvs.width, cvs.height);

  const hslStep = 360 / (datas.length - 1);
  const maxLen = cvs.width / 2 - r;
  const minLen = 2 * devicePixelRatio;

  // 绘制图片
  if (img && img.complete) {
    const spacing = 10; // 定义间隙大小
    const imgRadius = r - spacing;
    const imgWidth = imgRadius * 2;
    const imgHeight = imgRadius * 2;
    const imgX = center - imgRadius;
    const imgY = center - imgRadius;
    // 保存当前绘图状态
    ctx.save();
    // 创建一个圆形遮罩
    ctx.beginPath();
    ctx.arc(center, center, imgRadius, 0, 2 * Math.PI);
    ctx.clip();

    // 应用旋转
    ctx.translate(center, center);
    ctx.rotate(rotationAngle);
    ctx.translate(-center, -center);

    ctx.drawImage(img, imgX, imgY, imgWidth, imgHeight);
    // 恢复绘图状态
    ctx.restore();
  }

  for (let i = 0; i < datas.length; i++) {
    ctx.beginPath();
    const len = Math.max((datas[i] / maxValue) * maxLen, minLen);
    const rotate = hslStep * i;
    ctx.strokeStyle = `hsl(${rotate}deg, 65%, 65%)`;
    ctx.lineWidth = minLen;
    const rad = (rotate * Math.PI) / 180;
    const beginX = center + Math.cos(rad) * r;
    const beginY = center + Math.sin(rad) * r;
    const endX = center + Math.cos(rad) * (r + len);
    const endY = center + Math.sin(rad) * (r + len);
    ctx.moveTo(beginX, beginY);
    ctx.lineTo(endX, endY);
    ctx.stroke();
  }
}

function animate() {
  rotationAngle += 0.001;
  draw(new Array(256).fill(0), 255);
  requestAnimationFrame(animate);
}

animate();

let isInit = false;
let analyser = null; // 分析器
let buffer = null;
let currentAudio = null; // 当前音频
let source = null; // 音频源
let audioCtx = null; // 音频上下文

let map = new Map();

function setupAudioAnalysis(audio) {
  if (isInit && currentAudio === audio) {
    return;
  }
  if (source && analyser) {
    source.disconnect();
    analyser.disconnect();
  }

  if (!map.has(audio)) {
    const tempAudioCtx = new AudioContext();
    const tempSource = tempAudioCtx.createMediaElementSource(audio);
    const tempAnalyser = tempAudioCtx.createAnalyser();
    map.set(audio, { tempSource, tempAnalyser, tempAudioCtx });
    source = tempSource;
    analyser = tempAnalyser;
    audioCtx = tempAudioCtx;
  } else {
    const { tempSource, tempAnalyser, tempAudioCtx } = map.get(audio);
    source = tempSource;
    analyser = tempAnalyser;
    console.log(tempAudioCtx);

    audioCtx = tempAudioCtx;
  }

  analyser.fftSize = 512;
  buffer = new Uint8Array(analyser.frequencyBinCount);

  source.connect(analyser);

  analyser.connect(audioCtx.destination);
  isInit = true;
  currentAudio = audio;
}

function update() {
  requestAnimationFrame(update);
  if (!isInit) {
    return;
  }
  analyser.getByteFrequencyData(buffer);
  const offset = Math.floor((buffer.length * 2) / 3);
  const datas = new Array(offset * 2);
  for (let i = 0; i < offset; i++) {
    datas[i] = datas[datas.length - i - 1] = buffer[i];
  }
  draw(datas, 255);
}

const audio1 = document.getElementById("audio1");
const audio2 = document.getElementById("audio2");
const audio3 = document.getElementById("audio3");

audio1.addEventListener("play", function (e) {
  img.src = "./img/Rachel Platten - Fight Song.png";
  rotationAngle = 0;

  audio2.pause();
  audio2.currentTime = 0;

  audio3.pause();
  audio3.currentTime = 0;

  setupAudioAnalysis(audio1);
});

audio2.addEventListener("play", function (e) {
  img.src = "./img/王宇宙Leto - 听风告白.png";
  rotationAngle = 0;

  audio1.pause();
  audio1.currentTime = 0;

  audio3.pause();
  audio3.currentTime = 0;

  setupAudioAnalysis(audio2);
});

audio3.addEventListener("play", function (e) {
  img.src = "./img/赵雷-鼓楼.png";
  rotationAngle = 0;

  audio1.pause();
  audio1.currentTime = 0;

  audio2.pause();
  audio2.currentTime = 0;

  setupAudioAnalysis(audio3);
});

try {
  audio1.play();
} catch (error) {}

update();
