// Mock data para tests de integración

const NOW = new Date().toISOString()
const PAST_DATE = new Date(Date.now() - 3600000).toISOString()
const PAST_DATE_2 = new Date(Date.now() - 7200000).toISOString()

export const MOCK_SESSION = {
  id: 'session-123',
  startTime: NOW,
  endTime: null,
  duration: 0,
  status: 'active'
}

export const MOCK_SESSION_COMPLETED = {
  id: 'session-456',
  startTime: PAST_DATE_2,
  endTime: PAST_DATE,
  duration: 1500,
  status: 'completed'
}

export const MOCK_SESSION_PAUSED = {
  id: 'session-789',
  startTime: PAST_DATE,
  endTime: null,
  duration: 300,
  status: 'paused'
}

export const MOCK_SESSIONS = [
  MOCK_SESSION_COMPLETED,
  MOCK_SESSION_PAUSED
]

export const MOCK_SESSIONS_WITH_ACTIVE = [
  MOCK_SESSION,
  MOCK_SESSION_COMPLETED,
  MOCK_SESSION_PAUSED
]

export const MOCK_SESSIONS_EMPTY = []

// Helper para crear sesiones con timestamps específicos
export function createMockSession(id, startOffset = 0, duration = null, status = 'completed') {
  const startTime = new Date(Date.now() - startOffset).toISOString()
  const endTime = duration ? new Date(Date.now() - startOffset + duration).toISOString() : null

  return {
    id,
    startTime,
    endTime,
    duration,
    status
  }
}
