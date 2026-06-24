import { LitElement, html, css } from 'lit'
import '@dile/ui/components/toast/toast.js'
import './pom-timer.js'
import './pom-sessions-history.js'
import { PomodoroSessionService } from '../services/pomodoroSessionService.js'

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
    timeLeft: { type: Number },
    sessionId: { type: String },
    sessionService: { type: Object }
  }

  constructor() {
    super()
    this.time = INITIAL_TIME_DISPLAY
    this.isRunning = false
    this.timeLeft = POMODORO_DURATION_MINUTES * SECONDS_PER_MINUTE
    this.interval = null
    this.sessionId = null
    this.sessionService = new PomodoroSessionService()
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
      
      <pom-sessions-history .pomodoroService=${this.sessionService}></pom-sessions-history>
    `
  }

  _handleStart() {
    if (this.isRunning) {
      // Pausar: detener timer local y guardar en API (sin bloquear si falla)
      clearInterval(this.interval)
      this.isRunning = false
      this.positiveFeedback('⏸ Timer pausado')
      
      // Llamar API en background, pero no es crítico si falla
      if (this.sessionId) {
        this.sessionService.stopSession()
          .catch((err) => {
            this.negativeFeedback(`⚠️ No se guardó la pausa: ${err.message}`)
          })
      }
    } else {
      // Iniciar: llamar API PRIMERO, y solo si es exitoso iniciar el timer
      this._startSessionWithAPI()
    }
  }

  async _startSessionWithAPI() {
    try {
      const session = await this.sessionService.startSession()
      this.sessionId = session.id
      
      // Solo iniciar el timer si el API respondió exitosamente
      this.isRunning = true
      this.positiveFeedback('▶ Timer iniciado')
      
      this.interval = setInterval(() => {
        if (this.timeLeft > 0) {
          this.timeLeft--
          this._updateTimeDisplay()
        } else {
          clearInterval(this.interval)
          this.isRunning = false
          this._stopSessionAndNotify()
        }
      }, TIMER_INTERVAL_MS)
    } catch (error) {
      // No iniciar el timer si falla el API
      this.negativeFeedback(`❌ No se pudo iniciar: ${error.message}`)
      this.isRunning = false
    }
  }

  _handleReset() {
    clearInterval(this.interval)
    this.isRunning = false
    this.timeLeft = POMODORO_DURATION_MINUTES * SECONDS_PER_MINUTE
    this.time = INITIAL_TIME_DISPLAY
    
    // Parar la sesión en el API
    if (this.sessionId) {
      this.sessionService.stopSession()
        .then(() => {
          this.sessionId = null
          this.positiveFeedback('🔄 Timer reiniciado')
        })
        .catch((err) => {
          this.sessionId = null
          this.positiveFeedback('🔄 Timer reiniciado (con aviso: ' + err.message + ')')
        })
    } else {
      this.positiveFeedback('🔄 Timer reiniciado')
    }
  }

  _updateTimeDisplay() {
    const minutes = Math.floor(this.timeLeft / SECONDS_PER_MINUTE)
    const seconds = this.timeLeft % SECONDS_PER_MINUTE
    this.time = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
  }

  async _stopSessionAndNotify() {
    if (this.sessionId) {
      try {
        await this.sessionService.stopSession()
        this.sessionId = null
        this._playNotification()
      } catch (err) {
        this._playNotification()
        this.negativeFeedback(`⚠️ Pomodoro completado, pero no se guardó: ${err.message}`)
      }
    } else {
      this._playNotification()
    }
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