import Controller from "./controller";

export default class UI  {

  clickBtns = {}

  constructor(ctx, nes) {
    this.context = ctx
    this.nes = nes
    this.init()
  }

  init() {
    let imageLeft = wx.createImage()
    let imageRight = wx.createImage()
    let imageDown = wx.createImage()
    imageLeft.src = 'images/left.png'
    imageRight.src = 'images/right.png'
    imageDown.src = 'images/down.png'

    this.btns = {
      leftPanel: { image: imageLeft },
      rightPanel: { image: imageRight },
      start: { image: imageDown },
      select: { image: imageDown },
      down: {}, left: {}, right: {}, up: {},
    }
    const { leftPanel, rightPanel, start, select } = this.btns
    let cwidth = canvas.width
    let cheight = canvas.height
    let mwidth = 256
    let mheight = 240
    let rectLength = (cwidth - mwidth) / 2 * 0.8
    leftPanel.width = leftPanel.height = rectLength
    rightPanel.width = rightPanel.height = rectLength
    leftPanel.left = (cwidth - mwidth) / 4 - rectLength / 2
    rightPanel.left = (cwidth - mwidth) / 2 + mwidth + ((cwidth - mwidth) / 2 - rectLength) / 2
    leftPanel.top = rightPanel.top = (cheight - rectLength) / 2
    start.width = select.width = mwidth / 4
    start.height = select.height = mwidth / 4 / 4
    start.left = cwidth / 2 - start.width * 1.2
    select.left = cwidth / 2 + start.width * 0.2
    start.top = select.top = mheight + (cheight - mheight) / 2 + start.height / 2

    leftPanel.right = leftPanel.left + leftPanel.width
    leftPanel.bottom = leftPanel.top + leftPanel.height
    rightPanel.right = rightPanel.left + rightPanel.width
    rightPanel.bottom = rightPanel.top + rightPanel.height
    start.right = start.left + start.width
    start.bottom = start.top + start.height
    select.right = select.left + select.width
    select.bottom = select.top + select.height

    this.btns.down.left = leftPanel.left + leftPanel.width / 3
    this.btns.down.right = leftPanel.left + leftPanel.width / 3 * 2
    this.btns.down.top = leftPanel.top + leftPanel.height / 2
    this.btns.down.bottom = leftPanel.top + leftPanel.height
    this.btns.up.left = leftPanel.left + leftPanel.width / 3
    this.btns.up.right = leftPanel.left + leftPanel.width / 3 * 2
    this.btns.up.top = leftPanel.top
    this.btns.up.bottom = leftPanel.top + leftPanel.height / 2
    this.btns.left.left = leftPanel.left
    this.btns.left.right = leftPanel.left + leftPanel.width / 2
    this.btns.left.top = leftPanel.top
    this.btns.left.bottom = leftPanel.bottom
    this.btns.right.left = leftPanel.left + leftPanel.width / 2
    this.btns.right.right = leftPanel.right
    this.btns.right.top = leftPanel.top
    this.btns.right.bottom = leftPanel.bottom
    rightPanel.centerX = rightPanel.left + rightPanel.width / 2
    rightPanel.centerY = rightPanel.top + rightPanel.height / 2
  }

  drawToCanvas() {
    let ctx = this.context
    const { leftPanel, rightPanel, start, select } = this.btns
    ctx.drawImage(leftPanel.image, leftPanel.left, leftPanel.top, leftPanel.width, leftPanel.height)
    ctx.drawImage(rightPanel.image, rightPanel.left, rightPanel.top, rightPanel.width, rightPanel.height)
    ctx.drawImage(start.image, start.left, start.top, start.width, start.height)
    ctx.drawImage(select.image, select.left, select.top, select.width, select.height)
  }

  touchHandler(touches) {
    let changed = false
    let clickBtns = {}
    if (touches && touches.length) {      
      for(let i=0;i<touches.length;i++) {
        let t = touches[i]
        let btn = this.check(t.clientX, t.clientY)
        if (btn !== undefined) {
          clickBtns[btn] = 1
          if (!this.clickBtns[btn]) {
            changed = true
            this.clickBtns[btn] = 1
            this.nes.buttonDown(1, btn)
          }
        }
      }
    }
    for(let i in this.clickBtns) {
      if(!clickBtns[i]) {
        changed = true
        this.nes.buttonUp(1, i)
      }
    }
    if(changed) {
      this.clickBtns = clickBtns
      this.nes.frame()
    }
  }

  check(x, y) {
    const { leftPanel, rightPanel, start, select } = this.btns
    if (x >= leftPanel.left && x <= leftPanel.right && y >= leftPanel.top && y <= leftPanel.bottom) {
      return this.checkLeftPanel(x, y)
    } else if (x >= rightPanel.left && x <= rightPanel.right && y >= rightPanel.top && y <= rightPanel.bottom) {
      return this.checkRightPanel(x, y)
    } else if (x >= start.left && x <= start.right && y >= start.top && y <= start.bottom) {
      return Controller.BUTTON_START      
    } else if (x >= select.left && x <= select.right && y >= select.top && y <= select.bottom) {
      return Controller.BUTTON_SELECT
    }
  }

  checkLeftPanel(x, y) {
    const {left, right, up, down} = this.btns
    if(x>=down.left && x<=down.right && y>=down.top && y<=down.bottom) {
      return Controller.BUTTON_DOWN
    } else if (x >= up.left && x <= up.right && y >= up.top && y <= up.bottom) {
      return Controller.BUTTON_UP
    } else if (x >= right.left && x <= right.right && y >= right.top && y <= right.bottom) {
      return Controller.BUTTON_RIGHT
    } else if (x >= left.left && x <= left.right && y >= left.top && y <= left.bottom) {
      return Controller.BUTTON_LEFT
    }
  }

  checkRightPanel(x, y) {
    //   A 
    //B     A
    //   B
    let p = this.btns.rightPanel
    let vectorX = (x-p.centerX)
    let vectorY = (y-p.centerY)
    if (vectorX > vectorY || -vectorX < -vectorY) {
      return Controller.BUTTON_A
    } else {
      return Controller.BUTTON_B
    }
  }
}
