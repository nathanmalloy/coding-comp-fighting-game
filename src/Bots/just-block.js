import bot from './base-bot'

export default function justBlockBot(name) {
  return bot(name, game => {
    return { button: 'block' }
  })
}
