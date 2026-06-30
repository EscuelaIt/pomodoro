import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { MOCK_SESSIONS, MOCK_SESSION } from './mock-data.js'

// Base URL para las peticiones
const API_BASE = 'http://localhost:3000'

// Definición de handlers para MSW
const handlers = [
  // POST /pomodoro-sessions/start
  http.post(`${API_BASE}/pomodoro-sessions/start`, () => {
    return HttpResponse.json(MOCK_SESSION, { status: 200 })
  }),

  // POST /pomodoro-sessions/stop
  http.post(`${API_BASE}/pomodoro-sessions/stop`, () => {
    return HttpResponse.json({ success: true }, { status: 200 })
  }),

  // GET /pomodoro-sessions
  http.get(`${API_BASE}/pomodoro-sessions`, () => {
    return HttpResponse.json(MOCK_SESSIONS, { status: 200 })
  }),

  // DELETE /pomodoro-sessions/reset
  http.delete(`${API_BASE}/pomodoro-sessions/reset`, () => {
    return HttpResponse.json({ success: true, message: 'Sessions reset' }, { status: 200 })
  })
]

// Crear servidor MSW
export function setupMsw() {
  const server = setupServer(...handlers)
  return server
}
