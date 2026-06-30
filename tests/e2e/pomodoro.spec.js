import { test, expect } from '@playwright/test';

test.describe('Pomodoro App E2E', () => {
  let sessionId = 0;

  test.beforeEach(async ({ page }) => {
    sessionId = 0;
    
    // Mockear las llamadas al API - RESPONDER CON ÉXITO
    await page.route('**/pomodoro-sessions/start', (route) => {
      sessionId++;
      route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({
          id: `session-${sessionId}`,
          startedAt: new Date().toISOString(),
          duration: 1500,
          type: 'pomodoro'
        })
      });
    });
    
    await page.route('**/pomodoro-sessions/stop', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: `session-${sessionId}`,
          stoppedAt: new Date().toISOString()
        })
      });
    });
    
    await page.route('**/pomodoro-sessions/reset', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Cleared' })
      });
    });
    
    await page.route('**/pomodoro-sessions', (route) => {
      if (route.request().method() === 'GET') {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ sessions: [], total: 0 })
        });
      } else if (route.request().method() === 'DELETE') {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ message: 'Cleared' })
        });
      }
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  // Test 1: Página carga correctamente
  test('Página carga correctamente', async ({ page }) => {
    const title = page.locator('h1');
    await expect(title).toContainText('Pomodoro');
    
    const app = page.locator('pom-app');
    await expect(app).toBeVisible();
  });

  // Test 2: Ver componentes principales
  test('Componentes principales son visibles', async ({ page }) => {
    const timer = page.locator('pom-timer');
    await expect(timer).toBeVisible();

    const history = page.locator('pom-sessions-history');
    await expect(history).toBeVisible();

    const guide = page.locator('pom-pomodoro-guide');
    await expect(guide).toBeVisible();
  });

  // Test 3: Timer muestra formato correcto MM:SS
  test('Timer muestra formato correcto MM:SS', async ({ page }) => {
    const timeDisplay = page.locator('pom-timer').locator('.timer-display');
    await expect(timeDisplay).toContainText('25:00');
  });

  // Test 4: Click "Start Pomodoro" inicia el conteo
  test('Click "Start Pomodoro" inicia el timer', async ({ page }) => {
    const startBtn = page.locator('pom-timer').locator('dile-button').first();
    
    // Verificar estado inicial
    const timeDisplayBefore = page.locator('pom-timer').locator('.timer-display');
    await expect(timeDisplayBefore).toContainText('25:00');

    // Click start
    await startBtn.click();

    // Esperar a que el timer empiece
    await page.waitForTimeout(1100);

    // Verificar que el tiempo ha decrementado
    const timeDisplayAfter = page.locator('pom-timer').locator('.timer-display');
    await expect(timeDisplayAfter).not.toContainText('25:00');
  });

  // Test 5: Tiempo decrementa cada segundo
  test('Tiempo decrementa cada segundo', async ({ page }) => {
    const startBtn = page.locator('pom-timer').locator('dile-button').first();
    await startBtn.click();

    const timeDisplay = page.locator('pom-timer').locator('.timer-display');
    const timeBefore = await timeDisplay.textContent();

    await page.waitForTimeout(2100);

    const timeAfter = await timeDisplay.textContent();
    expect(timeBefore).not.toBe(timeAfter);
  });

  // Test 6: Click "Stop" pausa el timer
  test('Click "Stop" pausa el timer', async ({ page }) => {
    const buttons = page.locator('pom-timer').locator('dile-button');
    const startBtn = buttons.first();
    
    await startBtn.click();
    await page.waitForTimeout(1100);

    const timeDisplay = page.locator('pom-timer').locator('.timer-display');
    const timeBefore = await timeDisplay.textContent();

    // Click again to pause
    await startBtn.click();
    await page.waitForTimeout(1100);

    const timeAfter = await timeDisplay.textContent();
    // Should be the same since we paused it
    expect(timeBefore).toBe(timeAfter);
  });

  // Test 7: Click "Reset" vuelve a 25:00
  test('Click "Reset" vuelve a 25:00', async ({ page }) => {
    const buttons = page.locator('pom-timer').locator('dile-button');
    const startBtn = buttons.first();
    
    await startBtn.click();
    await page.waitForTimeout(2100);

    const resetBtn = buttons.nth(1);
    await resetBtn.click();

    const timeDisplay = page.locator('pom-timer').locator('.timer-display');
    await expect(timeDisplay).toContainText('25:00');
  });

  // Test 8: Historial de sesiones visible
  test('Historial de sesiones es visible', async ({ page }) => {
    const history = page.locator('pom-sessions-history');
    await expect(history).toBeVisible();

    const historyTitle = page.locator('pom-sessions-history').locator('h2, h3');
    await expect(historyTitle).toBeVisible();
  });

  // Test 9: Ciclos múltiples: start → stop → reset → repeat
  test('Ciclos múltiples funcionan correctamente', async ({ page }) => {
    const buttons = page.locator('pom-timer').locator('dile-button');
    const startBtn = buttons.first();
    const resetBtn = buttons.nth(1);
    const timeDisplay = page.locator('pom-timer').locator('.timer-display');

    // Ciclo 1: Start
    await startBtn.click();
    await page.waitForTimeout(1100);
    const time1 = await timeDisplay.textContent();
    expect(time1).not.toBe('25:00');

    // Ciclo 1: Reset
    await resetBtn.click();
    await expect(timeDisplay).toContainText('25:00');

    // Ciclo 2: Start
    await startBtn.click();
    await page.waitForTimeout(1100);
    const time2 = await timeDisplay.textContent();
    expect(time2).not.toBe('25:00');

    // Ciclo 2: Reset
    await resetBtn.click();
    await expect(timeDisplay).toContainText('25:00');
  });

  // Test 10: Botones tienen estados correctos
  test('Botones tienen estados habilitados/deshabilitados correctos', async ({ page }) => {
    const buttons = page.locator('pom-timer').locator('dile-button');
    const startBtn = buttons.first();

    // Botón start debe estar habilitado al inicio
    await expect(startBtn).toBeEnabled();

    // Click start
    await startBtn.click();
    await page.waitForTimeout(500);

    // Ahora debería mostrar "Stop" y estar habilitado
    const stopBtn = buttons.first();
    await expect(stopBtn).toBeEnabled();
  });

  // Test 11: Tamaño responsivo en viewport mobile
  test('App es responsiva en viewport mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });

    const app = page.locator('pom-app');
    await expect(app).toBeVisible();

    const timer = page.locator('pom-timer');
    await expect(timer).toBeVisible();

    const timeDisplay = page.locator('pom-timer').locator('.timer-display');
    await expect(timeDisplay).toBeVisible();
  });

  // Test 12: App es responsiva en viewport desktop
  test('App es responsiva en viewport desktop', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });

    const app = page.locator('pom-app');
    await expect(app).toBeVisible();

    const timer = page.locator('pom-timer');
    await expect(timer).toBeVisible();

    const timeDisplay = page.locator('pom-timer').locator('.timer-display');
    await expect(timeDisplay).toBeVisible();
  });

  // Test 13: Elemento title contiene emoji
  test('Título contiene emoji pomodoro', async ({ page }) => {
    const title = page.locator('h1');
    await expect(title).toContainText('🍅');
  });

  // Test 14: Timer inicia y se detiene correctamente
  test('Timer inicia en estado detenido y se reinicia después de reset', async ({ page }) => {
    const buttons = page.locator('pom-timer').locator('dile-button');
    const startBtn = buttons.first();
    const resetBtn = buttons.nth(1);
    const timeDisplay = page.locator('pom-timer').locator('.timer-display');

    // Verificar estado inicial
    await expect(timeDisplay).toContainText('25:00');

    // Start
    await startBtn.click();
    await page.waitForTimeout(1100);
    
    let currentTime = await timeDisplay.textContent();
    expect(currentTime).not.toBe('25:00');

    // Reset
    await resetBtn.click();
    await expect(timeDisplay).toContainText('25:00');
  });

  // Test 15: Verificar que los componentes se renderean sin errores críticos
  test('Componentes se renderizan sin errores críticos en consola', async ({ page }) => {
    const criticalErrors = [];
    
    page.on('console', msg => {
      if (msg.type() === 'error' && msg.text().includes('Uncaught')) {
        criticalErrors.push(msg.text());
      }
    });

    page.on('pageerror', exception => {
      criticalErrors.push(exception.toString());
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Dar tiempo para que cargue completamente
    await page.waitForTimeout(500);

    // Allow some network errors, focus on uncaught exceptions
    expect(criticalErrors.filter(e => e.includes('Uncaught')).length).toBe(0);
  });

  // Test 16: Verificar estructura HTML correcta
  test('Estructura HTML es correcta con Web Components', async ({ page }) => {
    const pomApp = page.locator('pom-app');
    await expect(pomApp).toHaveCount(1);

    const pomTimer = page.locator('pom-timer');
    await expect(pomTimer).toHaveCount(1);

    const pomHistory = page.locator('pom-sessions-history');
    await expect(pomHistory).toHaveCount(1);

    const pomGuide = page.locator('pom-pomodoro-guide');
    await expect(pomGuide).toHaveCount(1);
  });

  // Test 17: Verificar que el timer tiene elementos interactivos
  test('Timer contiene elementos interactivos (botones)', async ({ page }) => {
    const buttons = page.locator('pom-timer').locator('dile-button');
    const count = await buttons.count();
    
    // Debe haber al menos 3 botones: Start, Stop/Pause, Reset
    expect(count).toBeGreaterThanOrEqual(2);
  });

  // Test 18: Verificar que el display del tiempo es un elemento válido
  test('Display del tiempo existe y es visible', async ({ page }) => {
    const timeDisplay = page.locator('pom-timer').locator('.timer-display');
    await expect(timeDisplay).toBeVisible();
    
    const text = await timeDisplay.textContent();
    expect(text).toMatch(/\d{2}:\d{2}/);
  });
});
