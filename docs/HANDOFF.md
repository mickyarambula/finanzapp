# Finanzapp — Handoff

## Última sesión: 21-abr-2026

### Qué se hizo
1. ✅ **Fix iCloud confirmar** — Validación de saldo excluye tarjetas de crédito en confirmarConMonto (línea 10677 App.jsx)
2. ✅ **Fix Dashboard crash** — Agregado `setRecurrents` al destructuring en línea 2155 para que el botón Confirmar del Dashboard no crashee
3. ✅ **Git reconectado** en el proyecto `finanzapp` (el que sirve finanzapp-iota.vercel.app) — estaba desconectado desde el 10-abr y por eso los deployments no disparaban
4. ✅ **Tag de seguridad creado:** `v-estable-pre-refactor-abr21` — punto de retorno garantizado
5. ✅ **Docs actualizados** con reglas nuevas de workflow (formato estructurado, señales de cierre de chat, regla de refactor uno-a-la-vez)

### Problema descubierto (no urgente)
Hay **3 proyectos duplicados en Vercel** conectados al mismo repo:
- `finanzapp` → finanzapp-iota.vercel.app (el que Miguel usa)
- `finanzapp-app` → finanzapp-app.vercel.app
- `finanzapp-app-app` → finanzapp-app-app.vercel.app

Los 3 apuntan a la misma Supabase, por eso muestran los mismos datos. Decisión: dejarlos así por ahora, limpiar en sesión futura cuando haya tiempo.

### Warnings del build (deuda técnica menor, NO urgente)
- `Duplicate key "whiteSpace"` en HelpTip (~línea 340 App.jsx)
- `Duplicate key "transform"` en HelpTip (~línea 345 App.jsx)
- Ninguno rompe la app, solo son propiedades CSS duplicadas. Agendar arreglo.

### Commits subidos hoy
- `d7bd168` — fix: no validar saldo en tarjetas de crédito al confirmar recurrente
- `c6e475b` — chore: trigger redeploy después de reconectar git (vacío)
- `faada31` — chore: trigger redeploy en finanzapp (vacío)
- `<pendiente>` — fix: setRecurrents accesible en Dashboard (archivo entregado, deployment pendiente)

### Estado de producción al cierre
- App funcionando en finanzapp-iota.vercel.app
- App.jsx: 15,279 líneas (monolítico)
- Ambos fixes de hoy aplicados en archivo local. Falta que Miguel haga el push final del fix Dashboard.

## Próxima sesión — por dónde empezar

### DECISIÓN TOMADA: Reintentar el refactor
- Se va a trabajar en **Claude Code** (terminal), NO en claude.ai web
- Regla: **UNO A LA VEZ**. Extraer un archivo, probar, verificar en producción, 10–15 min de uso real, luego el siguiente
- Si algo falla 2 veces seguidas con el mismo enfoque, cambiar estrategia
- Si falla 3 veces total, parada técnica

### Secuencia planeada (de menor a mayor riesgo)
1. **utils.js** — funciones puras (fmt, fmtDate, today, genId, calcLoanBal, calcNext). Riesgo: muy bajo
2. **shared.jsx** — componentes UI base (Card, Btn, Modal, Inp, Sel). Riesgo: bajo
3. **Un módulo pequeño** — Mortgage o Metas. Riesgo: medio
4. **Un módulo mediano** — Recurring. Riesgo: medio-alto
5. **Módulos grandes** — Dashboard, Transactions. Riesgo: alto (al final con experiencia acumulada)

### Red de seguridad
- Tag de seguridad: `v-estable-pre-refactor-abr21`
- Comando para revertir si algo explota:
```
git reset --hard v-estable-pre-refactor-abr21
git push --force
```

### Qué tiene que hacer Claude al arrancar la próxima sesión (en Claude Code)
1. Leer HANDOFF.md, ARCHITECTURE.md, DECISIONS.md, ROADMAP.md, WORKFLOW.md, PROGRESS.md
2. Confirmar en 3 líneas: dónde estamos, qué haremos hoy, algo que deba saber
3. Verificar que el fix pendiente (setRecurrents Dashboard) ya está en producción — si no, deployar primero
4. Arrancar con `utils.js`

## Cómo arrancar la próxima sesión en Claude Code

```bash
cd ~/Desktop/finanzapp2
claude
```

Luego pegar el contenido de `claude-init.md` como primer mensaje.
