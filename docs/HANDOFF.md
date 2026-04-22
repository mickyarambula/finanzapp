# Finanzapp — Handoff

## Última sesión: 21-abr-2026 (noche, segunda tanda) — Extracción shared.jsx ✅

### Qué se hizo
1. ✅ **Tag de seguridad creado y pusheado** — `v-estable-post-utils` apuntando al commit `7bd3a55` (estado bueno post-utils.js, antes de tocar shared.jsx)
2. ✅ **shared.jsx creado** en `src/shared.jsx` con 11 elementos exportados:
   - **Componentes UI:** `Card`, `Btn`, `Modal`, `Inp`, `Sel`
   - **Infraestructura de tema/contexto/íconos:** `Ctx`, `useCtx`, `themeTokens`, `useTheme`, `ICONS`, `Ic`
   - 171 líneas en total. Único import externo: `React` (con `createContext`, `useContext`, `useState`)
   - **Cumple regla crítica:** NO importa de App.jsx ni de modules/. La flecha de dependencias va siempre en una sola dirección (App ← shared)
3. ✅ **App.jsx actualizado:**
   - Eliminadas las 11 definiciones movidas
   - Agregado `import { Ctx, useCtx, themeTokens, useTheme, ICONS, Ic, Card, Btn, Modal, Inp, Sel } from "./shared";`
   - Limpiados `createContext` y `useContext` del import de React (ya no se usan en App.jsx)
4. ✅ **App.jsx bajó de 15,268 → 15,112 líneas** (-156 líneas netas)
5. ✅ **Verificado en local con Vite dev server** — compila sin errores nuevos, archivos servidos HTTP 200 (App.jsx 4.2 MB, shared.jsx 51 KB)
6. ✅ **Commit `b9674c6`** pusheado a producción
7. ✅ **Probado 10–15 min en finanzapp-iota.vercel.app** sin issues

### Lo que se descubrió durante la sesión (ojo, importante)
- Los 5 componentes pedidos (`Card`, `Btn`, `Modal`, `Inp`, `Sel`) **no eran autosuficientes** — todos dependían de `useTheme()` (que depende de `useCtx` y `Ctx`) y dos de ellos de `<Ic />` (que depende de `ICONS`)
- Pasar `theme` e `Ic` como prop a cientos de llamadas era inviable
- **Decisión tomada:** mover también las "tuberías" (themeTokens, useTheme, Ctx, useCtx, ICONS, Ic) a shared.jsx. Es más cambio del prometido pero es la única forma limpia de mantener la regla "no importar de App.jsx"
- Esto NO crea dependencia circular: la flecha siempre va App ← shared

### Lo que NO se tocó (a propósito)
- `calcLoanBal` y `calcNext` siguen duplicadas. Pendiente como extracción separada futura a utils.js.
- Las 3 redefiniciones locales de `fmt` (líneas ~681, 724, 775 originales) son formateadores compactos diferentes (`$100k`) intencionales, no tocar.
- `useData`, `useCtx` (este último ya está en shared), `getTc`, `useTcAuto` y otros hooks de datos siguen en App.jsx — se decidirá en próxima ronda si extraer a `hooks.js` separado.

### Warnings preexistentes (deuda técnica menor, NO urgente)
- `Duplicate key "whiteSpace"` en HelpTip (~línea 195 App.jsx actual)
- `Duplicate key "transform"` en HelpTip (~línea 198 App.jsx actual)
- Aparecen en cada build de Vite. NO los introdujo este refactor (ya estaban antes). Agendar arreglo.

### Problema conocido (no urgente)
Hay **3 proyectos duplicados en Vercel** conectados al mismo repo:
- `finanzapp` → finanzapp-iota.vercel.app (el que Miguel usa)
- `finanzapp-app` → finanzapp-app.vercel.app
- `finanzapp-app-app` → finanzapp-app-app.vercel.app

Los 3 apuntan a la misma Supabase. Decisión: dejarlos así por ahora.

### Estado de producción al cierre
- App funcionando en finanzapp-iota.vercel.app
- App.jsx: 15,112 líneas
- shared.jsx: 171 líneas, 11 exports
- utils.js: 14 líneas útiles, 4 exports
- Segundo paso del refactor completado ✅

## Próxima sesión — por dónde empezar

### Siguiente extracción candidata: módulo pequeño
Toca elegir entre:
- **Mortgage (Hipoteca Banorte)** — incluye `SimuladorLiquidación`, amortización. Riesgo medio.
- **Metas de ahorro** — más chico y autocontenido. Riesgo medio-bajo.

Sugerencia: empezar por **Metas** (más simple) para validar el patrón antes de meter Mortgage.

### Regla crítica (vigente para TODOS los módulos)
> **Los módulos NO deben importar de App.jsx.**
> Solo pueden importar de `./shared`, `./utils`, librerías de npm, y otros módulos hermanos (con cuidado de no crear ciclos).
> Si un módulo necesita algo de App.jsx (estado del usuario, navegación, toast, etc.), se le pasa como **prop** o vía el `Ctx` que ya está en shared.

Esta regla es lo que evita el problema del 10-abr-2026 (dependencias circulares → pantalla blanca en producción).

### Cola tentativa (orden de menor a mayor riesgo)
1. ~~utils.js~~ ✅ DONE (21-abr noche, primera tanda)
2. ~~shared.jsx~~ ✅ DONE (21-abr noche, segunda tanda)
3. **Metas** o **Mortgage** ← SIGUIENTE
4. Consolidación de `calcLoanBal`/`calcNext` duplicadas en utils.js — riesgo medio
5. Recurring — riesgo medio-alto
6. Loans — riesgo medio-alto
7. Dashboard, Transactions — riesgo alto (los más grandes)

### Red de seguridad vigente
- Tag estable más reciente: `v-estable-post-utils` (creado antes de shared.jsx, ya en GitHub)
- Para revertir a ese punto si algo sale mal en futuro:
```
git reset --hard v-estable-post-utils
git push --force
```
- **Recomendación:** crear nuevo tag `v-estable-post-shared` antes de empezar el siguiente módulo, para acotar la red de seguridad al último estado bueno (commit `b9674c6`).

### Qué tiene que hacer Claude al arrancar la próxima sesión
1. Leer HANDOFF.md, ARCHITECTURE.md, DECISIONS.md, ROADMAP.md, WORKFLOW.md, PROGRESS.md
2. Confirmar en 3 líneas: dónde estamos, qué haremos hoy, algo que deba saber
3. Proponer crear tag `v-estable-post-shared` antes de empezar
4. Decidir Metas o Mortgage (sugerencia: Metas primero)
5. Recordar la regla crítica: los módulos solo importan de shared.jsx, utils.js o librerías

## Cómo arrancar la próxima sesión en Claude Code

```bash
cd ~/Desktop/finanzapp2
claude
```

Luego pegar el contenido de `claude-init.md` como primer mensaje.
