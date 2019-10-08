import { Application, Sprite, Rectangle, Graphics, UPDATE_PRIORITY } from 'pixi.js'

const app = new Application({ width: 1280, height: 720 })
const loader = app.loader
let health = 100
document.body.appendChild(app.view)

let lifeBar1, lifeBarEmpty1
let lifeBar2, lifeBarEmpty2

const lifebarProps = {
  width: 0.35,
  height: 0.06,
  top: 0.1,
  distanceFromCenter: 0.03,
  border: 1, // px
}

loader
  .add('./sprites/ryu.gif')
  .add('./sprites/background.jpg')
  .load(setup)

function setup() {
  const ryuSheet = loader.resources['./sprites/ryu.gif'].texture
  const ryuWidth = 54
  const ryuFrame = new Rectangle(0, 15, ryuWidth, 90)
  ryuSheet.frame = ryuFrame
  const ryu = new Sprite(ryuSheet)
  ryu.scale.set(4.0, 4.0)
  ryu.x = 300
  ryu.y = 680
  ryu.anchor.x = 0.5
  ryu.anchor.y = 1

  const player2 = new Sprite(ryuSheet)
  

  const background = new Sprite(loader.resources['./sprites/background.jpg'].texture)

  lifeBarEmpty1 = drawLifeBarEmpty(true)
  lifeBar1 = drawLifeBarFill(true)
  lifeBarEmpty2 = drawLifeBarEmpty(false)
  lifeBar2 = drawLifeBarFill(false)

  app.stage.addChild(background)
  app.stage.addChild(ryu)
  app.stage.addChild(lifeBarEmpty1)
  app.stage.addChild(lifeBar1)
  app.stage.addChild(lifeBarEmpty2)
  app.stage.addChild(lifeBar2)

  
  app.ticker.add(delta => gameLoop(delta))
}

function gameLoop(delta) {
  update(delta)

  redraw()
}

function update(delta) {
  health -= 1
}

function redraw() {
  lifeBar1.width = health / 100 * 420
}

function drawLifeBarEmpty(isLeft) {
  const { width, height, top, distanceFromCenter } = lifebarProps
  const screenWidth = app.view.width
  const screenHeight = app.view.height

  const lifeBarEmpty = new Graphics()
  lifeBarEmpty.beginFill(0xdf2800)
  lifeBarEmpty.lineStyle(2, 0xffffff, 1)
  lifeBarEmpty.drawRect(
    (isLeft ? 0.5 - distanceFromCenter - width : 0.5 + distanceFromCenter) * screenWidth,
    top * screenHeight,
    width * screenWidth,
    height * screenHeight
  )
  lifeBarEmpty.endFill()
  return lifeBarEmpty
}

function drawLifeBarFill(isLeft) {
  const { width, height, top, distanceFromCenter, border } = lifebarProps
  const screenWidth = app.view.width
  const screenHeight = app.view.height
  const lifeBarFill = new Graphics()
  lifeBarFill.beginFill(0xffff00)
  lifeBarFill.drawRect(
    (isLeft ? 0.5 - distanceFromCenter - width : 0.5 + distanceFromCenter) * screenWidth + border,
    top * screenHeight + border,
    width * screenWidth - border * 2,
    height * screenHeight - border * 2
  )
  lifeBarFill.endFill()
  return lifeBarFill
}
