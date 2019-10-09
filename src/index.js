import { Application, Texture, Text, TextStyle, Sprite, Rectangle, Graphics } from 'pixi.js'
import { lerp } from './math'

const app = new Application({ width: 1280, height: 720 })
const loader = app.loader
document.body.appendChild(app.view)

const screenCenterX = app.view.width / 2
const screenCenterY = app.view.height / 2

const floorY = 0.94 * app.view.height

const lifebarProps = {
  width: 0.35 * app.view.width,
  height: 0.06 * app.view.height,
  top: 0.1 * app.view.height,
  distanceFromCenter: 0.03 * app.view.width,
  border: 1,
  transitionDuration: 0.2, // secs
}

let prevData

const data = {
  player1: {
    name: 'Player 1',
    health: 100,
    maxHealth: 100,
    x: 1,
    y: 0,
  },
  player2: {
    name: 'Player 2',
    health: 100,
    maxHealth: 100,
    x: 5,
    y: 1,
  }
}
prevData = { ...data }

let lifeBar1, lifeBarEmpty1
let lifeBar2, lifeBarEmpty2
let ryu, player2

const idleFrames = 4
let currentFrame = 0

const idleFrameDelay = 8
let currentIdleFrameDelay = 0

let timeSinceLastTick = 0

loader
.add('ryu', './sprites/ryu.gif')
.add('./sprites/background.jpg')
.load(setup)

function setup() {
  const ryuSheet = Texture.from('ryu',)
  const ryuWidth = 54
  const ryuFrame = new Rectangle(0, 15, ryuWidth, 90)
  ryuSheet.frame = ryuFrame
  ryu = new Sprite(ryuSheet)
  ryu.scale.set(4.0, 4.0)
  ryu.x = 300
  ryu.y = floorY
  ryu.anchor.x = 0.5
  ryu.anchor.y = 1

  player2 = new Sprite(Texture.from('ryu'))
  player2.scale.set(4.0, 4.0)
  player2.x = 900
  player2.y = floorY
  player2.anchor.x = 0.5
  player2.anchor.y = 1
  player2.scale.x *= -1
  

  const background = new Sprite(loader.resources['./sprites/background.jpg'].texture)

  lifeBarEmpty1 = drawLifeBarEmpty(true)
  lifeBar1 = drawLifeBarFill(true)
  lifeBarEmpty2 = drawLifeBarEmpty(false)
  lifeBar2 = drawLifeBarFill(false)

  const p1Name = drawPlayerName(data.player1.name, true)
  const p2Name = drawPlayerName(data.player2.name, false)

  app.stage.addChild(background)
  app.stage.addChild(ryu)
  app.stage.addChild(player2)
  app.stage.addChild(lifeBarEmpty1)
  app.stage.addChild(lifeBar1)
  app.stage.addChild(lifeBarEmpty2)
  app.stage.addChild(lifeBar2)
  app.stage.addChild(p1Name)
  app.stage.addChild(p2Name)

  app.ticker.add(delta => gameLoop(delta / 60)) // convert delta to seconds instead of frames
  setInterval(() => {
    serverTick(data)
  }, 1000)
}

function gameLoop(delta) {
  update(delta)

  redraw()
}

function update(delta) {
  timeSinceLastTick += delta

  currentIdleFrameDelay = (currentIdleFrameDelay + 1) % idleFrameDelay
  if (currentIdleFrameDelay === 0)
    currentFrame = (currentFrame + 1) % idleFrames
}

function redraw() {
  const prevPercentage = prevData.player1.health / prevData.player1.maxHealth
  const percentage = data.player1.health / data.player1.maxHealth
  const lerpPercentage = lerp(prevPercentage, percentage, Math.min(timeSinceLastTick / lifebarProps.transitionDuration, 1.0))
  drawLifeBarAtHealth(lifeBar1, lerpPercentage, true)
  drawLifeBarAtHealth(lifeBar2, lerpPercentage, false)

  ryu.position.set(calcPlayerX(data.player1.x), calcPlayerY(data.player1.y))
  player2.position.set(calcPlayerX(data.player2.x), calcPlayerY(data.player2.y))

  updateRyuFrame()
}

function serverTick(data) {
  timeSinceLastTick = 0
  prevData = { ...data }

  data.player1 = { ...data.player1, health: Math.max(data.player1.health - 10, 0) }
  data.player2 = { ...data.player2, health: Math.max(data.player2.health - 10, 0) }
}

function updateRyuFrame() {
  const ryuWidth = 49
  const idleFrame = new Rectangle(2 + ryuWidth * currentFrame, 15, ryuWidth, 90)
  const texture = loader.resources['ryu'].texture
  texture.frame = idleFrame
  ryu.texture = texture
}

function calcPlayerX(x) {
  const centerX = 3
  const cellWidth = 0.1 * app.view.width
  return screenCenterX + (x - centerX) * cellWidth
}

function calcPlayerY(y) {
  const cellHeight = 0.2 * app.view.height
  return floorY - cellHeight * y
}

function drawLifeBarEmpty(isLeft) {
  const { width, height, top, distanceFromCenter } = lifebarProps
  const lifeBarEmpty = new Graphics()
  lifeBarEmpty.beginFill(0xdf2800)
  lifeBarEmpty.lineStyle(2, 0xffffff, 1)
  lifeBarEmpty.drawRect(
    isLeft ? getLifebarLeft() : screenCenterX + distanceFromCenter,
    top,
    width,
    height
  )
  lifeBarEmpty.endFill()
  return lifeBarEmpty
}

function drawLifeBarFill(isLeft) {
  return drawLifeBarAtHealth(new Graphics(), 1.0, isLeft)
}

function drawLifeBarAtHealth(rect, health, isLeft) {
  const { width, height, top, distanceFromCenter, border } = lifebarProps
  if (!health) return rect.clear()

  const halfBorder = border / 2
  return rect
    .clear()
    .beginFill(0xffff00)
    .drawRect(
      (isLeft ? getLifebarLeft(health) + halfBorder : screenCenterX + distanceFromCenter) + halfBorder,
      top + halfBorder,
      width * health - halfBorder * 2,
      height - halfBorder * 2
    )
    .endFill()
}

function getLifebarLeft(health = 1.0) {
  const { width, distanceFromCenter } = lifebarProps
  return screenCenterX - distanceFromCenter - width * health
}

function getLifebarRight() {
  const { distanceFromCenter, width } = lifebarProps
  return screenCenterX + distanceFromCenter + width
}

function drawPlayerName(name, isLeft) {
  const fontSize = 26
  const marginBottom = 5
  const y = lifebarProps.top + lifebarProps.height + marginBottom
  const style = new TextStyle({ fontFamily: 'Arial Black', fontSize, fontVariant: 'small-caps', fill: 'white', stroke: '#000000', strokeThickness: 3 })
  const text = new Text(name, style)
  text.position.set(isLeft ? getLifebarLeft() : getLifebarRight(), y)
  if (!isLeft) {
    text.position.x -= text.width
  }
  return text
}
