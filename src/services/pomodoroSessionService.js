import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'
const API_TIMEOUT_MS = 5000

export class PomodoroSessionService {
  constructor() {
    this.apiClient = axios.create({
      baseURL: API_URL,
      timeout: API_TIMEOUT_MS,
      headers: {
        'Content-Type': 'application/json'
      }
    })
  }

  async startSession() {
    try {
      const response = await this.apiClient.post('/pomodoro-sessions/start')
      return response.data
    } catch (error) {
      throw this._handleError(error, 'iniciar sesión')
    }
  }

  async stopSession() {
    try {
      const response = await this.apiClient.post('/pomodoro-sessions/stop')
      return response.data
    } catch (error) {
      throw this._handleError(error, 'detener sesión')
    }
  }

  async getSessions() {
    try {
      const response = await this.apiClient.get('/pomodoro-sessions')
      return response.data
    } catch (error) {
      throw this._handleError(error, 'obtener sesiones')
    }
  }

  _handleError(error, operation) {
    let errorMessage = `Error al ${operation}`

    if (error.code === 'ECONNABORTED') {
      errorMessage = 'Servidor no responde (timeout)'
    } else if (error.code === 'ECONNREFUSED' || error.code === 'ERR_NETWORK') {
      errorMessage = 'No se puede conectar al servidor'
    } else if (error.response) {
      // Respuesta HTTP recibida pero con código de error
      const status = error.response.status
      const data = error.response.data

      if (status === 400) {
        errorMessage = data?.message || 'Solicitud inválida'
      } else if (status === 404) {
        errorMessage = 'Recurso no encontrado'
      } else if (status === 500) {
        errorMessage = 'Error interno del servidor'
      } else {
        errorMessage = `Error HTTP ${status}: ${data?.message || 'desconocido'}`
      }
    } else if (error.message) {
      errorMessage = error.message
    }

    const customError = new Error(errorMessage)
    customError.originalError = error
    return customError
  }
}