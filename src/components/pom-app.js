import { LitElement, html, css } from 'lit'
import './pom-timer.js'

// Constantes de configuración
const POMODORO_DURATION_MINUTES = 1
const SECONDS_PER_MINUTE = 60
const TIMER_INTERVAL_MS = 1000
const INITIAL_TIME_DISPLAY = `${String(POMODORO_DURATION_MINUTES).padStart(2, '0')}:00`

export class PomApp extends LitElement {
  static styles = css`
    :host {
      display: block;
    }

    h1 {
      text-align: center;
      margin: 20px 0;
    }
  `

  static properties = {
    time: { type: String },
    isRunning: { type: Boolean },
    timeLeft: { type: Number }
  }

  constructor() {
    super()
    this.time = INITIAL_TIME_DISPLAY
    this.isRunning = false
    this.timeLeft = POMODORO_DURATION_MINUTES * SECONDS_PER_MINUTE
    this.interval = null
  }

  render() {
    return html`
      <h1>Pomodoro Timer</h1>
      <pom-timer .time=${this.time} @timer-start=${this._handleStart} @timer-reset=${this._handleReset}></pom-timer>
    `
  }

  _handleStart() {
    if (this.isRunning) {
      // Pausar
      clearInterval(this.interval)
      this.isRunning = false
    } else {
      // Iniciar
      this.isRunning = true
      this.interval = setInterval(() => {
        if (this.timeLeft > 0) {
          this.timeLeft--
          this._updateTimeDisplay()
        } else {
          clearInterval(this.interval)
          this.isRunning = false
          this._playNotification()
        }
      }, TIMER_INTERVAL_MS)
    }
  }

  _handleReset() {
    clearInterval(this.interval)
    this.isRunning = false
    this.timeLeft = POMODORO_DURATION_MINUTES * SECONDS_PER_MINUTE
    this.time = INITIAL_TIME_DISPLAY
    console.log('Timer reiniciado')
  }

  _updateTimeDisplay() {
    const minutes = Math.floor(this.timeLeft / SECONDS_PER_MINUTE)
    const seconds = this.timeLeft % SECONDS_PER_MINUTE
    this.time = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
  }

  _playNotification() {
    console.log('¡Tiempo completado!')
    // Aquí puedes agregar un sonido o notificación visual
  }
}

customElements.define('pom-app', PomApp)
