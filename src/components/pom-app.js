import { LitElement, html, css } from 'lit'
import '@dile/ui/components/toast/toast.js'
import './pom-timer.js'

// Constantes de configuración
const POMODORO_DURATION_MINUTES = 1
const SECONDS_PER_MINUTE = 60
const TIMER_INTERVAL_MS = 1000
const INITIAL_TIME_DISPLAY = `${String(POMODORO_DURATION_MINUTES).padStart(2, '0')}:00`
const TOAST_DURATION_MS = 3000

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

  connectedCallback() {
    super.connectedCallback()
    this.addEventListener('positive-feedback', this._handlePositiveFeedback.bind(this))
    this.addEventListener('negative-feedback', this._handleNegativeFeedback.bind(this))
  }

  render() {
    return html`
      <dile-toast id="appToast" duration=${TOAST_DURATION_MS}></dile-toast>
      
      <pom-timer .time=${this.time} @timer-start=${this._handleStart} @timer-reset=${this._handleReset}></pom-timer>
    `
  }

  _handleStart() {
    if (this.isRunning) {
      // Pausar
      clearInterval(this.interval)
      this.isRunning = false
      this.positiveFeedback('⏸ Timer pausado')
    } else {
      // Iniciar
      this.isRunning = true
      this.positiveFeedback('▶ Timer iniciado')
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
    this.positiveFeedback('🔄 Timer reiniciado')
  }

  _updateTimeDisplay() {
    const minutes = Math.floor(this.timeLeft / SECONDS_PER_MINUTE)
    const seconds = this.timeLeft % SECONDS_PER_MINUTE
    this.time = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
  }

  _playNotification() {
    this.positiveFeedback('✅ ¡Pomodoro completado!')
  }

  positiveFeedback(message) {
    const toast = this.shadowRoot.getElementById('appToast')
    if (toast) {
      toast.open(message, 'success')
    }
  }

  negativeFeedback(message) {
    const toast = this.shadowRoot.getElementById('appToast')
    if (toast) {
      toast.open(message, 'error')
    }
  }

  _handlePositiveFeedback(event) {
    this.positiveFeedback(event.detail.message)
  }

  _handleNegativeFeedback(event) {
    this.negativeFeedback(event.detail.message)
  }
}

customElements.define('pom-app', PomApp)
