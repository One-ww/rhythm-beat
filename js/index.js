const cvs = document.querySelector('canvas')
const ctx = cvs.getContext('2d')
const audioElements = document.querySelectorAll('audio')
let isInit = false
let analyser, buffer
let currentAudio = null // 当前音频
let source = null // 音频源
let audioCtx = null // 音频上下文

// 初始化canvas的尺寸
function initCvs() {
  const size = 500
  cvs.width = size * devicePixelRatio
  cvs.height = size * devicePixelRatio
  cvs.style.width = cvs.style.height = size + 'px'
}
initCvs()
function draw(datas, maxValue) {
  const r = cvs.width / 4 + 20 * devicePixelRatio
  const center = cvs.width / 2
  ctx.clearRect(0, 0, cvs.width, cvs.height)

  const hslStep = 360 / (datas.length - 1)
  const maxLen = cvs.width / 2 - r
  const minLen = 2 * devicePixelRatio
  for (let i = 0; i < datas.length; i++) {
    ctx.beginPath()
    const len = Math.max((datas[i] / maxValue) * maxLen, minLen)
    const rotate = hslStep * i
    ctx.strokeStyle = `hsl(${rotate}deg, 65%, 65%)`
    ctx.lineWidth = minLen
    const rad = (rotate * Math.PI) / 180
    const beginX = center + Math.cos(rad) * r
    const beginY = center + Math.sin(rad) * r
    const endX = center + Math.cos(rad) * (r + len)
    const endY = center + Math.sin(rad) * (r + len)
    ctx.moveTo(beginX, beginY)
    ctx.lineTo(endX, endY)
    ctx.stroke()
  }
}

draw(new Array(256).fill(0), 255)

function setupAudioAnalysis(audio) {
  if (isInit && currentAudio === audio) {
    return
  }

  if (audioCtx) {
    if (isInit && currentAudio !== audio) {
      if (source) {
        source.disconnect()
        analyser.disconnect()
      }
    }
  } else {
    audioCtx = new AudioContext()
  }

  analyser = audioCtx.createAnalyser()
  analyser.fftSize = 512
  buffer = new Uint8Array(analyser.frequencyBinCount)

  source = audioCtx.createMediaElementSource(audio)
  source.connect(analyser)

  analyser.connect(audioCtx.destination)
  isInit = true
  currentAudio = audio
}

function update() {
  requestAnimationFrame(update)
  if (!isInit) {
    return
  }
  analyser.getByteFrequencyData(buffer)
  const offset = Math.floor((buffer.length * 2) / 3)
  const datas = new Array(offset * 2)
  for (let i = 0; i < offset; i++) {
    datas[i] = datas[datas.length - i - 1] = buffer[i]
  }
  draw(datas, 255)
}

audioElements.forEach(audio => {
  audio.addEventListener('play', function (e) {
    if (source) {
      source.disconnect()
      analyser.disconnect()
    }
    setupAudioAnalysis(this)
    // 暂停其他音频
    audioElements.forEach(otherAudio => {
      if (otherAudio !== audio) {
        otherAudio.pause()
      }
    })
  })
})

update()
