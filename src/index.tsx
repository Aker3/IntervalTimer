import { render } from 'solid-js/web'
import { registerSW } from 'virtual:pwa-register'
import App from './App'
import './styles.css'

registerSW({ immediate: true })

const root = document.getElementById('root')
if (root) {
  render(() => <App />, root)
}
