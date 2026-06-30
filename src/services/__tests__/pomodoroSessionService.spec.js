import { describe, it, expect, beforeAll, afterEach, afterAll, vi } from 'vitest'
import { setupServer } from 'msw/node'
import { http, HttpResponse } from 'msw'
import { PomodoroSessionService } from '../pomodoroSessionService.js'

const API_URL = 'http://localhost:3000'

const mockSessionData = {
  id: '123',
  startTime: '2024-01-15T10:00:00Z',
  endTime: '2024-01-15T10:25:00Z',
  duration: 1500
}

const mockSessionsList = [
  { id: '1', startTime: '2024-01-15T10:00:00Z', duration: 1500 },
  { id: '2', startTime: '2024-01-15T10:30:00Z', duration: 1500 }
]

const server = setupServer(
  http.post(`${API_URL}/pomodoro-sessions/start`, () => {
    return HttpResponse.json(mockSessionData)
  }),

  http.post(`${API_URL}/pomodoro-sessions/stop`, () => {
    return HttpResponse.json({ ...mockSessionData, endTime: new Date().toISOString() })
  }),

  http.get(`${API_URL}/pomodoro-sessions`, () => {
    return HttpResponse.json(mockSessionsList)
  }),

  http.delete(`${API_URL}/pomodoro-sessions/reset`, () => {
    return HttpResponse.json({ success: true, message: 'Sessions reset successfully' })
  })
)

beforeAll(() => {
  server.listen({ onUnhandledRequest: 'error' })
})

afterEach(() => {
  server.resetHandlers()
  vi.clearAllMocks()
})

afterAll(() => {
  server.close()
})

describe('PomodoroSessionService', () => {
  let service

  beforeEach(() => {
    service = new PomodoroSessionService()
  })

  describe('startSession()', () => {
    it('should start a session with correct response', async () => {
      const result = await service.startSession()

      expect(result).toEqual(mockSessionData)
      expect(result.id).toBe('123')
      expect(result.duration).toBe(1500)
    })

    it('should handle startSession timeout error', async () => {
      server.use(
        http.post(`${API_URL}/pomodoro-sessions/start`, () => {
          return HttpResponse.error()
        })
      )

      try {
        await service.startSession()
        expect.fail('Should have thrown an error')
      } catch (error) {
        expect(error.message).toBeDefined()
        expect(error.message.length).toBeGreaterThan(0)
        expect(error.originalError).toBeDefined()
      }
    })
  })

  describe('stopSession()', () => {
    it('should stop a session with correct response', async () => {
      const result = await service.stopSession()

      expect(result).toBeDefined()
      expect(result.id).toBe('123')
      expect(result.duration).toBe(1500)
    })

    it('should handle stopSession error', async () => {
      server.use(
        http.post(`${API_URL}/pomodoro-sessions/stop`, () => {
          return HttpResponse.error()
        })
      )

      try {
        await service.stopSession()
        expect.fail('Should have thrown an error')
      } catch (error) {
        expect(error.message).toBeDefined()
        expect(error.message.length).toBeGreaterThan(0)
      }
    })
  })

  describe('getSessions()', () => {
    it('should return an array of sessions', async () => {
      const result = await service.getSessions()

      expect(Array.isArray(result)).toBe(true)
      expect(result).toEqual(mockSessionsList)
      expect(result.length).toBe(2)
      expect(result[0].duration).toBe(1500)
    })

    it('should handle empty sessions list', async () => {
      server.use(
        http.get(`${API_URL}/pomodoro-sessions`, () => {
          return HttpResponse.json([])
        })
      )

      const result = await service.getSessions()
      expect(Array.isArray(result)).toBe(true)
      expect(result.length).toBe(0)
    })

    it('should handle getSessions 404 error', async () => {
      server.use(
        http.get(`${API_URL}/pomodoro-sessions`, () => {
          return HttpResponse.json({ message: 'Not found' }, { status: 404 })
        })
      )

      try {
        await service.getSessions()
        expect.fail('Should have thrown an error')
      } catch (error) {
        expect(error.message).toContain('Recurso no encontrado')
      }
    })
  })

  describe('resetSessions()', () => {
    it('should reset sessions successfully', async () => {
      const result = await service.resetSessions()

      expect(result).toBeDefined()
      expect(result.success).toBe(true)
      expect(result.message).toBe('Sessions reset successfully')
    })

    it('should handle resetSessions 500 error', async () => {
      server.use(
        http.delete(`${API_URL}/pomodoro-sessions/reset`, () => {
          return HttpResponse.json(
            { message: 'Internal server error' },
            { status: 500 }
          )
        })
      )

      try {
        await service.resetSessions()
        expect.fail('Should have thrown an error')
      } catch (error) {
        expect(error.message).toContain('Error interno del servidor')
      }
    })
  })

  describe('Error Handling', () => {
    it('should handle 400 error with custom message', async () => {
      server.use(
        http.post(`${API_URL}/pomodoro-sessions/start`, () => {
          return HttpResponse.json(
            { message: 'Invalid session duration' },
            { status: 400 }
          )
        })
      )

      try {
        await service.startSession()
        expect.fail('Should have thrown an error')
      } catch (error) {
        expect(error.message).toContain('Invalid session duration')
      }
    })

    it('should preserve original error in customError.originalError', async () => {
      server.use(
        http.get(`${API_URL}/pomodoro-sessions`, () => {
          return HttpResponse.json({ message: 'Server error' }, { status: 500 })
        })
      )

      try {
        await service.getSessions()
        expect.fail('Should have thrown an error')
      } catch (error) {
        expect(error.originalError).toBeDefined()
        expect(error.message).toContain('Error interno del servidor')
      }
    })

    it('should handle network errors gracefully', async () => {
      server.use(
        http.post(`${API_URL}/pomodoro-sessions/start`, () => {
          return HttpResponse.error()
        })
      )

      try {
        await service.startSession()
        expect.fail('Should have thrown an error')
      } catch (error) {
        expect(error.message).toBeDefined()
        expect(error.originalError).toBeDefined()
      }
    })
  })
})
