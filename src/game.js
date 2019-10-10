import { Application, Text, TextStyle, Sprite } from 'pixi.js'
import { addHUD } from './lifebars'
import { lerp, easeOut } from './math'

function setupApp() {
  const app = new Application({ width: 1280, height: 720 })
  const loader = app.loader

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
      y: 0,
      isFacingLeft: true,
    }
  }
  prevData = { ...data }

  let ryu, player2
  let hud

  const ryuSpriteWidth = 49
  const ryuSpriteHeight = 90
  const ryuScale = 4.0 //0.5 * app.view.height / ryuSpriteHeight
  const xPosScale = ryuSpriteWidth * ryuScale - 4
  const playerMoveTransitionDuration = 0.2 // sec

  const idleFrames = 4
  let currentFrame = 0

  const idleFrameDelay = 8
  let currentIdleFrameDelay = 0

  let timeSinceLastTick = 0

  let isInit = true

  loader
    .add('spritesheet', './sprites/player-spritesheet.json')
    .add('background', './sprites/background.jpg')
    .load(setup)

  function setup() {
    ryu = drawPlayer()
    player2 = drawPlayer()

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

    redrawPlayer(ryu, prevData.player1, data.player1)
    redrawPlayer(player2, prevData.player2, data.player2)
  }

  function serverTick(data) {
    timeSinceLastTick = 0
    prevData = { ...data }

    if (data.winner) {
      declareWinner(data.winner)
    } else {
      data.player1 = { ...data.player1, x: data.player1.x === 3 ? 4 : 3 }
      data.player2 = { ...data.player2, health: Math.random() < 0.3 ? Math.max(data.player2.health - 10, 0) : data.player2.health }
    }
  }

  function drawPlayer() {
    const sprite = new Sprite(getIdle())
    sprite.scale.set(ryuScale)
    // sprite.x = 900
    sprite.y = floorY
    sprite.anchor.x = 0.5
    sprite.anchor.y = 1

    return sprite
  }

  function redrawPlayer(player, prevPlayerData, playerData) {
    const tMove = Math.min(timeSinceLastTick / playerMoveTransitionDuration, 1.0)
    const x = lerp(calcPlayerX(prevPlayerData.x), calcPlayerX(playerData.x), easeOut(tMove))
    const y = lerp(calcPlayerY(prevPlayerData.y), calcPlayerY(playerData.y), easeOut(tMove))
    player.position.set(x, y)

    updatePlayerFrame(player, prevPlayerData, playerData)

    if (playerData.isFacingLeft) {
      player.scale.x = -ryuScale
    } else {
      player.scale.x = ryuScale
    }
  }

  function updatePlayerFrame(player, prevPlayerData, playerData) {
    if (wasHit(prevPlayerData, playerData)) {
      player.texture = getHitFrame()

      player.position.x += calcShake()
    } else {
      player.texture = getIdle(currentFrame)
    }
  }

  function getIdle(currentFrame = 0) {
    return loader.resources['spritesheet'].textures[`idle-${currentFrame}`]
  }

  function getHitFrame(currentFrame = 0) {
    return loader.resources['spritesheet'].textures['hit']
  }

  function wasHit(prevPlayerData, playerData) {
    return prevPlayerData.health > playerData.health
  }

  function calcShake() {
    const shakeDuration = 0.5
    const shakeDistance = 0.2 * ryuSpriteWidth
    const shakes = 4
    const offset = timeSinceLastTick > shakeDuration ? 0 : Math.sin(timeSinceLastTick * (shakes * Math.PI * 2 / shakeDuration)) * shakeDistance
    return offset
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
      y: 0,
      isFacingLeft: true,
    }
    setup()
  }

  return app
}

export { setupApp }
