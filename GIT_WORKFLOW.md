# 🔀 Git Workflow - Proyecto Pomodoro Timer

## ⚠️ Regla Principal
**NUNCA hacer push directo a `main`.** Todos los cambios de funcionalidad DEBEN ir a través de Pull Requests.

## Proceso Estándar para Cambios de Funcionalidad

### 1️⃣ Crear rama de feature
```bash
git checkout -b feat/descripcion-corta-cambio
```

**Convenciones de nombres:**
- `feat/reset-sessions` - Nueva funcionalidad
- `fix/timer-bug` - Corrección de bug
- `refactor/optimize-rendering` - Refactorización
- Siempre usar kebab-case en la descripción

### 2️⃣ Realizar cambios y commits
```bash
# Editar archivos según necesario
# Hacer cambios incrementales

git add .
git commit -m "descriptive message following convention"
```

**Convención de commits:**
- `feat:` - Nueva funcionalidad
- `fix:` - Corrección de bug
- `docs:` - Cambios en documentación
- `refactor:` - Cambios de código sin funcionalidad nueva
- `test:` - Cambios en tests
- `chore:` - Cambios en build, deps, etc.

Incluir Co-authored-by trailer:
```bash
git commit -m "feat: Add new feature

Description of changes

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>"
```

### 3️⃣ Push a rama de feature (NO a main)
```bash
git push -u origin feat/descripcion-corta-cambio
```

### 4️⃣ Crear Pull Request en GitHub

**Opción A: Línea de comandos con `gh`**
```bash
gh pr create \
  --title "feat: Brief description of changes" \
  --body "Detailed description of what this PR does and why"
```

**Opción B: Web GitHub**
Ir a: https://github.com/EscuelaIt/[repo]/pulls

### 5️⃣ Merge a main
- Solo después de que el PR sea revisado
- Los cambios se mergean automáticamente o manualmente
- Opcionalmente: Squash commits para historial más limpio

---

## 📋 Ejemplo Completo

```bash
# 1. Actualizar y crear rama
git checkout main
git pull origin main
git checkout -b feat/reset-sessions

# 2. Hacer cambios
# ... editar archivos ...
git add src/
git commit -m "feat: Add reset sessions endpoint

- Adds DELETE /pomodoro-sessions endpoint
- Includes confirmation dialog in UI
- Auto-reloads sessions after reset

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>"

# 3. Push a rama
git push -u origin feat/reset-sessions

# 4. Crear PR
gh pr create \
  --title "feat: Add reset sessions feature" \
  --body "Enables users to clear session history with confirmation"

# 5. Después de merge (remoto o local)
git checkout main
git pull origin main
```

---

## 🎯 Aplicable a Ambos Repositorios

- ✅ **pomodoro-api** (Backend NestJS)
- ✅ **pomodoro** (Frontend Lit)

---

## ✅ Este proceso asegura:

- ✨ **Historial limpio** de commits
- 👀 **Oportunidad de revisión** antes de merge
- 📍 **Trazabilidad de cambios** clara
- 🛡️ **Evita conflictos** y errores en producción
- 📚 **Documentación** de por qué se hicieron cambios
- 🔄 **Facilita colaboración** en equipo

---

## ❌ Nunca hacer esto:

```bash
# ❌ INCORRECTO - Push directo a main
git push origin main

# ❌ INCORRECTO - Commits sin descripción clara
git commit -m "cambios"

# ❌ INCORRECTO - Mezclar múltiples features en un branch
git checkout -b cambios-varios
```

---

## 📚 Referencias

- [GitHub Flow Guide](https://guides.github.com/introduction/flow/)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [GitHub CLI - PR Create](https://cli.github.com/manual/gh_pr_create)
