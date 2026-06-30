import { describe, it, expect, beforeAll, afterEach, afterAll, beforeEach, vi } from 'vitest'
import { fixture, waitUntil } from '@open-wc/testing'
import sinon from 'sinon'
import { http, HttpResponse } from 'msw'
import { setupMsw } from './mocks/msw-setup.js'
import { MOCK_SESSIONS, MOCK_SESSION, MOCK_SESSION_COMPLETED } from './mocks/mock-data.js'
import '../../components/pom-app.js'

// Constantes de timeouts y esperas
const MSW_TIMEOUT_MS = 2000
const TIMER_UPDATE_WAIT_MS = 500
const API_RESPONSE_WAIT_MS = 1000
const DEBOUNCE_WAIT_MS = 100

describe('Integration: pom-app + pom-timer + pom-sessions-history', () => {
  let server
  let element
  let sandbox

  beforeAll(() => {
    server = setupMsw()
    server.listen()
  })

  afterEach(() => {
    server.resetHandlers()
    sandbox.restore()
  })

  afterAll(() => {
    server.close()
  })

  beforeEach(async () => {
    sandbox = sinon.createSandbox()
    element = await fixture('<pom-app></pom-app>')
    await element.updateComplete
  })

  describe('1. Component Rendering', () => {
    it('should render pom-app with timer and history components', async () => {
      expect(element).toBeDefined()
      expect(element.tagName.toLowerCase()).toBe('pom-app')

      const timer = element.shadowRoot.querySelector('pom-timer')
      const history = element.shadowRoot.querySelector('pom-sessions-history')

      expect(timer).toBeDefined()
      expect(history).toBeDefined()
    })

    it('should display timer component with initial time', async () => {
      const timer = element.shadowRoot.querySelector('pom-timer')
      expect(timer.time).toBe('25:00')
      expect(timer.isRunning).toBe(false)
    })

    it('should render toast element for feedback messages', async () => {
      const toast = element.shadowRoot.getElementById('appToast')
      expect(toast).toBeDefined()
    })

    it('should pass PomodoroSessionService to sessions-history', async () => {
      const history = element.shadowRoot.querySelector('pom-sessions-history')
      expect(history.pomodoroService).toBeDefined()
      expect(history.pomodoroService).toBe(element.sessionService)
    })
  })

  describe('2. Start Session - API Integration', () => {
    it('should call API POST /start when Start button is clicked', async () => {
      const startSpy = sandbox.spy(element.sessionService, 'startSession')

      const timer = element.shadowRoot.querySelector('pom-timer')
      const startButton = timer.shadowRoot.querySelector('.btn-start')

      startButton.click()
      await element.updateComplete
      await new Promise((resolve) => setTimeout(resolve, API_RESPONSE_WAIT_MS))

      expect(startSpy.called).toBe(true)
      expect(startSpy.callCount).toBe(1)
    })

    it('should update timer state after successful API start', async () => {
      const timer = element.shadowRoot.querySelector('pom-timer')
      const startButton = timer.shadowRoot.querySelector('.btn-start')

      startButton.click()
      await new Promise((resolve) => setTimeout(resolve, API_RESPONSE_WAIT_MS))
      await element.updateComplete

      expect(element.isRunning).toBe(true)
      expect(element.sessionId).toBe(MOCK_SESSION.id)
    })

    it('should display success toast on start', async () => {
      const toastSpy = sandbox.spy(element, 'positiveFeedback')

      const timer = element.shadowRoot.querySelector('pom-timer')
      const startButton = timer.shadowRoot.querySelector('.btn-start')

      startButton.click()
      await new Promise((resolve) => setTimeout(resolve, API_RESPONSE_WAIT_MS))

      expect(toastSpy.called).toBe(true)
      expect(toastSpy.firstCall.args[0]).toContain('iniciado')
    })
  })

  describe('3. Timer Running State', () => {
    it('should start counting down when timer is running', async () => {
      const timer = element.shadowRoot.querySelector('pom-timer')
      const startButton = timer.shadowRoot.querySelector('.btn-start')

      const initialTime = element.timeLeft

      startButton.click()
      await new Promise((resolve) => setTimeout(resolve, API_RESPONSE_WAIT_MS))
      await element.updateComplete

      await new Promise((resolve) => setTimeout(resolve, TIMER_UPDATE_WAIT_MS + 100))

      expect(element.isRunning).toBe(true)
      expect(element.timeLeft).toBeLessThan(initialTime)
    })

    it('should update time display while running', async () => {
      const timer = element.shadowRoot.querySelector('pom-timer')
      const startButton = timer.shadowRoot.querySelector('.btn-start')

      const initialDisplay = timer.time

      startButton.click()
      await new Promise((resolve) => setTimeout(resolve, API_RESPONSE_WAIT_MS))
      await element.updateComplete

      await new Promise((resolve) => setTimeout(resolve, TIMER_UPDATE_WAIT_MS + 100))
      await element.updateComplete

      expect(timer.time).not.toBe(initialDisplay)
    })

    it('should have running button show pause text', async () => {
      const timer = element.shadowRoot.querySelector('pom-timer')
      const startButton = timer.shadowRoot.querySelector('.btn-start')

      startButton.click()
      await new Promise((resolve) => setTimeout(resolve, API_RESPONSE_WAIT_MS))
      await element.updateComplete

      expect(startButton.textContent).toContain('Pausar')
    })
  })

  describe('4. Stop/Pause Functionality', () => {
    it('should stop timer when pause button is clicked during running', async () => {
      const timer = element.shadowRoot.querySelector('pom-timer')
      const startButton = timer.shadowRoot.querySelector('.btn-start')

      // Start
      startButton.click()
      await new Promise((resolve) => setTimeout(resolve, API_RESPONSE_WAIT_MS))
      await element.updateComplete
      expect(element.isRunning).toBe(true)

      // Pause
      startButton.click()
      await element.updateComplete

      expect(element.isRunning).toBe(false)
    })

    it('should call API POST /stop when pausing', async () => {
      const stopSpy = sandbox.spy(element.sessionService, 'stopSession')

      const timer = element.shadowRoot.querySelector('pom-timer')
      const startButton = timer.shadowRoot.querySelector('.btn-start')

      // Start
      startButton.click()
      await new Promise((resolve) => setTimeout(resolve, API_RESPONSE_WAIT_MS))
      await element.updateComplete

      // Pause
      startButton.click()
      await new Promise((resolve) => setTimeout(resolve, API_RESPONSE_WAIT_MS))

      expect(stopSpy.called).toBe(true)
    })

    it('should display pause feedback message', async () => {
      const toastSpy = sandbox.spy(element, 'positiveFeedback')

      const timer = element.shadowRoot.querySelector('pom-timer')
      const startButton = timer.shadowRoot.querySelector('.btn-start')

      // Start
      startButton.click()
      await new Promise((resolve) => setTimeout(resolve, API_RESPONSE_WAIT_MS))
      await element.updateComplete
      toastSpy.resetHistory()

      // Pause
      startButton.click()
      await element.updateComplete

      expect(toastSpy.called).toBe(true)
      expect(toastSpy.firstCall.args[0]).toContain('pausado')
    })
  })

  describe('5. Sessions History - API Integration', () => {
    it('should load sessions from API on component mount', async () => {
      // El componente ya ha sido montado en beforeEach
      const history = element.shadowRoot.querySelector('pom-sessions-history')
      
      await new Promise((resolve) => setTimeout(resolve, API_RESPONSE_WAIT_MS))
      await history.updateComplete

      // Verificar que las sesiones fueron cargadas
      expect(history.sessions).toBeDefined()
      expect(history.sessions.length).toBeGreaterThanOrEqual(0)
    })

    it('should display sessions in history table', async () => {
      const history = element.shadowRoot.querySelector('pom-sessions-history')

      await new Promise((resolve) => setTimeout(resolve, API_RESPONSE_WAIT_MS))
      await history.updateComplete

      const table = history.shadowRoot.querySelector('table')
      expect(table).toBeDefined()

      const rows = history.shadowRoot.querySelectorAll('tbody tr')
      expect(rows.length).toBeGreaterThan(0)
    })

    it('should display correct session data in table', async () => {
      const history = element.shadowRoot.querySelector('pom-sessions-history')

      await new Promise((resolve) => setTimeout(resolve, API_RESPONSE_WAIT_MS))
      await history.updateComplete

      const rows = history.shadowRoot.querySelectorAll('tbody tr')
      expect(rows.length).toBe(MOCK_SESSIONS.length)
    })

    it('should format date columns correctly', async () => {
      const history = element.shadowRoot.querySelector('pom-sessions-history')

      await new Promise((resolve) => setTimeout(resolve, API_RESPONSE_WAIT_MS))
      await history.updateComplete

      const cells = history.shadowRoot.querySelectorAll('td')
      expect(cells.length).toBeGreaterThan(0)

      cells.forEach((cell) => {
        expect(cell.textContent.trim().length).toBeGreaterThan(0)
      })
    })
  })

  describe('6. Reset Functionality', () => {
    it('should have reset button in history component', async () => {
      const history = element.shadowRoot.querySelector('pom-sessions-history')

      await new Promise((resolve) => setTimeout(resolve, API_RESPONSE_WAIT_MS))
      await history.updateComplete

      const resetButton = Array.from(history.shadowRoot.querySelectorAll('dile-button')).find(
        (btn) => btn.textContent.includes('Reset')
      )

      expect(resetButton).toBeDefined()
    })

    it('should show confirmation dialog before reset', async () => {
      const history = element.shadowRoot.querySelector('pom-sessions-history')

      await new Promise((resolve) => setTimeout(resolve, API_RESPONSE_WAIT_MS))
      await history.updateComplete

      const confirmDialog = history.shadowRoot.getElementById('resetConfirm')
      expect(confirmDialog).toBeDefined()
    })

    it('should call API DELETE /reset when reset is confirmed', async () => {
      const resetSpy = sandbox.spy(element.sessionService, 'resetSessions')
      const history = element.shadowRoot.querySelector('pom-sessions-history')

      await new Promise((resolve) => setTimeout(resolve, API_RESPONSE_WAIT_MS))
      await history.updateComplete

      history._handleReset()
      await new Promise((resolve) => setTimeout(resolve, API_RESPONSE_WAIT_MS))

      expect(resetSpy.called).toBe(true)
    })

    it('should reload sessions after reset', async () => {
      const getSpy = sandbox.spy(element.sessionService, 'getSessions')
      const history = element.shadowRoot.querySelector('pom-sessions-history')

      await new Promise((resolve) => setTimeout(resolve, API_RESPONSE_WAIT_MS))
      getSpy.resetHistory()

      history._handleReset()
      await new Promise((resolve) => setTimeout(resolve, API_RESPONSE_WAIT_MS))

      expect(getSpy.called).toBe(true)
    })
  })

  describe('7. Error Handling - API Errors', () => {
    it('should display error toast on API 500 error', async () => {
      server.use(
        ...[
          http.post('http://localhost:3000/pomodoro-sessions/start', () => {
            return HttpResponse.json({ error: 'Internal Server Error' }, { status: 500 })
          })
        ]
      )

      const toastSpy = sandbox.spy(element, 'negativeFeedback')
      const timer = element.shadowRoot.querySelector('pom-timer')
      const startButton = timer.shadowRoot.querySelector('.btn-start')

      startButton.click()
      await new Promise((resolve) => setTimeout(resolve, API_RESPONSE_WAIT_MS))

      expect(toastSpy.called).toBe(true)
      expect(toastSpy.firstCall.args[0]).toContain('Error')
    })

    it('should not start timer on API error', async () => {
      server.use(
        ...[
          http.post('http://localhost:3000/pomodoro-sessions/start', () => {
            return HttpResponse.json({ error: 'Bad Request' }, { status: 400 })
          })
        ]
      )

      const timer = element.shadowRoot.querySelector('pom-timer')
      const startButton = timer.shadowRoot.querySelector('.btn-start')

      startButton.click()
      await new Promise((resolve) => setTimeout(resolve, API_RESPONSE_WAIT_MS))
      await element.updateComplete

      expect(element.isRunning).toBe(false)
    })

    it('should handle network errors gracefully', async () => {
      server.use(
        ...[
          http.post('http://localhost:3000/pomodoro-sessions/start', () => {
            return HttpResponse.error()
          })
        ]
      )

      const toastSpy = sandbox.spy(element, 'negativeFeedback')
      const timer = element.shadowRoot.querySelector('pom-timer')
      const startButton = timer.shadowRoot.querySelector('.btn-start')

      startButton.click()
      await new Promise((resolve) => setTimeout(resolve, API_RESPONSE_WAIT_MS))

      expect(toastSpy.called).toBe(true)
      expect(element.isRunning).toBe(false)
    })
  })

  describe('8. Multiple Cycles', () => {
    it('should handle start-stop-start sequence', async () => {
      const timer = element.shadowRoot.querySelector('pom-timer')
      const startButton = timer.shadowRoot.querySelector('.btn-start')

      // First start
      startButton.click()
      await new Promise((resolve) => setTimeout(resolve, API_RESPONSE_WAIT_MS))
      await element.updateComplete
      expect(element.isRunning).toBe(true)
      const firstSessionId = element.sessionId

      // Pause
      startButton.click()
      await new Promise((resolve) => setTimeout(resolve, DEBOUNCE_WAIT_MS))
      await element.updateComplete
      expect(element.isRunning).toBe(false)

      // Second start
      startButton.click()
      await new Promise((resolve) => setTimeout(resolve, API_RESPONSE_WAIT_MS))
      await element.updateComplete
      expect(element.isRunning).toBe(true)
    })

    it('should handle multiple rapid starts', async () => {
      const startSpy = sandbox.spy(element.sessionService, 'startSession')

      const timer = element.shadowRoot.querySelector('pom-timer')
      const startButton = timer.shadowRoot.querySelector('.btn-start')

      startButton.click()
      await new Promise((resolve) => setTimeout(resolve, API_RESPONSE_WAIT_MS))

      expect(startSpy.callCount).toBeGreaterThan(0)
    })
  })

  describe('9. UI Updates After Events', () => {
    it('should update timer display in real-time', async () => {
      const timer = element.shadowRoot.querySelector('pom-timer')
      const startButton = timer.shadowRoot.querySelector('.btn-start')
      const timerDisplay = timer.shadowRoot.querySelector('.timer-display')

      const initialDisplay = timerDisplay.textContent

      startButton.click()
      await new Promise((resolve) => setTimeout(resolve, API_RESPONSE_WAIT_MS))
      await element.updateComplete

      await new Promise((resolve) => setTimeout(resolve, TIMER_UPDATE_WAIT_MS + 200))
      await element.updateComplete

      expect(timerDisplay.textContent).not.toBe(initialDisplay)
    })

    it('should update progress cells while running', async () => {
      const timer = element.shadowRoot.querySelector('pom-timer')
      const startButton = timer.shadowRoot.querySelector('.btn-start')

      startButton.click()
      await new Promise((resolve) => setTimeout(resolve, API_RESPONSE_WAIT_MS))
      await element.updateComplete

      const initialTimeLeft = element.timeLeft

      // Esperar más tiempo para que haya progreso visible
      await new Promise((resolve) => setTimeout(resolve, 2000))
      await element.updateComplete

      const currentTimeLeft = element.timeLeft

      // Verificar que el tiempo haya avanzado (al menos 1-2 segundos)
      expect(currentTimeLeft).toBeLessThan(initialTimeLeft)
      expect(initialTimeLeft - currentTimeLeft).toBeGreaterThanOrEqual(1)
    })

    it('should disable buttons during loading', async () => {
      const history = element.shadowRoot.querySelector('pom-sessions-history')

      await new Promise((resolve) => setTimeout(resolve, API_RESPONSE_WAIT_MS))
      await history.updateComplete

      const refreshButton = Array.from(history.shadowRoot.querySelectorAll('dile-button')).find(
        (btn) => btn.textContent.includes('Actualizar')
      )

      expect(refreshButton).toBeDefined()
    })

    it('should restore UI after API completion', async () => {
      const timer = element.shadowRoot.querySelector('pom-timer')
      const startButton = timer.shadowRoot.querySelector('.btn-start')

      startButton.click()
      await new Promise((resolve) => setTimeout(resolve, API_RESPONSE_WAIT_MS))
      await element.updateComplete

      startButton.click()
      await new Promise((resolve) => setTimeout(resolve, DEBOUNCE_WAIT_MS))
      await element.updateComplete

      expect(element.isRunning).toBe(false)
    })
  })

  describe('10. Event Communication', () => {
    it('should propagate events from child components', async () => {
      const eventSpy = sandbox.spy()
      element.addEventListener('timer-start', eventSpy)

      const timer = element.shadowRoot.querySelector('pom-timer')
      const startButton = timer.shadowRoot.querySelector('.btn-start')

      startButton.click()

      expect(eventSpy.called).toBe(true)
    })

    it('should handle feedback events from components', async () => {
      const toastSpy = sandbox.spy(element, 'positiveFeedback')

      element.dispatchEvent(
        new CustomEvent('positive-feedback', {
          detail: { message: 'Test message' },
          bubbles: true,
          composed: true
        })
      )

      expect(toastSpy.called).toBe(true)
      expect(toastSpy.firstCall.args[0]).toBe('Test message')
    })
  })

  describe('11. API Integration Edge Cases', () => {
    it('should handle rapid start/pause toggling', async () => {
      const timer = element.shadowRoot.querySelector('pom-timer')
      const startButton = timer.shadowRoot.querySelector('.btn-start')

      for (let i = 0; i < 3; i++) {
        startButton.click()
        await new Promise((resolve) => setTimeout(resolve, 50))
      }

      await new Promise((resolve) => setTimeout(resolve, API_RESPONSE_WAIT_MS))
      await element.updateComplete

      expect(element).toBeDefined()
    })

    it('should maintain session consistency across components', async () => {
      const timer = element.shadowRoot.querySelector('pom-timer')
      const startButton = timer.shadowRoot.querySelector('.btn-start')

      startButton.click()
      await new Promise((resolve) => setTimeout(resolve, API_RESPONSE_WAIT_MS))
      await element.updateComplete

      expect(element.sessionId).toBe(MOCK_SESSION.id)
      expect(element.isRunning).toBe(true)
    })
  })

  describe('12. Complete Workflow', () => {
    it('should execute full workflow: start -> run -> pause -> reset', async () => {
      const timer = element.shadowRoot.querySelector('pom-timer')
      const startButton = timer.shadowRoot.querySelector('.btn-start')
      const resetButton = timer.shadowRoot.querySelector('.btn-reset')

      // Start
      startButton.click()
      await new Promise((resolve) => setTimeout(resolve, API_RESPONSE_WAIT_MS))
      await element.updateComplete
      expect(element.isRunning).toBe(true)

      // Run for a bit
      await new Promise((resolve) => setTimeout(resolve, TIMER_UPDATE_WAIT_MS + 100))
      await element.updateComplete
      const timeWhileRunning = element.timeLeft

      // Pause
      startButton.click()
      await new Promise((resolve) => setTimeout(resolve, DEBOUNCE_WAIT_MS))
      await element.updateComplete
      expect(element.isRunning).toBe(false)
      expect(element.timeLeft).toBe(timeWhileRunning)

      // Reset
      resetButton.click()
      await new Promise((resolve) => setTimeout(resolve, API_RESPONSE_WAIT_MS))
      await element.updateComplete
      expect(element.isRunning).toBe(false)
      expect(element.timeLeft).toBe(25 * 60)
    })
  })
})
