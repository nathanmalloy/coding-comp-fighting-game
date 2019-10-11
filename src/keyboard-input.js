let movement
let action
let onCommand

const moveMap = {
  ArrowLeft: 'left',
  ArrowRight: 'right',
  ArrowUp: 'up',
  ArrowDown: 'down',
}

const actionMap = {
  z: 'attack',
  x: 'block',
}

function init(onCommandHandler) {
  //TODO: join game
  onCommand = onCommandHandler
  window.addEventListener('keydown', handleKeydown)
}

function teardown() {
  window.removeEventListener('keydown', handleKeydown)
}

function handleKeydown({ key }) {
  const oldMovement = movement
  const oldAction = action
  console.log(key)
  if (moveMap[key]) {
    movement = moveMap[key]
  }
  if (actionMap[key]) {
    action = actionMap[key]
  }

  if (oldMovement !== movement || oldAction !== action) {
    if (onCommand) onCommand({ movement, action })
  }
}

function reset() {
  movement = null
  action = null
}

export { init, teardown, reset }
