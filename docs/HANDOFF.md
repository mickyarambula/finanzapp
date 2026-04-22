# Finanzapp — Handoff

## Última sesión: 22-abr-2026 — Tuberías + Primer Módulo Real (Metas) ✅

### Qué se hizo — 2 pushes separados, cada uno probado 10-15 min en producción

#### Push 1 — Tuberías a shared.jsx (commit `cc22290`)
Movidas a `shared.jsx` (antes en App.jsx):
- **Datos:** `useData`, `supa`, `store`, `uKey`
- **Interacción:** `useConfirm`, `ConfirmModal`
- **UI:** `Badge`, `Actions`
- **Helper:** `getTc`

`shared.jsx`: 171 → 274 líneas. Ahora es el **único archivo que habla con Supabase** (setup del cliente, env vars, createClient).
`App.jsx`: 15,112 → 15,031 líneas (-81). Limpiado `createClient` del import de supabase-js.
Probado en producción sin issues: login/logout, confirmaciones, modo oscuro/claro, useData en todas las páginas, badges y acciones de editar/eliminar.

**Tag de seguridad creado:** `v-estable-push1-tuberias` apuntando a `cc22290`. Este es el punto intermedio entre los 2 pushes — si el Push 2 hubiera explotado, revertíamos aquí.

#### Push 2 — Primer módulo real: Metas (commit `1d7c2af`)
- **Nueva carpeta** `src/modules/` establecida
- **Nuevo archivo** `src/modules/Metas.jsx` — 561 líneas
- Componente `Goals` renombrado a `Metas` con `export default Metas;`
- **Imports limpios:** solo `react`, `../utils`, `../shared` — cumple la regla
- **Cero props** recibidos desde App.jsx — módulo 100% autosuficiente
- `App.jsx`: 15,031 → 14,485 líneas (-546). Eliminada definición completa de `Goals` (547 líneas), agregado `import Metas from "./modules/Metas";`, cambiado `<Goals/>` → `<Metas/>`

### Totales de la sesión
- **App.jsx: 15,112 → 14,485 líneas (-627 en total)**
- **shared.jsx: 171 → 274 líneas (+103)**
- **Metas.jsx: 561 líneas (nuevo)**
- Probado 10-15 min en producción después de cada push, sin issues

### Patrón confirmado para futuros módulos ✅
> Los módulos en `src/modules/*.jsx` importan **solo** de `react`, `../utils`, `../shared`.
> Reciben **cero props**. Son 100% autosuficientes.
> La flecha de dependencias va siempre: App.jsx → modules/Metas.jsx → shared.jsx → (react, @supabase/supabase-js).
> Nunca en sentido inverso, nunca circular.

Esto validó el enfoque: la regla "shared.jsx es autosuficiente y módulos solo importan de shared/utils" funciona. Dado que `useData`, `useConfirm`, `getTc` y toda la infraestructura viven en shared.jsx, cada nuevo módulo queda trivial de extraer.

### Warnings preexistentes (deuda técnica menor, NO urgente)
- `Duplicate key "whiteSpace"` en HelpTip (~línea 173 App.jsx actual)
- `Duplicate key "transform"` en HelpTip (~línea 176 App.jsx actual)
- Aparecen en cada build de Vite. NO las introdujo ningún refactor. Agendar arreglo.

### Problema conocido (no urgente)
Hay **3 proyectos duplicados en Vercel** conectados al mismo repo:
- `finanzapp` → finanzapp-iota.vercel.app (el que Miguel usa)
- `finanzapp-app` → finanzapp-app.vercel.app
- `finanzapp-app-app` → finanzapp-app-app.vercel.app

Los 3 apuntan a la misma Supabase. Decisión: dejarlos así por ahora.

### Estado de producción al cierre
- App funcionando en finanzapp-iota.vercel.app
- App.jsx: 14,485 líneas
- shared.jsx: 274 líneas (único que habla con Supabase)
- utils.js: 14 líneas útiles, 4 exports
- modules/Metas.jsx: 561 líneas (primer módulo real)

