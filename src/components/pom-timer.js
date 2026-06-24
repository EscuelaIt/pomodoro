import { LitElement, html, css } from 'lit'
import '@dile/ui/components/button/button.js'

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

    dile-button {
      --dile-button-padding-y: 10px;
      --dile-button-padding-x: 20px;
      --dile-button-font-size: 16px;
    }

    .btn-start {
      --dile-primary-color: #4CAF50;
      --dile-on-primary-color: white;
      --dile-button-hover-background-color: #9fe6a2;
    }

    .btn-reset {
      --dile-primary-color: #f44336;
      --dile-on-primary-color: white;
      --dile-button-hover-background-color: #e2afab;
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
        <dile-button class="btn btn-start" @click=${this._handleStart}>Iniciar</dile-button>
        <dile-button class="btn btn-reset" @click=${this._handleReset}>Reiniciar</dile-button>
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