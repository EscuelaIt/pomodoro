import { LitElement, html, css } from 'lit'
import '@dile/ui/components/button/button.js'

// Constantes
const SESSIONS_REFRESH_INTERVAL_MS = 5000
const DATE_FORMAT_OPTIONS = {
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit'
}

export class PomSessionsHistory extends LitElement {
  static styles = css`
    :host {
      display: block;
      margin-top: 40px;
      margin-left: auto;
      margin-right: auto;
      max-width: 600px;
      padding: 0 20px;
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    }

    .history-container {
      border-top: 2px solid #C1272D;
      padding-top: 20px;
    }

    h2 {
      margin: 0 0 20px 0;
      font-family: 'Georgia', serif;
      font-size: 20px;
      color: #C1272D;
      font-weight: 600;
      letter-spacing: -0.01em;
    }

    .controls {
      margin-bottom: 20px;
      display: flex;
      gap: 10px;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      background-color: transparent;
    }

    thead {
      border-bottom: 1px solid #ddd;
    }

    th {
      padding: 12px 0;
      text-align: left;
      border: none;
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      font-weight: 600;
      color: #666;
      font-size: 13px;
      letter-spacing: 0.05em;
      text-transform: uppercase;
    }

    td {
      padding: 14px 0;
      border-bottom: 1px solid #f0f0f0;
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      color: #333;
      font-size: 14px;
    }

    tbody tr:hover {
      background-color: transparent;
    }

    .empty-state {
      text-align: center;
      padding: 40px 20px;
      color: #aaa;
      font-size: 14px;
    }

    .error-state {
      background-color: #fef3f3;
      border-left: 3px solid #C1272D;
      padding: 12px;
      color: #C1272D;
      margin-bottom: 15px;
      font-size: 13px;
    }

    .loading-state {
      text-align: center;
      padding: 20px;
      color: #999;
    }

    dile-button {
      --dile-button-padding: 8px 16px;
      --dile-button-font-size: 14px;
    }
  `

  static properties = {
    pomodoroService: { type: Object },
    sessions: { type: Array },
    isLoading: { type: Boolean },
    error: { type: String }
  }

  constructor() {
    super()
    this.sessions = []
    this.isLoading = false
    this.error = null
    this.pomodoroService = null
  }

  connectedCallback() {
    super.connectedCallback()
    this._loadSessions()
  }

  render() {
    return html`
      <div class="history-container">
        <h2>Historial de Sesiones</h2>

        ${this.error ? html`<div class="error-state">${this.error}</div>` : ''}

        <div class="controls">
          <dile-button @click=${this._handleRefresh}>
            ${this.isLoading ? '⏳ Actualizando...' : '🔄 Actualizar'}
          </dile-button>
        </div>

        ${this.isLoading && this.sessions.length === 0
          ? html`<div class="loading-state">Cargando sesiones...</div>`
          : this.sessions.length === 0
            ? html`<div class="empty-state">No hay sesiones registradas aún</div>`
            : this._renderTable()}
      </div>
    `
  }

  _renderTable() {
    return html`
      <table>
        <thead>
          <tr>
            <th>Inicio</th>
            <th>Fin</th>
            <th>Duración</th>
          </tr>
        </thead>
        <tbody>
          ${this.sessions.map(
            (session) => html`
              <tr>
                <td>${this._formatDate(session.startTime)}</td>
                <td>${session.endTime ? this._formatDate(session.endTime) : '—'}</td>
                <td>${this._formatDuration(session.duration)}</td>
              </tr>
            `
          )}
        </tbody>
      </table>
    `
  }

  async _loadSessions() {
    if (!this.pomodoroService) return

    this.isLoading = true
    this.error = null

    try {
      const sessions = await this.pomodoroService.getSessions()
      this.sessions = sessions || []
    } catch (err) {
      this.error = err.message
      this.sessions = []
    } finally {
      this.isLoading = false
    }
  }

  _handleRefresh() {
    this._loadSessions()
  }

  _formatDate(dateString) {
    try {
      const date = new Date(dateString)
      return date.toLocaleString('es-ES', DATE_FORMAT_OPTIONS)
    } catch (err) {
      return '—'
    }
  }

  _formatDuration(durationSeconds) {
    if (!durationSeconds) return '—'

    const hours = Math.floor(durationSeconds / 3600)
    const minutes = Math.floor((durationSeconds % 3600) / 60)
    const seconds = durationSeconds % 60

    if (hours > 0) {
      return `${hours}h ${minutes}m ${seconds}s`
    } else if (minutes > 0) {
      return `${minutes}m ${seconds}s`
    } else {
      return `${seconds}s`
    }
  }
}

customElements.define('pom-sessions-history', PomSessionsHistory)