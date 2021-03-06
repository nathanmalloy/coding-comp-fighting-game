import { Graphics, Text, TextStyle } from 'pixi.js'
import { lerp } from './math'

const maxHealth = 100

export function addHUD(app, p1Name, p2Name) {
  const screenWidth = app.view.width
  const screenHeight = app.view.height
  const screenCenterX = screenWidth / 2

  const lifebarProps = {
    width: 0.35 * screenWidth,
    height: 0.06 * screenHeight,
    top: 0.1 * screenHeight,
    distanceFromCenter: 0.03 * screenWidth,
    border: 1,
    transitionDuration: 0.2, // secs
  }

  function drawLifeBarEmpty(isLeft) {
    const { width, height, top, distanceFromCenter } = lifebarProps
    const lifeBarEmpty = new Graphics()
    lifeBarEmpty.beginFill(0xdf2800)
    lifeBarEmpty.lineStyle(2, 0xffffff, 1, 1)
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

    return rect
      .clear()
      .beginFill(0xffff00)
      .drawRect(
        (isLeft ? getLifebarLeft(health) : screenCenterX + distanceFromCenter),
        top,
        width * health,
        height
      )
      .endFill()
  }

  function drawPlayerName(name, isLeft) {
    const fontSize = 0.036 * screenHeight
    const marginBottom = 5
    const y = lifebarProps.top + lifebarProps.height + marginBottom
    const style = new TextStyle({
      fontFamily: 'Arial Black',
      fontSize,
      fontVariant: 'small-caps',
      fill: 'white',
      stroke: '#000000',
      strokeThickness: 3,
    })
    const text = new Text(name, style)
    text.position.set(isLeft ? getLifebarLeft() : getLifebarRight(), y)
    if (!isLeft) {
      text.position.x -= text.width
    }
    return text
  }

  function drawTimer() {
    const fontSize = 0.06 * screenHeight
    const x = screenCenterX
    const y = lifebarProps.top + lifebarProps.height / 2

    const style = new TextStyle({
      fontFamily: 'Arial Black',
      fontSize,
      fill: 'white',
      stroke: '#000000',
      strokeThickness: 5,
    })
    const text = new Text('', style)
    text.anchor.set(0.5)
    text.position.set(x, y)
    return text
  }

  function updateHealthBar(lifebar, isLeft, prevHealth, health, maxHealth, timeSinceLastTick) {
    const prevPercentage = prevHealth / maxHealth
    const percentage = health / maxHealth
    const lerpPercentage = lerp(prevPercentage, percentage, Math.min(timeSinceLastTick / lifebarProps.transitionDuration, 1.0))
    drawLifeBarAtHealth(lifebar, lerpPercentage, isLeft)
  }

  function updateTimer(timer, turnsLeft) {
    timer.text = (turnsLeft || '00').toString().padStart(2, 0)
  }

  function getLifebarLeft(health = 1.0) {
    const { width, distanceFromCenter } = lifebarProps
    return screenCenterX - distanceFromCenter - width * health
  }

  function getLifebarRight() {
    const { distanceFromCenter, width } = lifebarProps
    return screenCenterX + distanceFromCenter + width
  }

  function update(prevData, data, timeSinceLastTick) {
    updateHealthBar(lifeBar1, true, prevData.players[0].health, data.players[0].health, maxHealth, timeSinceLastTick)
    updateHealthBar(lifeBar2, false, prevData.players[1].health, data.players[1].health, maxHealth, timeSinceLastTick)
    updateTimer(timer, data.time_remaining)
  }

  const lifeBarEmpty1 = drawLifeBarEmpty(true)
  const lifeBar1 = drawLifeBarFill(true)
  const lifeBarEmpty2 = drawLifeBarEmpty(false)
  const lifeBar2 = drawLifeBarFill(false)

  const name1 = drawPlayerName(p1Name, true)
  const name2 = drawPlayerName(p2Name, false)
  const timer = drawTimer()

  app.stage.addChild(lifeBarEmpty1)
  app.stage.addChild(lifeBar1)
  app.stage.addChild(lifeBarEmpty2)
  app.stage.addChild(lifeBar2)

  app.stage.addChild(name1)
  app.stage.addChild(name2)

  app.stage.addChild(timer)

  return { update }
}
