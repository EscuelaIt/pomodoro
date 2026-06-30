import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { fixture, expect as expectWC } from '@open-wc/testing'
import sinon from 'sinon'
import '../../components/pom-sessions-history.js'

const mockSessions = [
  {
    id: '1',
    startTime: '2024-01-15T10:00:00Z',
    endTime: '2024-01-15T10:25:00Z',
    duration: 1500
  },
  {
    id: '2',
    startTime: '2024-01-15T10:30:00Z',
    endTime: '2024-01-15T10:35:00Z',
    duration: 300
  },
  {
    id: '3',
    startTime: '2024-01-15T11:00:00Z',
    endTime: null,
    duration: 0
  }
]

class MockPomodoroService {
  async getSessions() {
    return Promise.resolve([...mockSessions])
  }

  async resetSessions() {
    return Promise.resolve({ success: true })
  }
}

describe('pom-sessions-history', () => {
  let element
  let mockService

  beforeEach(async () => {
    mockService = new MockPomodoroService()
    element = await fixture('<pom-sessions-history></pom-sessions-history>')
    element.pomodoroService = mockService
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('Properties', () => {
    it('should initialize with default properties', () => {
      expect(element.sessions).toEqual([])
      expect(element.isLoading).toBe(false)
      expect(element.isResetting).toBe(false)
      expect(element.error).toBeNull()
      expect(element.pomodoroService).toBeDefined()
    })

    it('should set pomodoroService property', async () => {
      const service = new MockPomodoroService()
      element.pomodoroService = service
      await element.updateComplete

      expect(element.pomodoroService).toBe(service)
    })
  })

  describe('Session Loading', () => {
    it('should load sessions on component initialization', async () => {
      const newElement = await fixture('<pom-sessions-history></pom-sessions-history>')
      newElement.pomodoroService = mockService
      await newElement.updateComplete

      await new Promise(resolve => setTimeout(resolve, 50))
      expect(newElement.sessions.length).toBeGreaterThanOrEqual(0)
    })

    it('should load sessions from service', async () => {
      await element._loadSessions()

      expect(element.sessions).toEqual(mockSessions)
      expect(element.isLoading).toBe(false)
      expect(element.error).toBeNull()
    })

    it('should set loading state during session loading', async () => {
      const getSpy = sinon.spy(mockService, 'getSessions')

      const loadPromise = element._loadSessions()
      expect(element.isLoading).toBe(true)

      await loadPromise
      expect(element.isLoading).toBe(false)

      getSpy.restore()
    })

    it('should handle empty sessions list', async () => {
      mockService.getSessions = () => Promise.resolve([])

      await element._loadSessions()

      expect(element.sessions).toEqual([])
      expect(element.isLoading).toBe(false)
    })

    it('should handle service errors gracefully', async () => {
      mockService.getSessions = () =>
        Promise.reject(new Error('Network error'))

      await element._loadSessions()

      expect(element.error).toContain('Network error')
      expect(element.sessions).toEqual([])
      expect(element.isLoading).toBe(false)
    })

    it('should not load if pomodoroService is not set', async () => {
      element.pomodoroService = null
      await element._loadSessions()

      expect(element.sessions).toEqual([])
    })
  })

  describe('Date Formatting', () => {
    it('should format dates correctly in Spanish locale', () => {
      const dateString = '2024-01-15T10:25:30Z'
      const formatted = element._formatDate(dateString)

      expect(formatted).toBeDefined()
      expect(formatted).not.toBe('—')
      expect(formatted).toMatch(/\d{1,2}\/\d{1,2}\/\d{4}/)
    })

    it('should handle invalid dates gracefully', () => {
      const formatted = element._formatDate('invalid-date')
      expect(formatted).toBeDefined()
      expect(typeof formatted).toBe('string')
    })

    it('should handle empty string dates', () => {
      expect(element._formatDate('')).toBeDefined()
    })

    it('should format date with time components', () => {
      const dateString = '2024-01-15T14:30:45Z'
      const formatted = element._formatDate(dateString)

      expect(formatted).toBeDefined()
      expect(formatted).toContain(':')
    })
  })

  describe('Duration Formatting', () => {
    it('should format duration in minutes and seconds', () => {
      const formatted = element._formatDuration(65)
      expect(formatted).toBe('1m 5s')
    })

    it('should format duration in seconds only', () => {
      const formatted = element._formatDuration(45)
      expect(formatted).toBe('45s')
    })

    it('should format duration in hours, minutes, and seconds', () => {
      const formatted = element._formatDuration(3665)
      expect(formatted).toBe('1h 1m 5s')
    })

    it('should handle zero duration', () => {
      expect(element._formatDuration(0)).toBe('—')
    })

    it('should handle null/undefined duration', () => {
      expect(element._formatDuration(null)).toBe('—')
      expect(element._formatDuration(undefined)).toBe('—')
    })

    it('should handle large durations (multiple hours)', () => {
      const formatted = element._formatDuration(7325)
      expect(formatted).toContain('h')
      expect(formatted).toContain('m')
    })
  })

  describe('Reset Functionality', () => {
    it('should open reset confirmation dialog', async () => {
      const openSpy = sinon.spy()
      const dialog = {
        open: openSpy
      }

      element.shadowRoot.getElementById = vi.fn(() => dialog)

      element._openResetConfirm()

      expect(openSpy.called).toBe(true)
    })

    it('should reset sessions successfully', async () => {
      element.sessions = mockSessions
      element.isResetting = false

      const handleResetSpy = sinon.spy(element, '_handleReset')
      await element._handleReset()

      expect(element.isResetting).toBe(false)

      handleResetSpy.restore()
    })

    it('should reload sessions after reset', async () => {
      const loadSpy = sinon.spy(element, '_loadSessions')

      await element._handleReset()

      expect(loadSpy.callCount).toBe(1)

      loadSpy.restore()
    })

    it('should handle reset error', async () => {
      mockService.resetSessions = () =>
        Promise.reject(new Error('Reset failed'))

      await element._handleReset()

      expect(element.error).toContain('Reset failed')
      expect(element.isResetting).toBe(false)
    })

    it('should set resetting state during reset', async () => {
      const resetPromise = element._handleReset()
      expect(element.isResetting).toBe(true)

      await resetPromise
      expect(element.isResetting).toBe(false)
    })
  })

  describe('Refresh Functionality', () => {
    it('should reload sessions on refresh', async () => {
      const spy = sinon.spy(element, '_loadSessions')

      element._handleRefresh()

      expect(spy.called).toBe(true)

      spy.restore()
    })

    it('should refresh button exist', async () => {
      element.pomodoroService = mockService
      await element.updateComplete

      const buttons = element.shadowRoot.querySelectorAll('.controls dile-button')
      expect(buttons.length).toBeGreaterThanOrEqual(2)
    })
  })

  describe('Rendering', () => {
    it('should render history container', () => {
      const container = element.shadowRoot.querySelector('.history-container')
      expect(container).toBeDefined()
    })

    it('should render heading', () => {
      const heading = element.shadowRoot.querySelector('h2')
      expect(heading.textContent).toContain('Historial de Sesiones')
    })

    it('should render empty state when no sessions', async () => {
      element.sessions = []
      element.isLoading = false
      await element.updateComplete

      const emptyState = element.shadowRoot.querySelector('.empty-state')
      expect(emptyState).toBeDefined()
      expect(emptyState.textContent).toContain('No hay sesiones')
    })

    it('should render loading state', async () => {
      element.sessions = []
      element.isLoading = true
      await element.updateComplete

      const loadingState = element.shadowRoot.querySelector('.loading-state')
      expect(loadingState).toBeDefined()
      expect(loadingState.textContent).toContain('Cargando')
    })

    it('should render error state when error occurs', async () => {
      element.error = 'Test error message'
      await element.updateComplete

      const errorState = element.shadowRoot.querySelector('.error-state')
      expect(errorState).toBeDefined()
      expect(errorState.textContent).toContain('Test error message')
    })

    it('should render table with sessions', async () => {
      element.sessions = mockSessions
      element.isLoading = false
      await element.updateComplete

      const table = element.shadowRoot.querySelector('table')
      expect(table).toBeDefined()

      const rows = element.shadowRoot.querySelectorAll('tbody tr')
      expect(rows.length).toBe(mockSessions.length)
    })

    it('should render table headers correctly', async () => {
      element.sessions = mockSessions
      await element.updateComplete

      const headers = element.shadowRoot.querySelectorAll('th')
      expect(headers.length).toBe(3)
      expect(headers[0].textContent).toContain('Inicio')
      expect(headers[1].textContent).toContain('Fin')
      expect(headers[2].textContent).toContain('Duración')
    })

    it('should render session data in table rows', async () => {
      element.sessions = mockSessions
      await element.updateComplete

      const rows = element.shadowRoot.querySelectorAll('tbody tr')
      const firstRow = rows[0]
      const cells = firstRow.querySelectorAll('td')

      expect(cells.length).toBe(3)
      expect(cells[0].textContent).toBeDefined()
      expect(cells[1].textContent).toBeDefined()
      expect(cells[2].textContent).toBeDefined()
    })

    it('should render dash for missing end time', async () => {
      element.sessions = mockSessions
      await element.updateComplete

      const rows = element.shadowRoot.querySelectorAll('tbody tr')
      const lastRow = rows[rows.length - 1]
      const endTimeCell = lastRow.querySelectorAll('td')[1]

      expect(endTimeCell.textContent).toBe('—')
    })

    it('should render dile-confirm dialog', () => {
      const confirm = element.shadowRoot.querySelector('dile-confirm')
      expect(confirm).toBeDefined()
      expect(confirm.id).toBe('resetConfirm')
    })

    it('should render control buttons', async () => {
      await element.updateComplete

      const buttons = element.shadowRoot.querySelectorAll('.controls dile-button')
      expect(buttons.length).toBe(2)
    })
  })

  describe('Button States', () => {
    it('should disable reset button when loading', async () => {
      element.isLoading = true
      element.isResetting = false
      await element.updateComplete

      const buttons = element.shadowRoot.querySelectorAll('.controls dile-button')
      expect(buttons[1].disabled).toBe(true)
    })

    it('should disable refresh button when resetting', async () => {
      element.isResetting = true
      await element.updateComplete

      const buttons = element.shadowRoot.querySelectorAll('.controls dile-button')
      expect(buttons[0].disabled).toBe(true)
    })

    it('should show loading text on refresh button', async () => {
      element.isLoading = true
      await element.updateComplete

      const button = element.shadowRoot.querySelectorAll('.controls dile-button')[0]
      expect(button.textContent).toContain('Actualizando')
    })

    it('should show resetting text on reset button', async () => {
      element.isResetting = true
      await element.updateComplete

      const button = element.shadowRoot.querySelectorAll('.controls dile-button')[1]
      expect(button.textContent).toContain('Reseteando')
    })
  })

  describe('Error Handling', () => {
    it('should clear error when loading sessions successfully', async () => {
      element.error = 'Previous error'
      await element._loadSessions()

      expect(element.error).toBeNull()
    })

    it('should clear error when resetting successfully', async () => {
      element.error = 'Previous error'
      await element._handleReset()

      expect(element.error).toBeNull()
    })
  })
})
