import { setupApp } from './game'

const app = setupApp()
document.body.appendChild(app.view)

// setTimeout(() => {
//   const app2 = setupApp()
//   document.body.appendChild(app2.view)
// }, 500)
