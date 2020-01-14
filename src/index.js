import { setupApp } from './game'

const games = {}
const container = document.querySelector('.container')

function addNewGame(gameId) {
  const app = setupApp(gameId)
  games[gameId] = app
  container.appendChild(app.view)
}

function removeGame(gameId) {
  const app = games[gameId]
  container.removeChild(app.view)
  games[gameId] = null
}

addNewGame('test')

window.addEventListener('keydown', e => {
  if (e.key === ' ') {
    addNewGame(Math.random())
  }
})
