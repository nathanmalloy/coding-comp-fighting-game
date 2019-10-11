import { Graphics, Text, TextStyle } from 'pixi.js'
import { lerp } from './math'

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

  function updateHealthBar(lifebar, isLeft, prevHealth, health, maxHealth, timeSinceLastTick) {
    const prevPercentage = prevHealth / maxHealth
    const percentage = health / maxHealth
    const lerpPercentage = lerp(prevPercentage, percentage, Math.min(timeSinceLastTick / lifebarProps.transitionDuration, 1.0))
    drawLifeBarAtHealth(lifebar, lerpPercentage, isLeft)
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
    updateHealthBar(lifeBar1, true, prevData.player1.health, data.player1.health, data.player1.maxHealth, timeSinceLastTick)
    updateHealthBar(lifeBar2, false, prevData.player2.health, data.player2.health, data.player2.maxHealth, timeSinceLastTick)
  }

  const lifeBarEmpty1 = drawLifeBarEmpty(true)
  const lifeBar1 = drawLifeBarFill(true)
  const lifeBarEmpty2 = drawLifeBarEmpty(false)
  const lifeBar2 = drawLifeBarFill(false)

  const name1 = drawPlayerName(p1Name, true)
  const name2 = drawPlayerName(p2Name, false)

  app.stage.addChild(lifeBarEmpty1)
  app.stage.addChild(lifeBar1)
  app.stage.addChild(lifeBarEmpty2)
  app.stage.addChild(lifeBar2)

  app.stage.addChild(name1)
  app.stage.addChild(name2)

  return { update }
}
