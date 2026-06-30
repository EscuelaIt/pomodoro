import { describe, it, expect, beforeEach } from 'vitest'
import { fixture, expect as expectWC } from '@open-wc/testing'
import sinon from 'sinon'
import '../../components/pom-pomodoro-guide.js'

describe('pom-pomodoro-guide', () => {
  let element

  beforeEach(async () => {
    element = await fixture('<pom-pomodoro-guide></pom-pomodoro-guide>')
  })

  describe('Modes', () => {
    it('should initialize with tutorial mode', () => {
      expect(element.mode).toBe('tutorial')
    })

    it('should support tutorial mode', () => {
      element.setMode('tutorial')
      expect(element.mode).toBe('tutorial')
    })

    it('should support faq mode', () => {
      element.setMode('faq')
      expect(element.mode).toBe('faq')
    })

    it('should support comparison mode', () => {
      element.setMode('comparison')
      expect(element.mode).toBe('comparison')
    })

    it('should reject invalid mode', async () => {
      element.setMode('tutorial')
      element.setMode('invalid-mode')
      expect(element.mode).toBe('tutorial')
    })

    it('should reset currentStep when changing mode', async () => {
      element.currentStep = 2
      element.setMode('faq')
      expect(element.currentStep).toBe(0)
    })

    it('should reset expandedFaqIndex when changing mode', async () => {
      element.expandedFaqIndex = 1
      element.setMode('faq')
      expect(element.expandedFaqIndex).toBeNull()
    })
  })

  describe('Mode Events', () => {
    it('should emit modeChanged event when mode changes', async () => {
      const spy = sinon.spy()
      element.addEventListener('modeChanged', spy)

      element.setMode('faq')

      expect(spy.called).toBe(true)
      expect(spy.firstCall.args[0].detail.mode).toBe('faq')
    })

    it('should emit modeChanged with bubbles and composed', async () => {
      const spy = sinon.spy()
      const listener = (event) => {
        expect(event.bubbles).toBe(true)
        expect(event.composed).toBe(true)
        spy()
      }
      element.addEventListener('modeChanged', listener)

      element.setMode('comparison')

      expect(spy.called).toBe(true)
    })
  })

  describe('Tutorial Navigation', () => {
    it('should initialize with step 0', () => {
      element.setMode('tutorial')
      expect(element.currentStep).toBe(0)
    })

    it('should navigate to next step', async () => {
      element.setMode('tutorial')
      element.nextStep()
      expect(element.currentStep).toBe(1)
    })

    it('should navigate to previous step', async () => {
      element.setMode('tutorial')
      element.currentStep = 2
      element.previousStep()
      expect(element.currentStep).toBe(1)
    })

    it('should not go before step 0', async () => {
      element.setMode('tutorial')
      element.currentStep = 0
      element.previousStep()
      expect(element.currentStep).toBe(0)
    })

    it('should not exceed max steps', async () => {
      element.setMode('tutorial')
      element.currentStep = 2
      element.nextStep()
      expect(element.currentStep).toBe(2)
    })

    it('should emit stepChanged event when navigating', async () => {
      const spy = sinon.spy()
      element.addEventListener('stepChanged', spy)

      element.setMode('tutorial')
      element.nextStep()

      expect(spy.called).toBe(true)
      expect(spy.firstCall.args[0].detail.step).toBe(1)
    })

    it('should track step changes accurately', async () => {
      element.setMode('tutorial')

      element.nextStep()
      expect(element.currentStep).toBe(1)

      element.nextStep()
      expect(element.currentStep).toBe(2)

      element.previousStep()
      expect(element.currentStep).toBe(1)
    })
  })

  describe('FAQ Functionality', () => {
    it('should toggle FAQ item expansion', () => {
      element.setMode('faq')
      expect(element.expandedFaqIndex).toBeNull()

      element.toggleFaqItem(0)
      expect(element.expandedFaqIndex).toBe(0)

      element.toggleFaqItem(0)
      expect(element.expandedFaqIndex).toBeNull()
    })

    it('should switch between FAQ items', () => {
      element.setMode('faq')

      element.toggleFaqItem(0)
      expect(element.expandedFaqIndex).toBe(0)

      element.toggleFaqItem(1)
      expect(element.expandedFaqIndex).toBe(1)

      element.toggleFaqItem(2)
      expect(element.expandedFaqIndex).toBe(2)
    })

    it('should handle invalid FAQ indices', () => {
      element.setMode('faq')
      element.toggleFaqItem(999)
      expect(element.expandedFaqIndex).toBe(999)
    })
  })

  describe('Max Steps', () => {
    it('should return correct max steps for tutorial', () => {
      element.setMode('tutorial')
      const max = element.getMaxSteps()
      expect(max).toBe(3)
    })

    it('should return 1 for FAQ mode', () => {
      element.setMode('faq')
      const max = element.getMaxSteps()
      expect(max).toBe(1)
    })

    it('should return 1 for comparison mode', () => {
      element.setMode('comparison')
      const max = element.getMaxSteps()
      expect(max).toBe(1)
    })
  })

  describe('Rendering', () => {
    it('should render guide container', () => {
      const container = element.shadowRoot.querySelector('.guide-container')
      expect(container).toBeDefined()
    })

    it('should render mode selector', () => {
      const modeSelector = element.shadowRoot.querySelector('.mode-selector')
      expect(modeSelector).toBeDefined()
    })

    it('should render tutorial button', () => {
      const buttons = element.shadowRoot.querySelectorAll('.mode-btn')
      expect(buttons.length).toBeGreaterThanOrEqual(3)
      expect(buttons[0].textContent).toContain('Tutorial')
    })

    it('should render FAQ button', () => {
      const buttons = element.shadowRoot.querySelectorAll('.mode-btn')
      expect(buttons[1].textContent).toContain('FAQ')
    })

    it('should render Comparison button', () => {
      const buttons = element.shadowRoot.querySelectorAll('.mode-btn')
      expect(buttons[2].textContent).toContain('Comparativa')
    })

    it('should highlight active mode button', async () => {
      element.setMode('faq')
      await element.updateComplete

      const buttons = element.shadowRoot.querySelectorAll('.mode-btn')
      expect(buttons[1].classList.contains('primary')).toBe(true)
      expect(buttons[0].classList.contains('primary')).toBe(false)
    })

    it('should render content wrapper', () => {
      const wrapper = element.shadowRoot.querySelector('.content-wrapper')
      expect(wrapper).toBeDefined()
    })

    it('should render tutorial content', () => {
      element.setMode('tutorial')
      const tutorialContent = element.shadowRoot.querySelector('.tutorial-mode')
      expect(tutorialContent).toBeDefined()
    })

    it('should render FAQ content', () => {
      element.setMode('faq')
      const faqContent = element.shadowRoot.querySelector('.faq-mode')
      expect(faqContent).toBeDefined()
    })

    it('should render comparison content', () => {
      element.setMode('comparison')
      const comparisonContent = element.shadowRoot.querySelector('.comparison-mode')
      expect(comparisonContent).toBeDefined()
    })

    it('should render step indicator in tutorial', () => {
      element.setMode('tutorial')
      const indicator = element.shadowRoot.querySelector('.step-indicator')
      expect(indicator).toBeDefined()
      expect(indicator.textContent).toContain('Paso 1 de 3')
    })

    it('should render content card with title', () => {
      element.setMode('tutorial')
      const card = element.shadowRoot.querySelector('.content-card')
      expect(card).toBeDefined()
      const title = card.querySelector('h2')
      expect(title).toBeDefined()
    })

    it('should render FAQ items', async () => {
      element.setMode('faq')
      await element.updateComplete
      const faqItems = element.shadowRoot.querySelectorAll('.faq-item')
      expect(faqItems.length).toBeGreaterThan(0)
    })

    it('should render comparison cards', async () => {
      element.setMode('comparison')
      await element.updateComplete
      const cards = element.shadowRoot.querySelectorAll('.comparison-card')
      expect(cards.length).toBeGreaterThan(0)
    })
  })

  describe('Tutorial Rendering Details', () => {
    it('should show tutorial icon', () => {
      element.setMode('tutorial')
      const icon = element.shadowRoot.querySelector('.card-icon')
      expect(icon).toBeDefined()
    })

    it('should show tutorial title', () => {
      element.setMode('tutorial')
      const title = element.shadowRoot.querySelector('.content-card h2')
      expect(title).toBeDefined()
      expect(title.textContent).toContain('Pomodoro')
    })

    it('should show tutorial content text', () => {
      element.setMode('tutorial')
      const content = element.shadowRoot.querySelector('.content-text')
      expect(content).toBeDefined()
    })

    it('should update tutorial content when step changes', async () => {
      element.setMode('tutorial')
      const firstTitle = element.shadowRoot.querySelector('.content-card h2')
        .textContent

      element.nextStep()
      await element.updateComplete

      const secondTitle = element.shadowRoot.querySelector('.content-card h2')
        .textContent

      expect(firstTitle).not.toBe(secondTitle)
    })
  })

  describe('FAQ Rendering Details', () => {
    it('should render FAQ questions as buttons', async () => {
      element.setMode('faq')
      await element.updateComplete
      const questions = element.shadowRoot.querySelectorAll('.faq-question')
      expect(questions.length).toBeGreaterThan(0)
    })

    it('should show FAQ icons', async () => {
      element.setMode('faq')
      await element.updateComplete
      const icons = element.shadowRoot.querySelectorAll('.faq-icon')
      expect(icons.length).toBeGreaterThan(0)
    })

    it('should show FAQ answers when expanded', async () => {
      element.setMode('faq')
      element.toggleFaqItem(0)
      await element.updateComplete

      const answer = element.shadowRoot.querySelector('.faq-answer')
      expect(answer).toBeDefined()
      expect(answer.textContent).toBeDefined()
    })

    it('should hide FAQ answer when collapsed', async () => {
      element.setMode('faq')
      element.expandedFaqIndex = null
      await element.updateComplete

      const answer = element.shadowRoot.querySelector('.faq-answer')
      expect(answer).toBeNull()
    })

    it('should show + icon when FAQ collapsed', async () => {
      element.setMode('faq')
      element.expandedFaqIndex = null
      await element.updateComplete
      const icons = element.shadowRoot.querySelectorAll('.faq-icon')
      expect(icons[0].textContent).toBe('+')
    })

    it('should show − icon when FAQ expanded', async () => {
      element.setMode('faq')
      element.toggleFaqItem(0)
      await element.updateComplete

      const icons = element.shadowRoot.querySelectorAll('.faq-icon')
      expect(icons[0].textContent).toBe('−')
    })
  })

  describe('Navigation', () => {
    it('should show navigation in tutorial mode', () => {
      element.setMode('tutorial')
      const nav = element.shadowRoot.querySelector('.navigation')
      expect(nav).toBeDefined()
    })

    it('should not show navigation in FAQ mode', async () => {
      element.setMode('faq')
      await element.updateComplete
      const nav = element.shadowRoot.querySelector('.navigation')
      expect(nav).toBeNull()
    })

    it('should not show navigation in comparison mode', async () => {
      element.setMode('comparison')
      await element.updateComplete
      const nav = element.shadowRoot.querySelector('.navigation')
      expect(nav).toBeNull()
    })

    it('should render previous button', () => {
      element.setMode('tutorial')
      const buttons = element.shadowRoot.querySelectorAll('.nav-btn')
      expect(buttons[0].textContent).toContain('Anterior')
    })

    it('should render next button', () => {
      element.setMode('tutorial')
      const buttons = element.shadowRoot.querySelectorAll('.nav-btn')
      expect(buttons[buttons.length - 1].textContent).toContain('Siguiente')
    })

    it('should disable previous button at first step', () => {
      element.setMode('tutorial')
      element.currentStep = 0
      const buttons = element.shadowRoot.querySelectorAll('.nav-btn')
      expect(buttons[0].disabled).toBe(true)
    })

    it('should disable next button at last step', async () => {
      element.setMode('tutorial')
      element.currentStep = 2
      await element.updateComplete

      const buttons = element.shadowRoot.querySelectorAll('.nav-btn')
      expect(buttons[buttons.length - 1].disabled).toBe(true)
    })

    it('should enable previous button when not at first step', async () => {
      element.setMode('tutorial')
      element.currentStep = 1
      await element.updateComplete

      const buttons = element.shadowRoot.querySelectorAll('.nav-btn')
      expect(buttons[0].disabled).toBe(false)
    })

    it('should render progress dots for each step', () => {
      element.setMode('tutorial')
      const dots = element.shadowRoot.querySelectorAll('.dot')
      expect(dots.length).toBe(3)
    })

    it('should highlight active progress dot', async () => {
      element.setMode('tutorial')
      element.currentStep = 1
      await element.updateComplete
      const dots = element.shadowRoot.querySelectorAll('.dot')
      expect(dots[1].classList.contains('active')).toBe(true)
      expect(dots[0].classList.contains('active')).toBe(false)
    })
  })

  describe('Button Interactions', () => {
    it('should navigate when mode button clicked', async () => {
      const button = element.shadowRoot.querySelectorAll('.mode-btn')[1]
      button.click()
      await element.updateComplete

      expect(element.mode).toBe('faq')
    })

    it('should navigate next on button click', async () => {
      element.setMode('tutorial')
      const buttons = element.shadowRoot.querySelectorAll('.nav-btn')
      buttons[buttons.length - 1].click()
      await element.updateComplete

      expect(element.currentStep).toBe(1)
    })

    it('should navigate previous on button click', async () => {
      element.setMode('tutorial')
      element.currentStep = 2
      await element.updateComplete

      const buttons = element.shadowRoot.querySelectorAll('.nav-btn')
      buttons[0].click()
      await element.updateComplete

      expect(element.currentStep).toBe(1)
    })

    it('should navigate to step when dot clicked', async () => {
      element.setMode('tutorial')
      const dots = element.shadowRoot.querySelectorAll('.dot')

      dots[2].click()
      await element.updateComplete

      expect(element.currentStep).toBe(2)
    })

    it('should toggle FAQ when question clicked', async () => {
      element.setMode('faq')
      await element.updateComplete
      const questions = element.shadowRoot.querySelectorAll('.faq-question')

      questions[0].click()
      await element.updateComplete

      expect(element.expandedFaqIndex).toBe(0)

      questions[0].click()
      await element.updateComplete

      expect(element.expandedFaqIndex).toBeNull()
    })
  })

  describe('Comparison Mode Rendering', () => {
    it('should render comparison table', () => {
      element.setMode('comparison')
      const table = element.shadowRoot.querySelector('.comparison-table')
      expect(table).toBeDefined()
    })

    it('should render comparison card titles', async () => {
      element.setMode('comparison')
      await element.updateComplete
      const titles = element.shadowRoot.querySelectorAll('.comparison-card h3')
      expect(titles.length).toBeGreaterThan(0)
    })

    it('should render comparison rows', async () => {
      element.setMode('comparison')
      await element.updateComplete
      const rows = element.shadowRoot.querySelectorAll('.comparison-row')
      expect(rows.length).toBeGreaterThan(0)
    })

    it('should show labels and values in comparison', async () => {
      element.setMode('comparison')
      await element.updateComplete
      const labels = element.shadowRoot.querySelectorAll('.comparison-row .label')
      const values = element.shadowRoot.querySelectorAll('.comparison-row .value')

      expect(labels.length).toBeGreaterThan(0)
      expect(values.length).toBeGreaterThan(0)
    })
  })
})
