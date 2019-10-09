import { Application, Texture, Text, TextStyle, Sprite, Rectangle } from 'pixi.js'
import { addHUD } from './lifebars'

function setupApp() {
  const app = new Application({ width: 1280, height: 720 })
  const loader = app.loader
  document.body.appendChild(app.view)

  const screenCenterX = app.view.width / 2
  const screenCenterY = app.view.height / 2

  const floorY = 0.94 * app.view.height

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

  let ryu, player2
  let hud

  const ryuSpriteWidth = 49
  const ryuSpriteHeight = 90
  const ryuScale = 4.0
  const xPosScale = ryuSpriteWidth * ryuScale

  const idleFrames = 4
  let currentFrame = 0

  const idleFrameDelay = 8
  let currentIdleFrameDelay = 0

  let timeSinceLastTick = 0

  let isInit = true

  loader
    .add('ryu', './sprites/ryu.gif')
    .add('background', './sprites/background.jpg')
    .load(setup)

  function setup() {
    const ryuSheet = Texture.from('ryu',)
    const ryuFrame = new Rectangle(0, 15, ryuSpriteWidth, ryuSpriteHeight)
    ryuSheet.frame = ryuFrame
    ryu = new Sprite(ryuSheet)
    const ryuScale = 4.0 //0.5 * app.view.height / ryuSpriteHeight
    ryu.scale.set(ryuScale)
    ryu.x = 300
    ryu.y = floorY
    ryu.anchor.x = 0.5
    ryu.anchor.y = 1

    player2 = new Sprite(Texture.from('ryu'))
    player2.scale.set(ryuScale)
    player2.x = 900
    player2.y = floorY
    player2.anchor.x = 0.5
    player2.anchor.y = 1
    player2.scale.x *= -1
    

    const background = new Sprite(loader.resources['background'].texture)
    // background.height = app.view.height
    // background.x += (app.view.width - background.width) / 2

    
    app.stage.addChild(background)
    app.stage.addChild(ryu)
    app.stage.addChild(player2)
    hud = addHUD(app, data.player1.name, data.player2.name)

    if (isInit) {
      app.ticker.add(delta => gameLoop(delta / 60)) // convert delta to seconds instead of frames
      setInterval(() => {
        serverTick(data)
      }, 1000)
      isInit = false
    }

    setTimeout(() => reset(), 10000)
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
    hud.update(prevData, data, timeSinceLastTick)

    ryu.position.set(calcPlayerX(data.player1.x), calcPlayerY(data.player1.y))
    player2.position.set(calcPlayerX(data.player2.x), calcPlayerY(data.player2.y))

    updateRyuFrame()
  }

  function serverTick(data) {
    timeSinceLastTick = 0
    prevData = { ...data }

    if (data.winner) {
      declareWinner(data.winner)
    } else {
      data.player1 = { ...data.player1, health: Math.max(data.player1.health - 10, 0) }
      data.player2 = { ...data.player2, health: Math.max(data.player2.health - 10, 0) }
    }
  }

  function updateRyuFrame() {
    const idleFrame = new Rectangle(2 + ryuSpriteWidth * currentFrame, 15, ryuSpriteWidth, 90)
    const texture = loader.resources['ryu'].texture
    texture.frame = idleFrame
    ryu.texture = texture
  }

  function calcPlayerX(x) {
    const centerX = 3
    return screenCenterX + (x - centerX) * xPosScale
  }

  function calcPlayerY(y) {
    const cellHeight = 0.2 * app.view.height
    return floorY - cellHeight * y
  }

  function drawWinText(winnerName) {
    const fontSize = 0.1 * app.view.height
    const style = new TextStyle({
      fontSize,
      fontFamily: 'Arial Black',
      fill: 'white',
      stroke: 'black',
      strokeThickness: 3,
      align: 'center',
      fontVariant: 'small-caps',
      letterSpacing: 4,
    })
    const text = new Text(`${winnerName} WINS`, style)
    text.position.set(screenCenterX - text.width / 2, 0.3 * app.view.height)
    return text
  }

  function declareWinner(winnerName) {
    app.addChild(drawWinText(winnerName))
  }

  function reset() {
    app.stage.removeChildren()
    data.player1 = {
      name: 'Player 1',
      health: 100,
      maxHealth: 100,
      x: 3,
      y: 0,
    }
    data.player2 = {
      name: 'Player 2',
      health: 100,
      maxHealth: 100,
      x: 4,
      y: 1,
    }
    setup()
  }

  return app
}

export { setupApp }
