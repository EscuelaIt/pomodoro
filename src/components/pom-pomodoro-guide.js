import { LitElement, html, css } from 'lit';

// Constants
const MODES = {
  TUTORIAL: 'tutorial',
  FAQ: 'faq',
  COMPARISON: 'comparison'
};

const TUTORIAL_STEPS = [
  {
    title: '¿Qué es el Método Pomodoro?',
    content: 'El Método Pomodoro es una técnica de gestión del tiempo que divide el trabajo en intervalos cortos, tradicionalmente de 25 minutos, separados por breves descansos. Fue creada por Francesco Cirillo.',
    icon: '🍅'
  },
  {
    title: 'Los 4 Pasos del Método',
    content: '1. Planifica tus tareas\n2. Trabaja durante 25 minutos (1 Pomodoro)\n3. Toma un descanso de 5 minutos\n4. Después de 4 pomodoros, toma un descanso largo de 15-30 minutos',
    icon: '⏱️'
  },
  {
    title: 'Ventajas del Método',
    content: '✓ Mejora el enfoque y la concentración\n✓ Reduce la procrastinación\n✓ Aumenta la productividad\n✓ Proporciona un sentido de progreso\n✓ Favorece el equilibrio trabajo-descanso',
    icon: '⭐'
  }
];

const FAQ_ITEMS = [
  {
    question: '¿Cuánto dura un Pomodoro?',
    answer: 'Tradicionalmente, un Pomodoro dura 25 minutos, seguido de un breve descanso de 5 minutos. Sin embargo, la técnica es flexible y puedes ajustar los tiempos según tus necesidades.'
  },
  {
    question: '¿Qué hacer si me interrumpen durante un Pomodoro?',
    answer: 'Si te interrumpen, anota la interrupción y continúa con tu Pomodoro. La idea es minimizar las distracciones. Si es una interrupción urgente importante, reinicia el contador.'
  },
  {
    question: '¿Cuántos Pomodoros debo hacer al día?',
    answer: 'La cantidad de Pomodoros depende de tu capacidad y del trabajo que tengas. Un promedio de 8-10 pomodoros diarios es considerado un buen nivel de productividad.'
  },
  {
    question: '¿Es efectivo para tareas creativas?',
    answer: 'Sí, muchos creadores y diseñadores utilizan el Método Pomodoro. Algunos combinan pomodoros más largos (45-90 minutos) para tareas que requieren mayor inmersión.'
  }
];

const COMPARISON_ITEMS = [
  {
    technique: 'Pomodoro',
    interval: '25 minutos',
    break: '5 minutos',
    pros: 'Enfoque intenso, ritmo constante',
    cons: 'Puede ser corto para tareas largas'
  },
  {
    technique: 'Timeboxing',
    interval: 'Variable',
    break: 'Variable',
    pros: 'Flexible, adaptable',
    cons: 'Requiere disciplina personal'
  },
  {
    technique: 'Deep Work',
    interval: '90+ minutos',
    break: '15-20 minutos',
    pros: 'Ideal para tareas complejas',
    cons: 'Difícil de mantener el enfoque'
  }
];

export class PomPomodoroGuide extends LitElement {
  static properties = {
    mode: { type: String },
    currentStep: { type: Number },
    expandedFaqIndex: { type: Number }
  };

  constructor() {
    super();
    this.mode = MODES.TUTORIAL;
    this.currentStep = 0;
    this.expandedFaqIndex = null;
  }

  setMode(newMode) {
    if (Object.values(MODES).includes(newMode)) {
      this.mode = newMode;
      this.currentStep = 0;
      this.expandedFaqIndex = null;
      this.dispatchEvent(
        new CustomEvent('modeChanged', {
          detail: { mode: newMode },
          bubbles: true,
          composed: true
        })
      );
    }
  }

  nextStep() {
    const maxSteps = this.getMaxSteps();
    if (this.currentStep < maxSteps - 1) {
      this.currentStep++;
      this.dispatchEvent(
        new CustomEvent('stepChanged', {
          detail: { step: this.currentStep },
          bubbles: true,
          composed: true
        })
      );
    }
  }

  previousStep() {
    if (this.currentStep > 0) {
      this.currentStep--;
      this.dispatchEvent(
        new CustomEvent('stepChanged', {
          detail: { step: this.currentStep },
          bubbles: true,
          composed: true
        })
      );
    }
  }

  getMaxSteps() {
    switch (this.mode) {
      case MODES.TUTORIAL:
        return TUTORIAL_STEPS.length;
      case MODES.FAQ:
        return 1;
      case MODES.COMPARISON:
        return 1;
      default:
        return 1;
    }
  }

  toggleFaqItem(index) {
    this.expandedFaqIndex = this.expandedFaqIndex === index ? null : index;
  }

