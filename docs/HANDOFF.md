# Finanzapp — Handoff

## Última sesión: 21-abr-2026 (noche) — Extracción utils.js ✅

### Qué se hizo
1. ✅ **utils.js creado** en `src/utils.js` con 4 funciones puras exportadas:
   - `fmt` (formato de dinero con Intl.NumberFormat)
   - `fmtDate` (formato de fecha en español con T12:00:00 para evitar desfase UTC)
   - `today` (fecha de hoy en formato YYYY-MM-DD)
   - `genId` (ID único basado en Date.now + Math.random)
2. ✅ **App.jsx actualizado** — eliminadas las 4 definiciones duplicadas, agregado `import { fmt, fmtDate, today, genId } from "./utils";` al inicio
3. ✅ **App.jsx bajó de 15,278 → 15,268 líneas** (-10 líneas netas)
4. ✅ **Fix lateral de ambiente** — instalado `@rollup/rollup-darwin-arm64` con `--no-save` para destrabar `npm run dev` en Apple Silicon (el `node_modules` tenía solo el binario de Intel). No afecta el repo.
5. ✅ **Verificado en local con Vite dev server** — compila sin errores, archivos servidos HTTP 200
6. ✅ **Commit `91404a1`** pusheado a producción
7. ✅ **Probado 10–15 min en finanzapp-iota.vercel.app** sin issues

### Lo que NO se tocó (a propósito)
- `calcLoanBal` y `calcNext` siguen duplicadas dentro de componentes con nombres distintos (`calcLoanBal`, `calcLoanBalance`, `calcLoanBalP`, `calcNext`, `calcNextRec`, `calcNextDate`, `calcNextFlot`). Consolidarlas es un cambio más delicado porque las copias pueden tener diferencias sutiles. **Pendiente como extracción separada futura a utils.js.**
- Las 3 redefiniciones locales de `fmt` (líneas 681, 724, 775) son formateadores compactos diferentes (`$100k`) intencionales, no tocar.

### Warnings preexistentes (deuda técnica menor, NO urgente)
- `Duplicate key "whiteSpace"` en HelpTip (~línea 340 App.jsx)
- `Duplicate key "transform"` en HelpTip (~línea 345 App.jsx)
- Aparecen en cada build de Vite. No rompen nada. Agendar arreglo.

### Problema conocido (no urgente)
Hay **3 proyectos duplicados en Vercel** conectados al mismo repo:
- `finanzapp` → finanzapp-iota.vercel.app (el que Miguel usa)
- `finanzapp-app` → finanzapp-app.vercel.app
- `finanzapp-app-app` → finanzapp-app-app.vercel.app

Los 3 apuntan a la misma Supabase. Decisión: dejarlos así por ahora.

### Estado de producción al cierre
- App funcionando en finanzapp-iota.vercel.app
- App.jsx: 15,268 líneas
- utils.js: 14 líneas útiles, 4 exports
- Primer paso del refactor completado ✅

## Próxima sesión — por dónde empezar

### Siguiente extracción: shared.jsx
- Componentes UI base: **Card, Btn, Modal, Inp, Sel** (y posiblemente hooks `useData`, `useCtx`, etc.)
- **Riesgo: bajo** — son componentes pequeños y reutilizables
- **Regla crítica:** `shared.jsx` NO debe importar de App ni de modules. Solo React + utils.js si hace falta. Esto evita las dependencias circulares que tumbaron el refactor del 10-abr.
- Mismo flujo que utils.js: crear archivo, importar en App.jsx, verificar con `npm run dev`, push, probar 10-15 min, confirmar antes de seguir.

### Después de shared.jsx (cola tentativa, orden de menor a mayor riesgo)
1. ~~utils.js~~ ✅ DONE (21-abr noche)
2. **shared.jsx** ← SIGUIENTE
3. Módulo pequeño (Mortgage o Metas) — riesgo medio
4. Consolidación de `calcLoanBal`/`calcNext` duplicadas en utils.js — riesgo medio
5. Módulo mediano (Recurring) — riesgo medio-alto
6. Módulos grandes (Dashboard, Transactions) — riesgo alto

### Red de seguridad vigente
- Tag estable: `v-estable-pre-refactor-abr21` (creado antes de utils.js)
- Para revertir a ese punto si algo sale mal:
```
git reset --hard v-estable-pre-refactor-abr21
git push --force
```
- Considerar crear nuevo tag `v-estable-post-utils` antes de empezar shared.jsx para acotar la red de seguridad al último estado bueno.

### Qué tiene que hacer Claude al arrancar la próxima sesión (en Claude Code)
1. Leer HANDOFF.md, ARCHITECTURE.md, DECISIONS.md, ROADMAP.md, WORKFLOW.md, PROGRESS.md
2. Confirmar en 3 líneas: dónde estamos, qué haremos hoy, algo que deba saber
3. Proponer crear tag `v-estable-post-utils` antes de empezar
4. Arrancar con `shared.jsx`

## Cómo arrancar la próxima sesión en Claude Code

```bash
cd ~/Desktop/finanzapp2
claude
```

Luego pegar el contenido de `claude-init.md` como primer mensaje.
