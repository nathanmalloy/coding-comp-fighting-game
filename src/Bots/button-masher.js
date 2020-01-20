import bot from './base-bot'

export default function buttonMashBot(name) {
  const choices = [
    { button: 'attack' },
    { button: 'attack' },
    { button: 'attack' },
    { button: 'block' },
    { button: 'block' },
    { button: 'block' },
    { direction: 'up' },
    { direction: 'down' },
    { direction: 'left' },
    { direction: 'left' },
    { direction: 'left' },
    { direction: 'right' },
    { direction: 'right' },
    { direction: 'right' },
    { direction: 'down', button: 'attack' },
    { direction: 'down', button: 'block' },
  ]

  return bot(name, game => {
    const choice = Math.trunc(Math.random() * choices.length)
    return choices[choice]
  })
}
