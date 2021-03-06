import { Application, Text, TextStyle, Sprite } from 'pixi.js'
import { addHUD } from './lifebars'
import { drawCountdown } from './countdown'
import { lerp, easeOut } from './math'

function setupApp(gameId, initialData) {
  const app = new Application({ width: 1280, height: 720 })
  const loader = app.loader

  const screenCenterX = app.view.width / 2
  const screenCenterY = app.view.height / 2

  const floorY = 0.92 * app.view.height

  let data = initialData
  let prevData = { ...data }

  let ryu, player2
  let countdown
  let hud

  // ryu
  // const playerSpriteWidth = 49
  // const playerSpriteHeight = 90
  // const playerScale = 4.0 //0.5 * app.view.height / ryuSpriteHeight
  
  // panda
  const playerSpriteWidth = 275
  const playerSpriteHeight = 376
  const playerScale = 0.7

  const pandaPoseMap = {
    hurt: 'idle',
  }

  const xPosScale = playerSpriteWidth / 2 * playerScale - 4
  const playerMoveTransitionDuration = 0.2 // sec

  const idleFrames = 4
  let currentFrame = 0

  const idleFrameDelay = 8
  let currentIdleFrameDelay = 0

  let timeSinceLastTick = 0

  let isInit = true

  loader
    .add('ryu', './sprites/ryu.json')
    .add('panda', './sprites/panda.json')
    .add('background', './sprites/background.jpg')
    .load(setup)

  function setup() {
    ryu = drawPlayer()
    player2 = drawPlayer()

    const background = new Sprite(loader.resources['background'].texture)
    // background.height = app.view.height
    // background.x += (app.view.width - background.width) / 2

    countdown = drawCountdown(app.view.width, app.view.height, 3)
    countdown.remove()

    app.stage.addChild(background)
    app.stage.addChild(ryu)
    app.stage.addChild(player2)
    app.stage.addChild(countdown)
    hud = addHUD(app, data.players[0].name, data.players[1].name)

    if (isInit) {
      app.ticker.add(delta => gameLoop(delta / 60)) // convert delta to seconds instead of frames
      setInterval(() => {
        serverTick(data)
      }, 1000)
      isInit = false
    }
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

    redrawPlayer(ryu, prevData.players[0], data.players[0])
    redrawPlayer(player2, prevData.players[1], data.players[1])
  }

  function serverTick(newData) {
    if (newData.time_remaining === data.time_remaining) return
    prevData = { ...data }
    data = newData

    timeSinceLastTick = 0

    if (data.winner) {
      declareWinner(data.winner)
    }
  }

  function drawPlayer() {
    const sprite = new Sprite(getFrame('idle'))
    sprite.scale.set(playerScale)
    // sprite.x = 900
    sprite.y = floorY
    sprite.anchor.x = 0.5
    sprite.anchor.y = 1

    return sprite
  }

  function redrawPlayer(player, prevPlayerData, playerData) {
    const tMove = Math.min(timeSinceLastTick / playerMoveTransitionDuration, 1.0)
    const x = lerp(calcPlayerX(prevPlayerData.location[0].x), calcPlayerX(playerData.location[0].x), easeOut(tMove))
    const y = lerp(calcPlayerY(prevPlayerData.location[0].y), calcPlayerY(playerData.location[0].y), easeOut(tMove))
    player.position.set(x, y)

    updatePlayerFrame(player, prevPlayerData, playerData)

    if (playerData.direction === 'RIGHT') {
      player.scale.x = -playerScale
    } else {
      player.scale.x = playerScale
    }
  }

  function updatePlayerFrame(player, prevPlayerData, playerData) {
    if (wasHit(prevPlayerData, playerData)) {
      player.texture = getFrame('hurt')

      player.position.x += calcShake()
    } else {
      const state = getPlayerState(playerData)
      player.texture = getFrame(state, currentFrame)
    }
  }

  function getFrame(pose, currentFrame = 0) {
    const character = loader.resources['panda'].textures
    return character[`${pose}-${currentFrame}`] || character[pose] || character[pandaPoseMap[pose]]
  }

  function getPlayerState(playerData) {
    const isCrouched = playerData.location.length === 1
    const isJumping = playerData.location[0].y > 0
    const isAttacking = playerData.attacking_cells.length
    const isBlocking = playerData.blocking_cells.length
    // TODO: 'victory' and 'lose'
    if (isJumping) {
      return isAttacking ? 'attack-kick' : 'jump'
    } else if (isAttacking) {
      return isCrouched ? 'crouch-attack' : 'attack'
    } else if (isBlocking) {
      return isCrouched ? 'crouch-block' : 'block'
    } else {
      return isCrouched ? 'crouch' : 'idle'
    }
  }

  function wasHit(prevPlayerData, playerData) {
    return prevPlayerData.health > playerData.health
  }

  function calcShake() {
    const shakeDuration = 0.5
    const shakeDistance = 0.12 * playerSpriteWidth
    const shakes = 4
    const offset = timeSinceLastTick > shakeDuration ? 0 : Math.sin(timeSinceLastTick * (shakes * Math.PI * 2 / shakeDuration)) * shakeDistance
    return offset
  }

  function calcPlayerX(x) {
    const centerX = 4.5
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

  app.gameId = gameId
  app.update = serverTick

  return app
}

export { setupApp }
