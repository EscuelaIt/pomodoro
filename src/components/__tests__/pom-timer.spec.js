import { describe, it, expect, beforeEach, vi } from 'vitest'
import { fixture, expect as expectWC } from '@open-wc/testing'
import sinon from 'sinon'
import '../../components/pom-timer.js'

const TOTAL_SECONDS_DEFAULT = 25 * 60
const SECONDS_PER_MINUTE = 60

describe('pom-timer', () => {
  let element

  beforeEach(async () => {
    element = await fixture('<pom-timer></pom-timer>')
  })

  describe('Properties', () => {
    it('should render with default properties', () => {
      expect(element.time).toBe('25:00')
      expect(element.timeLeft).toBe(TOTAL_SECONDS_DEFAULT)
      expect(element.totalSeconds).toBe(TOTAL_SECONDS_DEFAULT)
      expect(element.isRunning).toBe(false)
    })

    it('should update time property when set', async () => {
      element.time = '20:00'
      await element.updateComplete
      expect(element.time).toBe('20:00')
    })

    it('should update isRunning property when set', async () => {
      element.isRunning = true
      await element.updateComplete
      expect(element.isRunning).toBe(true)
    })

    it('should update totalSeconds property when set', async () => {
      element.totalSeconds = 1800
      await element.updateComplete
      expect(element.totalSeconds).toBe(1800)
    })
  })

  describe('Methods', () => {
    it('should have _getProgressCells method that returns array', () => {
      const cells = element._getProgressCells()
      expect(Array.isArray(cells)).toBe(true)
      expect(cells.length).toBe(100)
    })

    it('should calculate progress cells correctly when time has elapsed', () => {
      element.totalSeconds = 100
      element.timeLeft = 50
      const cells = element._getProgressCells()

      const filledCells = cells.filter((cell) => cell === true)
      expect(filledCells.length).toBeGreaterThan(0)
      expect(filledCells.length).toBeLessThan(100)
    })

    it('should have all cells unfilled at start', () => {
      element.totalSeconds = TOTAL_SECONDS_DEFAULT
      element.timeLeft = TOTAL_SECONDS_DEFAULT
      const cells = element._getProgressCells()

      const filledCells = cells.filter((cell) => cell === true)
      expect(filledCells.length).toBe(0)
    })

    it('should have all cells filled when completed', () => {
      element.totalSeconds = 100
      element.timeLeft = 0
      const cells = element._getProgressCells()

      const filledCells = cells.filter((cell) => cell === true)
      expect(filledCells.length).toBe(100)
    })
  })

  describe('Events', () => {
    it('should emit timer-start event when start button is clicked', async () => {
      const spy = sinon.spy()
      element.addEventListener('timer-start', spy)

      const startButton = element.shadowRoot.querySelector('.btn-start')
      startButton.click()

      expect(spy.called).toBe(true)
      expect(spy.callCount).toBe(1)
    })

    it('should emit timer-reset event when reset button is clicked', async () => {
      const spy = sinon.spy()
      element.addEventListener('timer-reset', spy)

      const resetButton = element.shadowRoot.querySelector('.btn-reset')
      resetButton.click()

      expect(spy.called).toBe(true)
      expect(spy.callCount).toBe(1)
    })

    it('should emit events with bubbles and composed flags', async () => {
      const spy = sinon.spy()
      const listener = (event) => {
        expect(event.bubbles).toBe(true)
        expect(event.composed).toBe(true)
        spy()
      }
      element.addEventListener('timer-start', listener)

      const startButton = element.shadowRoot.querySelector('.btn-start')
      startButton.click()

      expect(spy.called).toBe(true)
    })

    it('should handle multiple event listeners', async () => {
      const spy1 = sinon.spy()
      const spy2 = sinon.spy()

      element.addEventListener('timer-start', spy1)
      element.addEventListener('timer-start', spy2)

      const startButton = element.shadowRoot.querySelector('.btn-start')
      startButton.click()

      expect(spy1.called).toBe(true)
      expect(spy2.called).toBe(true)
    })
  })

  describe('Rendering', () => {
    it('should render timer display with correct time', () => {
      const display = element.shadowRoot.querySelector('.timer-display')
      expect(display.textContent).toBe('25:00')
    })

    it('should render button group with two buttons', () => {
      const buttons = element.shadowRoot.querySelectorAll('dile-button')
      expect(buttons.length).toBe(2)
    })

    it('should render start/pause button text based on isRunning', async () => {
      const startButton = element.shadowRoot.querySelector('.btn-start')

      element.isRunning = false
      await element.updateComplete
      expect(startButton.textContent).toContain('Iniciar')

      element.isRunning = true
      await element.updateComplete
      expect(startButton.textContent).toContain('Pausar')
    })

    it('should render reset button', () => {
      const resetButton = element.shadowRoot.querySelector('.btn-reset')
      expect(resetButton).toBeDefined()
      expect(resetButton.textContent).toContain('Reiniciar')
    })

    it('should render progress grid with 100 cells', () => {
      const cells = element.shadowRoot.querySelectorAll('.progress-cell')
      expect(cells.length).toBe(100)
    })

    it('should apply filled class to progress cells', async () => {
      element.totalSeconds = 100
      element.timeLeft = 50
      await element.updateComplete

      const cells = element.shadowRoot.querySelectorAll('.progress-cell')
      const filledCells = Array.from(cells).filter((cell) =>
        cell.classList.contains('filled')
      )

      expect(filledCells.length).toBeGreaterThan(0)
    })

    it('should apply correct CSS classes to buttons', () => {
      const startButton = element.shadowRoot.querySelector('.btn-start')
      const resetButton = element.shadowRoot.querySelector('.btn-reset')

      expect(startButton.classList.contains('btn')).toBe(true)
      expect(startButton.classList.contains('btn-start')).toBe(true)
      expect(resetButton.classList.contains('btn')).toBe(true)
      expect(resetButton.classList.contains('btn-reset')).toBe(true)
    })

    it('should have host and elements in DOM', () => {
      const host = element.shadowRoot.host
      expect(host).toBeDefined()

      const display = element.shadowRoot.querySelector('.timer-display')
      expect(display).toBeDefined()

      const progressGrid = element.shadowRoot.querySelector('.progress-grid')
      expect(progressGrid).toBeDefined()

      const buttonGroup = element.shadowRoot.querySelector('.button-group')
      expect(buttonGroup).toBeDefined()
    })
  })

  describe('Integration', () => {
    it('should maintain time display consistency', async () => {
      element.time = '10:05'
      element.timeLeft = 605
      element.totalSeconds = 605

      await element.updateComplete

      const display = element.shadowRoot.querySelector('.timer-display')
      expect(display.textContent).toBe('10:05')
      expect(element.timeLeft).toBe(605)
    })

    it('should handle rapid event emissions', async () => {
      const spy = sinon.spy()
      element.addEventListener('timer-start', spy)

      const startButton = element.shadowRoot.querySelector('.btn-start')

      startButton.click()
      startButton.click()
      startButton.click()

      expect(spy.callCount).toBe(3)
    })
  })
})