  render() {
    return html`
      <div class="guide-container">
        ${this.renderModeSelector()}
        ${this.renderContent()}
        ${this.renderNavigation()}
      </div>
    `;
  }

  renderModeSelector() {
    return html`
      <div class="mode-selector">
        <button
          @click=${() => this.setMode(MODES.TUTORIAL)}
          class=${'mode-btn ' + (this.mode === MODES.TUTORIAL ? 'primary' : '')}
        >
          Tutorial
        </button>
        <button
          @click=${() => this.setMode(MODES.FAQ)}
          class=${'mode-btn ' + (this.mode === MODES.FAQ ? 'primary' : '')}
        >
          FAQ
        </button>
        <button
          @click=${() => this.setMode(MODES.COMPARISON)}
          class=${'mode-btn ' + (this.mode === MODES.COMPARISON ? 'primary' : '')}
        >
          Comparativa
        </button>
      </div>
    `;
  }

  renderContent() {
    switch (this.mode) {
      case MODES.TUTORIAL:
        return this.renderTutorial();
      case MODES.FAQ:
        return this.renderFaq();
      case MODES.COMPARISON:
        return this.renderComparison();
      default:
        return html``;
    }
  }

  renderTutorial() {
    const step = TUTORIAL_STEPS[this.currentStep];
    return html`
      <div class="content-wrapper tutorial-mode">
        <div class="step-indicator">
          Paso ${this.currentStep + 1} de ${TUTORIAL_STEPS.length}
        </div>
        <div class="content-card">
          <div class="card-icon">${step.icon}</div>
          <h2>${step.title}</h2>
          <p class="content-text">${step.content.split('\n').map((line, i) => 
            html`${i > 0 ? html`<br>` : ''}${line}`
          )}</p>
        </div>
      </div>
    `;
  }

  renderFaq() {
    return html`
      <div class="content-wrapper faq-mode">
        <h2>Preguntas Frecuentes</h2>
        <div class="faq-list">
          ${FAQ_ITEMS.map((item, index) => html`
            <div class="faq-item">
              <button 
                class="faq-question"
                @click=${() => this.toggleFaqItem(index)}
              >
                <span>${item.question}</span>
                <span class="faq-icon">${this.expandedFaqIndex === index ? '−' : '+'}</span>
              </button>
              ${this.expandedFaqIndex === index ? html`
                <div class="faq-answer">
                  ${item.answer}
                </div>
              ` : ''}
            </div>
          `)}
        </div>
      </div>
    `;
  }

  renderComparison() {
    return html`
      <div class="content-wrapper comparison-mode">
        <h2>Comparativa de Técnicas</h2>
        <div class="comparison-table">
          ${COMPARISON_ITEMS.map(item => html`
            <div class="comparison-card">
              <h3>${item.technique}</h3>
              <div class="comparison-row">
                <span class="label">Intervalo:</span>
                <span class="value">${item.interval}</span>
              </div>
              <div class="comparison-row">
                <span class="label">Descanso:</span>
                <span class="value">${item.break}</span>
              </div>
              <div class="comparison-row">
                <span class="label">Ventajas:</span>
                <span class="value">${item.pros}</span>
              </div>
              <div class="comparison-row">
                <span class="label">Desventajas:</span>
                <span class="value">${item.cons}</span>
              </div>
            </div>
          `)}
        </div>
      </div>
    `;
  }

  renderNavigation() {
    const maxSteps = this.getMaxSteps();
    const showNav = this.mode === MODES.TUTORIAL && maxSteps > 1;

    return html`
      ${showNav ? html`
        <div class="navigation">
          <button
            @click=${() => this.previousStep()}
            ?disabled=${this.currentStep === 0}
            class="nav-btn"
          >
            ← Anterior
          </button>
          <div class="progress-dots">
            ${TUTORIAL_STEPS.map((_, index) => html`
              <span 
                class=${'dot ' + (index === this.currentStep ? 'active' : '')}
                @click=${() => { this.currentStep = index; }}
              ></span>
            `)}
          </div>
          <button
            @click=${() => this.nextStep()}
            ?disabled=${this.currentStep === maxSteps - 1}
            class="nav-btn"
          >
            Siguiente →
          </button>
        </div>
      ` : ''}
    `;
  }

