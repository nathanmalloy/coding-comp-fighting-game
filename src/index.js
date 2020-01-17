import axios from 'axios'
import { setupApp } from './game'
import divekickBot from './Bots/divekick-spam'
import justBlockBot from './Bots/just-block'
import buttonMashBot from './Bots/button-masher'

const games = {}
const container = document.querySelector('.container')

function addNewGame(gameId, data) {
  const app = setupApp(gameId, data)
  games[gameId] = app
  container.appendChild(app.view)
}

function removeGame(gameId) {
  const app = games[gameId]
  container.removeChild(app.view)
  delete games[gameId]
}

window.addEventListener('keydown', e => {
  if (e.key === ' ') {
    axios.post('/games')
  }
})

setInterval(() => {
  getUpdateFromServer()
}, 300)

function getUpdateFromServer() {
  axios.get(`/games`).then(({ data }) => {
    const removedGames = Object.keys(games).filter(g => 
      !data.games.some(serverGame => serverGame.id === games[g].gameId)
    )
    removedGames.forEach(g => removeGame(g))

    data.games.forEach(game => {
      if (games[game.id]) {
        games[game.id].update(game)
      } else {
        addNewGame(game.id, game)
      }
    })
  })
}

function move(direction, button) {
  axios.post(`/games/${gameId}/move`, { moves: [
    { direction, button },
  ]}).then(response => {
    console.log(response)
  })
}

axios.post('/games').then(() => {
  divekickBot('Foo')
  // justBlockBot('Bar')
  buttonMashBot('Bar')
})
