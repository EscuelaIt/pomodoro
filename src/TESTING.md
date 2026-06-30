# Testing Pomodoro Components

Este documento describe cómo escribir y ejecutar tests para los componentes y servicios del Pomodoro Timer.

## Configuración de Testing

El proyecto usa:
- **Vitest** como test runner
- **@open-wc/testing** para testing de Web Components
- **MSW (Mock Service Worker)** para mocking de API
- **Sinon** para spies, stubs y mocks
- **jsdom** como ambiente de testing

## Ejecutar Tests

### Ejecutar todos los tests
```bash
npm test
```

### Ejecutar tests en modo watch
```bash
npm run test:watch
```

### Ejecutar tests con cobertura
```bash
npm run test:cov
```

### Ejecutar tests con UI interactiva
```bash
npm run test:ui
```

## Estructura de Tests

Todos los tests están ubicados en directorios `__tests__` junto a los archivos que testean:

```
src/
├── services/
│   ├── pomodoroSessionService.js
│   └── __tests__/
│       └── pomodoroSessionService.spec.js
└── components/
    ├── pom-timer.js
    ├── pom-sessions-history.js
    ├── pom-pomodoro-guide.js
    └── __tests__/
        ├── pom-timer.spec.js
        ├── pom-sessions-history.spec.js
        └── pom-pomodoro-guide.spec.js
```

## Testing de Servicios

### Ejemplo: Testing del PomodoroSessionService

Usamos **MSW** para mockar las llamadas a la API:

```javascript
import { describe, it, expect, beforeAll, afterEach, afterAll } from 'vitest'
import { setupServer } from 'msw/node'
import { http, HttpResponse } from 'msw'
import { PomodoroSessionService } from '../pomodoroSessionService.js'

const server = setupServer(
  http.post('http://localhost:3000/pomodoro-sessions/start', () => {
    return HttpResponse.json({ id: '123', duration: 1500 })
  })
)

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

describe('PomodoroSessionService', () => {
  it('should start a session', async () => {
    const service = new PomodoroSessionService()
    const result = await service.startSession()
    expect(result.id).toBe('123')
  })
})
```

### Puntos clave:
- Usa `setupServer` de MSW para interceptar solicitudes HTTP
- Define handlers para cada endpoint que necesites testear
- Llama a `server.listen()` en `beforeAll` y `server.close()` en `afterAll`
- Usa `server.resetHandlers()` entre tests para limpiar estado
- Testea casos de éxito, errores HTTP (404, 500), y errores de red

## Testing de Web Components

### Ejemplo: Testing del pom-timer

Usamos **@open-wc/testing** para renderizar y testear componentes:

```javascript
import { describe, it, expect, beforeEach } from 'vitest'
import { fixture } from '@open-wc/testing'
import sinon from 'sinon'
import '../../components/pom-timer.js'

describe('pom-timer', () => {
  let element

  beforeEach(async () => {
    element = await fixture('<pom-timer></pom-timer>')
  })

  it('should render timer display', () => {
    const display = element.shadowRoot.querySelector('.timer-display')
    expect(display.textContent).toBe('25:00')
  })

  it('should emit timer-start event', () => {
    const spy = sinon.spy()
    element.addEventListener('timer-start', spy)
    element.shadowRoot.querySelector('.btn-start').click()
    expect(spy.called).toBe(true)
  })
})
```

### Puntos clave:
- Usa `fixture()` para renderizar componentes en el DOM
- Accede al shadow DOM con `element.shadowRoot.querySelector()`
- Espera `element.updateComplete` después de cambios de propiedades
- Usa **Sinon** para crear spies en event listeners
- Testea:
  - Propiedades y estado inicial
  - Métodos del componente
  - Eventos emitidos
  - Renderizado del template
  - Clases CSS dinámicas

### Testing con estado asincrónico

Cuando cambias propiedades o disparas eventos, siempre espera `updateComplete`:

```javascript
it('should update display when time changes', async () => {
  element.time = '20:00'
  await element.updateComplete  // Espera re-render
  
  const display = element.shadowRoot.querySelector('.timer-display')
  expect(display.textContent).toBe('20:00')
})
```

## Cobertura de Tests

El proyecto requiere **80% de cobertura** en:
- Statements (sentencias)
- Branches (ramas condicionales)
- Functions (funciones)
- Lines (líneas)

Configuración en `vitest.config.js`:

```javascript
coverage: {
  provider: 'v8',
  reporter: ['text', 'json', 'html'],
  lines: 80,
  functions: 80,
  branches: 80,
  statements: 80
}
```

## Mejores Prácticas

### 1. Usa describe() para agrupar tests relacionados
```javascript
describe('pom-timer', () => {
  describe('Properties', () => {
    // Tests de propiedades
  })
  
  describe('Methods', () => {
    // Tests de métodos
  })
  
  describe('Events', () => {
    // Tests de eventos
  })
})
```

### 2. Usa nombres descriptivos
```javascript
// ✅ Bueno
it('should emit timer-start event when start button is clicked')

// ❌ Evitar
it('works')
```

### 3. Sigue el patrón AAA (Arrange, Act, Assert)
```javascript
it('should calculate progress correctly', () => {
  // Arrange
  element.totalSeconds = 100
  element.timeLeft = 50
  
  // Act
  const progress = element._getProgressCells()
  
  // Assert
  expect(progress.filter(c => c).length).toBeGreaterThan(0)
})
```

### 4. Testea casos de error
```javascript
it('should handle API errors', async () => {
  server.use(
    http.get('http://localhost:3000/sessions', () => {
      return HttpResponse.json({ message: 'Error' }, { status: 500 })
    })
  )
  
  try {
    await service.getSessions()
    expect.fail('Should throw')
  } catch (error) {
    expect(error.message).toBeDefined()
  }
})
```

### 5. Limpia después de cada test
```javascript
afterEach(() => {
  vi.clearAllMocks()
  server.resetHandlers()
})
```

## Debugging Tests

### Ver más información en tests
```javascript
// Usar console.log
console.log('element:', element)

// O usar debugger
debugger; // Pausará la ejecución

// Ejecutar tests con --inspect
node --inspect-brk ./node_modules/vitest/vitest.mjs
```

### Ejecutar un test específico
```bash
npm test -- pom-timer.spec.js
npm test -- --grep "should render timer display"
```

### Ver output HTML de cobertura
```bash
npm run test:cov
# Abre coverage/index.html en el navegador
```

## Recursos Útiles

- [Vitest Documentation](https://vitest.dev/)
- [@open-wc/testing](https://open-wc.org/docs/testing/testing-package/)
- [MSW Documentation](https://mswjs.io/)
- [Sinon Documentation](https://sinonjs.org/)
- [Testing Lit Components](https://lit.dev/docs/tools/testing/)

## Cobertura Actual

| Archivo | Coverage |
|---------|----------|
| pom-timer.js | 100% |
| pom-sessions-history.js | 94.54% |
| pom-pomodoro-guide.js | 92.59% |
| pomodoroSessionService.js | 89.74% |

## Próximos Pasos

- Añadir tests para `pom-app.js`
- Aumentar cobertura de branches en el servicio (59%)
- Añadir tests de integración entre componentes
- Añadir tests E2E con Playwright
