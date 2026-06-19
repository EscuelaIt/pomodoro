# Proyecto Pomodoro Timer

Este es un proyecto para crear un temporizador Pomodoro utilizando Vite y Web Components con Lit.

Todos los custom elements tienen que estar creados con la librería Lit.

Todos los componentes de la aplicación deben tener el prefijo `pom-` y deben estar en el directorio `src/components` y en la medida de lo necesario organizados en subdirectorios.

## Estándares de Código

- **Siempre usamos Javascript nativo para los componentes Lit**: No usamos sintaxis typescript para Lit.
- **No usar números mágicos**: Todos los valores constantes deben ser definidos como constantes con nombres descriptivos al inicio del archivo. Esto incluye duraciones, intervalos, números de reintentos, tamaños, etc. Los nombres deben ser claros y en mayúsculas (ej: `POMODORO_DURATION_MINUTES`, `TIMER_INTERVAL_MS`, `SECONDS_PER_MINUTE`).

## Catálogo de componentes

Cuando uses botones quiero que uses el componente <dile-button> que funciona como un botón nativo del HTML. Solo lo tienes que importar así: `import '@dile/ui/components/button/button.js';`
