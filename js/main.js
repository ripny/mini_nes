import NES from "nes"
import Speakers from "./Speakers";
import FrameTimer from "./FrameTimer";
import UI from "./ui";
let ctx = canvas.getContext('2d')
let SCREEN_WIDTH = 256//
let SCREEN_HEIGHT = 240//canvas.height
let SCREEN_X = (canvas.width - SCREEN_WIDTH)/2
let SCREEN_Y = (canvas.height - SCREEN_HEIGHT)/2
let performance = wx.getPerformance()
/**
 * 游戏主函数
 */
export default class Main {
  constructor() {
    let { screenWidth, screenHeight } = wx.getSystemInfoSync()
    if (canvas.height !== screenHeight) {
      //iOS bug：需要手动设置宽高，否则比例完全错乱
      canvas.height = screenHeight
      canvas.width = screenWidth
      SCREEN_X = (canvas.width - SCREEN_WIDTH) / 2
      SCREEN_Y = (canvas.height - SCREEN_HEIGHT) / 2
    }
    this.context = ctx
    this.state = { running: false, paused: false }
    this.initCanvas()
    this.speakers = new Speakers({
      onBufferUnderrun: (actualSize, desiredSize) => {
        if (!this.state.running || this.state.paused) {
          return;
        }
        this.nes.frame();
        if (this.speakers.buffer.size() < desiredSize) {
          this.nes.frame();
        }
      }
    });
    this.nes = new NES({
      onFrame: this.setBuffer,
      onStatusUpdate: console.log,
      //onAudioSample: this.speakers.writeSample
    })
    this.ui = new UI(this.context, this.nes)
    this.frameTimer = new FrameTimer({
      onGenerateFrame: this.nes.frame,
      onWriteFrame: this.writeBuffer
    });
    canvas.addEventListener(
      'touchstart',
      this.touchStartHandler.bind(this)
    )
    canvas.addEventListener(
      'touchend',
      this.touchEndHandler.bind(this)
    )
    this.load()
  }

  initCanvas() {
    this.imageData = this.context.getImageData(0, 0, SCREEN_WIDTH,SCREEN_HEIGHT);
    this.context.fillStyle = "black";
    // set alpha to opaque
    this.context.fillRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
    // buffer to write on next animation frame
    this.buf = new ArrayBuffer(this.imageData.data.length);
    // Get the canvas buffer in 8bit and 32bit
    this.buf8 = new Uint8ClampedArray(this.buf);
    this.buf32 = new Uint32Array(this.buf);
    // Set alpha
    for (var i = 0; i < this.buf32.length; ++i) {
      this.buf32[i] = 0xff000000;
    }
  }

  setBuffer = buffer => {
    var i = 0;
    for (var y = 0; y < SCREEN_HEIGHT; ++y) {
      for (var x = 0; x < SCREEN_WIDTH; ++x) {
        i = y * 256 + x;
        this.buf32[i] = 0xff000000 | buffer[i];
      }
    }
  };

  writeBuffer = () => {
    this.imageData.data.set(this.buf8);
    //重要，手机端不加上这句话，画面不会刷新
    this.context.clearRect(SCREEN_X, SCREEN_Y, SCREEN_WIDTH, SCREEN_HEIGHT)
    this.context.putImageData(this.imageData, SCREEN_X, SCREEN_Y);
    //手机端貌似会永远清空画布，不加上这句话按钮会不见
    this.ui.drawToCanvas()
  };

  setState(state) {
    for(let i in state) {
      this.state[i] = state[i]
    }
  }

  load() {
    let fs = wx.getFileSystemManager()
    fs.readFile({
      filePath: '/images/SuperMario.jpg',
      //encoding: 'binary',
      complete: (res) => {
        if(res.data) {
          this.setState({ running: true });
          let rom = new Uint8ClampedArray(res.data)
          this.nes.loadROM(rom)
          this.frameTimer.start()
          //this.speakers.start();
          let ik = 0, lastT = performance.now()
          let render = () => {
            lastT = performance.now()
            this.nes.frame()
            this.writeBuffer()
            if (ik++ % 100 == 0) {
              console.log(performance.now() - lastT)
            }
            lastT = performance.now()
            window.requestAnimationFrame(render)
          }          
          //render()
        }
      }
    })
  }

  touchStartHandler(e) {
    e.preventDefault()
    this.ui.touchHandler(e.touches)
  }

  touchEndHandler(e) {
    e.preventDefault()
    this.ui.touchHandler(e.touches)
  }
}
