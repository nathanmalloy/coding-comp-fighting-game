import { Text, TextStyle } from 'pixi.js'

export function drawCountdown(screenWidth, screenHeight, text) {
  const style = new TextStyle({
    fontSize: 0.15 * screenHeight,
    fontFamily: 'Arial Black',
    fill: 'white',
    stroke: 'black',
    strokeThickness: 3,
  })
  const countdown = new Text(text, style)
  countdown.position.set(screenWidth / 2 - countdown.width / 2, 0.3 * screenHeight)

  countdown.remove = () => {
    countdown.visible = false
  }

  countdown.update = (text) => {
    countdown.textContent = text
  }

  return countdown
}
