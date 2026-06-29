# Proyecto Pomodoro Timer

Este es un proyecto para crear un temporizador Pomodoro que está subdividido en dos proyectos frontend y backend.

- Frontend: carpeta "pomodoro".
- Backend: carpeta "pomodoro-api".

## 🔀 Git Workflow y Pull Requests

### ⚠️ Regla Importante
**NUNCA hacer push directo a `main`.** Todos los cambios de funcionalidad DEBEN ir a través de Pull Requests.

### Proceso Estándar para Cambios de Funcionalidad

1. **Crear rama de feature**
   ```bash
   git checkout -b feat/descripcion-corta-cambio
   ```
   - Nombres de rama: `feat/reset-sessions`, `feat/add-timer-validation`, etc.
   - Usar prefijos: `feat/`, `fix/`, `refactor/`, etc.
   - Descripción en kebab-case

2. **Realizar cambios y commits**
   ```bash
   git add .
   git commit -m "descriptive message"
   # Opcionalmente, más commits si la funcionalidad es compleja
   ```

3. **Push a rama de feature (NO a main)**
   ```bash
   git push -u origin feat/descripcion-corta-cambio
   ```

4. **Crear Pull Request en GitHub**
   ```bash
   gh pr create --title "descripción breve" --body "descripción detallada si es necesario"
   ```
   O a través de la web: https://github.com/EscuelaIt/[repo]/pulls

5. **Merge a main**
   - Solo después de que el PR sea revisado
   - Usar: Squash and merge, Rebase and merge, o Create a merge commit (depende del equipo)

### Ejemplo Completo

```bash
# 1. Crear rama
git checkout -b feat/reset-sessions

# 2. Hacer cambios y commits
# ... editar archivos ...
git add src/
git commit -m "feat: Add reset sessions endpoint"

# 3. Push a rama (no a main)
git push -u origin feat/reset-sessions

# 4. Crear PR
gh pr create --title "Add reset sessions feature" \
  --body "Adds DELETE endpoint and reset button with confirmation"

# 5. Merge después de revisión (en GitHub o local)
```

### Aplicable a Ambos Repositorios
- ✅ pomodoro-api (backend)
- ✅ pomodoro (frontend)

Este proceso asegura:
- Historial limpio de commits
- Oportunidad de revisión antes de merge
- Trazabilidad de cambios
- Evita conflictos y errores en producción