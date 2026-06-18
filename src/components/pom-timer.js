import { LitElement, html, css } from 'lit'

// Constantes de configuración
const DEFAULT_TIME_DISPLAY = '25:00'

export class PomTimer extends LitElement {
  static styles = css`
    :host {
      display: block;
      background-color: #f5f5f5;
      border-radius: 15px;
      padding: 30px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      max-width: 300px;
      margin: 0 auto;
    }

    .timer {
      text-align: center;
      font-size: 48px;
      margin: 20px 0;
      font-weight: bold;
    }

    .button-group {
      display: flex;
      justify-content: center;
      gap: 10px;
      margin: 20px 0;
    }

    button {
      padding: 10px 20px;
      font-size: 16px;
      cursor: pointer;
      border: none;
      border-radius: 5px;
      transition: all 0.3s ease;
    }

    .btn-start {
      background-color: #4CAF50;
      color: white;
    }

    .btn-start:hover {
      background-color: #45a049;
    }

    .btn-reset {
      background-color: #f44336;
      color: white;
    }

    .btn-reset:hover {
      background-color: #da190b;
    }
  `

  static properties = {
    time: { type: String }
  }

  constructor() {
    super()
    this.time = DEFAULT_TIME_DISPLAY
  }

  render() {
    return html`
      <div class="timer">${this.time}</div>
      <div class="button-group">
        <button class="btn btn-start" @click=${this._handleStart}>Iniciar</button>
        <button class="btn btn-reset" @click=${this._handleReset}>Reiniciar</button>
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
