import bot from './base-bot'

export default function divekickBot(name) {
  return bot(name, game => {
    return { direction: 'up', button: 'attack' }
  })
}
