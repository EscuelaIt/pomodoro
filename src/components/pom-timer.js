import { LitElement, html, css } from 'lit'
import '@dile/ui/components/button/button.js'

// Constantes de configuración
const DEFAULT_TIME_DISPLAY = '25:00'

export class PomTimer extends LitElement {
  static styles = css`
    :host {
      display: block;
      background-color: white;
      border-radius: 12px;
      padding: 40px 30px;
      box-shadow: 0 2px 8px rgba(193, 39, 45, 0.08);
      max-width: 420px;
      margin: 0 auto;
    }

    .timer-display {
      text-align: center;
      font-family: 'Courier Prime', monospace;
      font-size: 72px;
      font-weight: 700;
      margin: 30px 0;
      color: #C1272D;
      letter-spacing: 0.05em;
      line-height: 1;
    }

    .progress-grid {
      display: grid;
      grid-template-columns: repeat(5, 1fr);
      gap: 6px;
      margin-bottom: 30px;
      max-width: 100%;
    }

    .progress-cell {
      aspect-ratio: 1;
      background-color: #f0ebe3;
      border-radius: 4px;
      transition: background-color 0.3s ease;
    }

    .progress-cell.filled {
      background-color: #C1272D;
    }

    .progress-cell.rest {
      background-color: #2D5016;
    }

    .button-group {
      display: flex;
      justify-content: center;
      gap: 12px;
      margin-top: 30px;
    }

    dile-button {
      --dile-button-padding-y: 12px;
      --dile-button-padding-x: 28px;
      --dile-button-font-size: 14px;
      font-weight: 600;
      letter-spacing: 0.02em;
    }

    .btn-start {
      --dile-primary-color: #2D5016;
      --dile-on-primary-color: white;
    }

    .btn-reset {
      --dile-primary-color: #C1272D;
      --dile-on-primary-color: white;
    }
  `

  static properties = {
    time: { type: String },
    timeLeft: { type: Number },
    totalSeconds: { type: Number },
    isRunning: { type: Boolean }
  }

  constructor() {
    super()
    this.time = DEFAULT_TIME_DISPLAY
    this.timeLeft = 25 * 60
    this.totalSeconds = 25 * 60
    this.isRunning = false
  }

  _getProgressCells() {
    const TOTAL_CELLS = 25
    const elapsed = this.totalSeconds - this.timeLeft
    const cellsToFill = Math.round((elapsed / this.totalSeconds) * TOTAL_CELLS)
    
    const cells = []
    for (let i = 0; i < TOTAL_CELLS; i++) {
      cells.push(i < cellsToFill)
    }
    return cells
  }

  render() {
    const progressCells = this._getProgressCells()
    
    return html`
      <div class="progress-grid">
        ${progressCells.map(isFilled => html`
          <div class="progress-cell ${isFilled ? 'filled' : ''}"></div>
        `)}
      </div>
      
      <div class="timer-display">${this.time}</div>
      
      <div class="button-group">
        <dile-button class="btn btn-start" @click=${this._handleStart}>
          ${this.isRunning ? '⏸ Pausar' : '▶ Iniciar'}
        </dile-button>
        <dile-button class="btn btn-reset" @click=${this._handleReset}>↻ Reiniciar</dile-button>
      </div>
    `
  }

  _handleStart() {
    this.dispatchEvent(new CustomEvent('timer-start', { bubbles: true, composed: true }))
  }

  _handleReset() {
    this.dispatchEvent(new CustomEvent('timer-reset', { bubbles: true, composed: true }))
  }
}

customElements.define('pom-timer', PomTimer)