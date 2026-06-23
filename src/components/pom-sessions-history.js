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
      margin-top: 30px;
    }

    .history-container {
      border: 1px solid #ccc;
      border-radius: 8px;
      padding: 20px;
      background-color: #f9f9f9;
    }

    h2 {
      margin: 0 0 15px 0;
      font-size: 18px;
      color: #333;
    }

    .controls {
      margin-bottom: 20px;
      display: flex;
      gap: 10px;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      background-color: white;
    }

    thead {
      background-color: #f0f0f0;
    }

    th {
      padding: 12px;
      text-align: left;
      border-bottom: 2px solid #ddd;
      font-weight: 600;
      color: #333;
    }

    td {
      padding: 12px;
      border-bottom: 1px solid #eee;
      color: #666;
    }

    tbody tr:hover {
      background-color: #f5f5f5;
    }

    .empty-state {
      text-align: center;
      padding: 40px 20px;
      color: #999;
    }

    .error-state {
      background-color: #fee;
      border: 1px solid #fcc;
      border-radius: 4px;
      padding: 15px;
      color: #c33;
      margin-bottom: 15px;
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
