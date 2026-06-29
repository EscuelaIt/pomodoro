import { LitElement, html, css } from 'lit'
import '@dile/ui/components/button/button.js'
import '@dile/ui/components/confirm/confirm.js'

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
const RESET_FEEDBACK_DURATION_MS = 3000

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

    .reset-feedback {
      margin-top: 15px;
      padding: 12px;
      border-radius: 4px;
      font-size: 13px;
      text-align: center;
    }

    .reset-success {
      background-color: #e8f5e9;
      border-left: 3px solid #4caf50;
      color: #2e7d32;
    }

    .reset-error {
      background-color: #fef3f3;
      border-left: 3px solid #C1272D;
      color: #C1272D;
    }
  `

  static properties = {
    pomodoroService: { type: Object },
    sessions: { type: Array },
    isLoading: { type: Boolean },
    error: { type: String },
    isResetting: { type: Boolean },
    resetSuccess: { type: Boolean },
    resetMessage: { type: String }
  }

  constructor() {
    super()
    this.sessions = []
    this.isLoading = false
    this.error = null
    this.pomodoroService = null
    this.isResetting = false
    this.resetSuccess = false
    this.resetMessage = ''
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
          <dile-button @click=${this._handleResetClick}>
            ${this.isResetting ? '⏳ Reseteando...' : '🗑️ Resetear Historial'}
          </dile-button>
        </div>

        ${this.resetSuccess
          ? html`<div class="reset-feedback reset-success">${this.resetMessage}</div>`
          : ''}

        ${!this.resetSuccess && this.resetMessage
          ? html`<div class="reset-feedback reset-error">${this.resetMessage}</div>`
          : ''}

        ${this.isLoading && this.sessions.length === 0
          ? html`<div class="loading-state">Cargando sesiones...</div>`
          : this.sessions.length === 0
            ? html`<div class="empty-state">No hay sesiones registradas aún</div>`
            : this._renderTable()}

        <dile-confirm
          id="resetConfirm"
          @dile-confirm-accepted=${this._handleResetConfirm}
          .title=${'Confirmar borrado'}
          .text=${'¿Está seguro de que desea eliminar TODO el historial de sesiones? Esta acción no se puede deshacer.'}
          .acceptText=${'Eliminar'}
          .cancelText=${'Cancelar'}
        ></dile-confirm>
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

  _handleResetClick() {
    const confirmDialog = this.renderRoot.querySelector('#resetConfirm')
    if (confirmDialog) {
      confirmDialog.show()
    }
  }

  async _handleResetConfirm() {
    if (!this.pomodoroService) return

    this.isResetting = true
    this.resetMessage = ''
    this.resetSuccess = false

    try {
      const result = await this.pomodoroService.resetSessions()
      this.resetSuccess = true
      this.resetMessage = `✓ Historial eliminado correctamente (${result.deletedCount} sesión${result.deletedCount !== 1 ? 'es' : ''} eliminada${result.deletedCount !== 1 ? 's' : ''})`
      
      // Recargar las sesiones después del reset
      await this._loadSessions()
      
      // Auto-ocultar el mensaje después de RESET_FEEDBACK_DURATION_MS
      setTimeout(() => {
        this.resetMessage = ''
      }, RESET_FEEDBACK_DURATION_MS)
    } catch (err) {
      this.resetSuccess = false
      this.resetMessage = `✗ ${err.message}`
      
      // Auto-ocultar el mensaje de error después de RESET_FEEDBACK_DURATION_MS
      setTimeout(() => {
        this.resetMessage = ''
      }, RESET_FEEDBACK_DURATION_MS)
    } finally {
      this.isResetting = false
    }
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