  static styles = css`
    :host {
      display: block;
      --primary-color: #e74c3c;
      --secondary-color: #3498db;
      --text-color: #333;
      --bg-light: #f9f9f9;
      --border-color: #e0e0e0;
    }

    .guide-container {
      display: flex;
      flex-direction: column;
      gap: 2rem;
      padding: 2rem;
      background: white;
      border-radius: 0.5rem;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      max-width: 900px;
    }

    /* Mode Selector */
    .mode-selector {
      display: flex;
      gap: 1rem;
      justify-content: center;
      flex-wrap: wrap;
      padding-bottom: 1rem;
      border-bottom: 2px solid var(--border-color);
    }

    .mode-btn {
      padding: 0.75rem 1.5rem;
      font-weight: 600;
      font-size: 1rem;
      border-radius: 0.375rem;
      cursor: pointer;
      transition: all 0.2s ease;
      border: 2px solid var(--border-color);
      background: white;
      color: var(--text-color);
    }

    .mode-btn.primary {
      background-color: var(--primary-color);
      color: white;
      border-color: var(--primary-color);
    }

    .mode-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    }

    .nav-btn {
      padding: 0.75rem 1.5rem;
      font-weight: 600;
      font-size: 1rem;
      border-radius: 0.375rem;
      cursor: pointer;
      transition: all 0.2s ease;
      border: 2px solid var(--primary-color);
      background: var(--primary-color);
      color: white;
    }

    .nav-btn:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
    }

    .nav-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    /* Content Wrapper */
    .content-wrapper {
      min-height: 400px;
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
      animation: fadeIn 0.3s ease;
    }

    @keyframes fadeIn {
      from {
        opacity: 0;
        transform: translateY(10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    /* Tutorial Mode */
    .tutorial-mode .step-indicator {
      font-size: 0.9rem;
      color: #666;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .content-card {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      gap: 1.5rem;
      padding: 2rem;
      background: var(--bg-light);
      border-radius: 0.5rem;
    }

    .card-icon {
      font-size: 3rem;
      line-height: 1;
    }

    .content-card h2 {
      margin: 0;
      color: var(--text-color);
      font-size: 1.75rem;
    }

    .content-text {
      margin: 0;
      line-height: 1.8;
      color: #555;
      font-size: 1rem;
      white-space: pre-wrap;
      word-wrap: break-word;
    }

    /* FAQ Mode */
    .faq-mode h2 {
      text-align: center;
      margin: 0;
      color: var(--text-color);
    }

    .faq-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .faq-item {
      border: 1px solid var(--border-color);
      border-radius: 0.375rem;
      overflow: hidden;
    }

    .faq-question {
      width: 100%;
      padding: 1.25rem;
      background: white;
      border: none;
      text-align: left;
      font-size: 1rem;
      font-weight: 600;
      color: var(--text-color);
      cursor: pointer;
      display: flex;
      justify-content: space-between;
      align-items: center;
      transition: background-color 0.2s ease;
    }

    .faq-question:hover {
      background: var(--bg-light);
    }

    .faq-icon {
      font-size: 1.25rem;
      font-weight: bold;
      color: var(--primary-color);
    }

    .faq-answer {
      padding: 1.25rem;
      background: var(--bg-light);
      line-height: 1.6;
      color: #555;
      animation: slideDown 0.2s ease;
    }

    @keyframes slideDown {
      from {
        opacity: 0;
        max-height: 0;
      }
      to {
        opacity: 1;
        max-height: 500px;
      }
    }

    /* Comparison Mode */
    .comparison-mode h2 {
      text-align: center;
      margin: 0;
      color: var(--text-color);
    }

    .comparison-table {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1.5rem;
    }

    .comparison-card {
      padding: 1.5rem;
      background: var(--bg-light);
      border-radius: 0.5rem;
      border-left: 4px solid var(--primary-color);
    }

    .comparison-card h3 {
      margin: 0 0 1rem 0;
      color: var(--text-color);
      font-size: 1.25rem;
    }

    .comparison-row {
      display: grid;
      grid-template-columns: 100px 1fr;
      gap: 1rem;
      margin-bottom: 0.75rem;
      font-size: 0.95rem;
    }

    .comparison-row .label {
      font-weight: 600;
      color: var(--primary-color);
    }

    .comparison-row .value {
      color: #555;
    }

    /* Navigation */
    .navigation {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 1rem;
      padding-top: 1rem;
      border-top: 2px solid var(--border-color);
    }

    .progress-dots {
      display: flex;
      gap: 0.5rem;
      justify-content: center;
    }

    .dot {
      width: 12px;
      height: 12px;
      border-radius: 50%;
      background: var(--border-color);
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .dot.active {
      background: var(--primary-color);
      width: 32px;
      border-radius: 6px;
    }

    .dot:hover {
      background: #bbb;
    }

    /* Responsive */
    @media (max-width: 768px) {
      .guide-container {
        padding: 1rem;
        gap: 1.5rem;
      }

      .mode-selector {
        flex-direction: column;
      }

      .content-wrapper {
        min-height: auto;
      }

      .comparison-table {
        grid-template-columns: 1fr;
      }

      .comparison-row {
        grid-template-columns: 80px 1fr;
      }

      .navigation {
        flex-direction: column;
      }
    }
  `;
}

customElements.define('pom-pomodoro-guide', PomPomodoroGuide);