## Próxima sesión — por dónde empezar

### Siguiente módulo candidato

Dos opciones, ambas viables. Claude en la próxima sesión decide al arrancar:

- **Mortgage (Hipoteca Banorte)** — incluye `SimuladorLiquidación` (ya estabilizado en abril, sin IIFE/useState issues). Riesgo medio. Bueno porque es un módulo cerrado con poca interacción con otros.
- **Recurring (Transacciones recurrentes)** — más lógica (variables, confirmación, pendientes). Riesgo medio-alto. Es el módulo adyacente al que ya sigue en App.jsx después de donde estaba Metas, así que es natural.

Sugerencia para próxima sesión: **Mortgage** primero — es más cerrado y con lógica más pura. Recurring después cuando el patrón esté más rodado.

### Regla crítica (vigente para TODOS los módulos) — NO NEGOCIABLE
> **Los módulos NO importan de App.jsx ni de otros módulos.**
> Solo de `react`, `../utils`, `../shared`.
> Si un módulo necesita algo de App.jsx (estado del usuario, toast, navegación), **viene vía `useCtx()` del contexto**, no como prop.
> Si necesita una función nueva compartida, se agrega a `shared.jsx`.

Esta regla es lo que evita el problema del 10-abr-2026 (dependencias circulares → pantalla blanca en producción). Ya está VALIDADA con Metas.

### Cola tentativa (orden actualizado)
1. ~~utils.js~~ ✅ DONE (21-abr 1ra tanda)
2. ~~shared.jsx (primera oleada)~~ ✅ DONE (21-abr 2da tanda)
3. ~~shared.jsx (tuberías)~~ ✅ DONE (22-abr Push 1)
4. ~~Metas~~ ✅ DONE (22-abr Push 2)
5. **Mortgage** o **Recurring** ← SIGUIENTE
6. El otro de los dos (Mortgage/Recurring)
7. Loans (riesgo medio-alto)
8. Investments (riesgo medio-alto)
9. Consolidación de `calcLoanBal`/`calcNext` duplicadas en utils.js
10. Dashboard, Transactions (riesgo alto — los más grandes)

### Red de seguridad vigente (todos pusheados a GitHub)
- `v-estable-post-shared` — estado post-primera-oleada de shared.jsx, PRE-Push-1 del 22-abr
- `v-estable-push1-tuberias` — estado post-Push-1 del 22-abr, PRE-Push-2
- El próximo tag a crear: `v-estable-post-metas` apuntando a `1d7c2af` (el commit actual), antes de empezar Mortgage/Recurring

Para revertir al último estado bueno si algo explota en el futuro:
```
git reset --hard v-estable-push1-tuberias   # para volver antes del Push 2 (Metas)
```
o
```
git reset --hard v-estable-post-shared      # para volver antes del Push 1 (tuberías)
```

### Qué tiene que hacer Claude al arrancar la próxima sesión
1. Leer HANDOFF.md, ARCHITECTURE.md, DECISIONS.md, ROADMAP.md, WORKFLOW.md, PROGRESS.md
2. Confirmar en 3 líneas: dónde estamos, qué haremos hoy, algo que deba saber
3. Proponer crear tag `v-estable-post-metas` apuntando a `1d7c2af` antes de empezar
4. Decidir Mortgage o Recurring (sugerencia: Mortgage primero)
5. Analizar el componente objetivo y armar plan con la lista de props (que debería ser CERO, pero confirmar)
6. Dividir en 2 pushes si hace falta mover infraestructura a shared.jsx primero

## Cómo arrancar la próxima sesión en Claude Code

```bash
cd ~/Desktop/finanzapp2
```

```bash
claude
```

Luego pegar el contenido de `claude-init.md` como primer mensaje.
