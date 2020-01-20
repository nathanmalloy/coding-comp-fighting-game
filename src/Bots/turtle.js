import bot from './base-bot'

export default function turtleBot(name) {
  return bot(name, game => {
    const self = game.players.find(p => p.name === name)
    const opponent = game.players.find(p => p.name !== name)
    const opponentCrouching = opponent && opponent.location.length === 1
    const isCrouching = self && self.location.length === 1
    const isBlocking = self && self.blocking_cells.length
    const move = {}
    if (opponentCrouching && !isCrouching) {
      move.direction = 'down'
    } else if (!opponentCrouching && isCrouching) {
      move.direction = 'up'
    }
    if (!isBlocking) {
      move.button = 'block'
    }
    return move
  })
}
