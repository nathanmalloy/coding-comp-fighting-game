import Axios from "axios"

function findExistingGame(name, games) {
  return games.find(g => g.players.find(p => p.name === name))
}

export default function bot(name, chooseMove) {
  let gameId
  let interval
  Axios.get('/games').then(({ data }) => {
    const game = findExistingGame(name, data.games)
    if (game) {
      gameId = game.id
    } else {
      // TODO: join a game
    }

    interval = setInterval(() => {
      Axios.get('/games').then(({ data }) => {
        const game = findExistingGame(name, data.games)
        const move = chooseMove(game)

        Axios.post(`/games/${gameId}/move`, {
          id: name,
          moves: [
            move,
          ]
        }).catch(e => {
          clearInterval(interval)
        })
      })
    }, 1000)

  })
}
