# Finanzapp — Handoff

## Última sesión: 22-abr-2026 — Sprint de 4 módulos consecutivos ✅

Sesión larga (varias horas). 4 módulos extraídos seguidos validando el patrón "cero props, módulo solo importa de react/utils/shared". Cada uno probado 10-15 min en producción antes del siguiente. Cero issues en los 4 deploys.

### Lo que se hizo

#### Módulo 1: Metas (commit `1d7c2af`)
- **Antes:** App.jsx 14,485 líneas (estado heredado del 21-abr noche)
- Creado `src/modules/Metas.jsx` (561 líneas) — primer módulo real, primer uso de `src/modules/`
- Componente `Goals` renombrado a `Metas`, `export default Metas;`
- Cero tuberías nuevas a shared.jsx (todo lo necesario ya estaba)
- App.jsx: 14,485 → 13,232 líneas (-1,253 contando los 2 push del shared.jsx que precedieron)
- Tag de seguridad: `v-estable-post-metas` apuntando a `1d7c2af`

#### Módulo 2: Mortgage (commit `abf98ff`)
- Creado `src/modules/Mortgage.jsx` (1,251 líneas) — incluye `SimuladorLiquidacion` como sub-componente (usado solo aquí)
- **Tubería nueva a shared.jsx:** `HelpTip` movido (usado por 4 lugares en App.jsx, no solo por Mortgage)
- App.jsx: 13,232 → 11,980 líneas neto (-1,252 después de mover HelpTip y extraer Mortgage)
- shared.jsx: 274 → 299 líneas (+25)
- Tag de seguridad: `v-estable-post-mortgage` apuntando a `abf98ff`

#### Módulo 3: Recurring (commit `7414dee`)
- Creado `src/modules/Recurring.jsx` (391 líneas) — el más limpio del día, ningún sub-componente, cero tuberías nuevas
- App.jsx: 11,980 → 12,856 líneas (correcto: shrink de -376 desde el push previo)
- Hallazgo importante documentado: **3 componentes (Dashboard, Recurring, AsistenteFlotante) leen `useData("recurrents")` y confirman recurrentes independientemente** — esto es duplicación de lógica (calcNext está en 4 archivos con nombres distintos), no acoplamiento por props. Deuda técnica documentada para consolidar a futuro.
- Tag de seguridad: `v-estable-post-recurring` apuntando a `7414dee`

#### Módulo 4: Loans (commit `0513864`)
- Creado `src/modules/Loans.jsx` (1,213 líneas) — incluye 4 sub-componentes externos: `AmortizacionChart`, `CorteGlobalPanel`, `TramosPanel`, `CorteMensual`. Más `LoanCard` inline.
- **Tubería nueva a shared.jsx:** `Alert` movido (5 líneas, usado por 6+ lugares además de Loans)
- App.jsx: 12,856 → 11,655 líneas (-1,201)
- shared.jsx: 299 → 306 líneas (+7)
- Hallazgo: **`ProyeccionFlujo` está definido en App.jsx pero nunca usado** — código muerto, agendar limpieza
- Hallazgo: **`calcLoanBal` duplicada 5 veces** en App.jsx con nombres distintos (igual que calcNext de Recurring) — deuda técnica documentada
- Tag de seguridad: `v-estable-post-loans` apuntando a `0513864`

### Patrón validado 4 veces seguidas — sin excepciones
Todos los módulos siguen el mismo molde:
- Importan SOLO de `react`, `../utils`, `../shared`
- Reciben **CERO props** desde App.jsx
- `export default <Nombre>;` al final
- Usan `useCtx()` para `{ user, toast }` y `useData()` para sus datos en Supabase
- La flecha de dependencias va siempre App.jsx → modules/*.jsx → shared.jsx → librerías
- Ningún módulo sabe de la existencia de los otros módulos

### Estado de producción al cierre
- App funcionando en finanzapp-iota.vercel.app sin issues
- **App.jsx: 11,655 líneas** (de 15,278 iniciales el 21-abr — bajamos casi un 24%)
- **shared.jsx: 306 líneas** (Card/Btn/Modal/Inp/Sel/Ctx/useTheme/themeTokens/ICONS/Ic/Badge/Actions/HelpTip/Alert/ConfirmModal/useConfirm/supa/store/uKey/getTc/useData)
- **utils.js: 14 líneas** (fmt/fmtDate/today/genId)
- **5 módulos en `src/modules/`** (3,416 líneas extraídas en total):
  - Metas.jsx — 561 líneas
  - Mortgage.jsx — 1,251 líneas
  - Recurring.jsx — 391 líneas
  - Loans.jsx — 1,213 líneas
  - (Investments.jsx pendiente — análisis ya hecho, ver más abajo)

### Warnings preexistentes (deuda técnica menor, NO urgente)
- `Duplicate key "whiteSpace"` en HelpTip (ahora vive en shared.jsx ~línea 220)
- `Duplicate key "transform"` en HelpTip
- Aparecen en cada build. NO las introdujo ningún refactor.

---

## Próxima sesión — empezar con Investments (análisis ya completo)

**No repitas el trabajo de análisis. El plan está listo.** Solo falta ejecutarlo o ajustarlo si Miguel quiere.

### Análisis Investments (hecho el 22-abr al cierre del día) — **GUARDAR este bloque, no reanalizar**

#### Boundaries en App.jsx (al cierre del 22-abr)
- `Investments`: línea **4165-5477** (1,313 líneas — el componente más grande del refactor)
- Section comment: línea 4164 `// ─── INVERSIONES ─`
- Render: línea 11573 `case "investments": return <Investments/>`

#### Sub-componentes
**Inner (definidos DENTRO de Investments, viajan automático):**
- `SeccionHeader` (línea 5045) — header colapsable de cada categoría, usado 4 veces
- `CardGrande` (línea 5067) — tarjeta grande para fondos/acciones/otras, usada 3 veces
- `TablaCripto` (línea 5120) — tabla compacta para cripto, usada 1 vez

**External (hay que mover con Investments):**
- `PortafolioChart` (línea 509-634, 126 líneas) — donut del portafolio. Usado SOLO en Investments (1 vez en línea 4942). Pure component (solo recibe props `investments` y `tc`).

**Total external moves: 1.**

#### Datos en Supabase (3 useData)
- `investments` (lectura + escritura via `setInvestments`)
- `accounts` (lectura + escritura — afecta saldos al aportar/liquidar)
- `transactions` (lectura + escritura — crea transacción al aportar/liquidar)

#### Estado interno
`view`, `selected`, `editing`, `openInv`, `openLiq`, `openAport`, `openCobro`, `detTab`, `invForm`, `aportForm`, `cobroForm`. Form helpers cortos: `ic`, `ac`, `cc`.

#### Funciones puras notables (se quedan dentro)
`calcInv(inv)`, `calcProyeccion(inv)`, `recalcFromMXN/USD/Tokens`, `updatePrecio` (este último usa `fetch` a CoinGecko API).

#### Dependencias EXTERNAS — TODAS YA EN SHARED/UTILS

| Cosa | Ubicación | Estado |
|---|---|---|
| `useState`, `useCtx`, `useData`, `useConfirm` | shared/react | ✓ |
| `fmt`, `fmtDate`, `today`, `genId` | utils | ✓ |
| `Card`, `Btn`, `Modal`, `Inp`, `Sel`, `Ic`, `Badge`, `Actions`, `HelpTip` | shared | ✓ |
| `getTc` (3 usos) | shared | ✓ |
| `Alert` | NO usado en Investments | — |
| `fetch` a CoinGecko | API browser nativa | sin import |
| **NADA NUEVO a mover a shared.jsx** | — | **0 tuberías nuevas** |

#### Cross-module loans data
**8 componentes en App.jsx llaman `useData("investments")`** (Dashboard, Patrimonio, Reportes, Settings, AsistenteFlotante, etc. + Investments). Cada uno con su propio `[investments, setInvestments]` independiente. Patrón idéntico a Recurring/Loans: solo Supabase como fuente de verdad, **CERO acoplamiento por props**.

#### 5 reglas de parada — NINGUNA gatillada
1. ✅ NO 3+ sub-componentes externos: solo 1 (PortafolioChart)
2. ✅ NO tuberías nuevas: 0
3. ✅ NO acoplamiento Dashboard
4. ✅ NO sub-componentes en >1 lugar: PortafolioChart con 1 usage
5. ✅ NO vista agrupada externa: SeccionHeader/CardGrande/TablaCripto todos DENTRO de Investments

#### Plan ejecutivo (un solo push)
1. **Crear `src/modules/Investments.jsx`** (~1,455 líneas) en este orden:
   - header (13 líneas — comentario + imports de react, ../utils, ../shared)
   - `PortafolioChart` (126 líneas)
   - `Investments` (1,313 líneas con SeccionHeader, CardGrande, TablaCripto inline)
   - `export default Investments;`
   - Imports: `react` con `useState`; `../utils` con `fmt, fmtDate, today, genId`; `../shared` con `useCtx, useData, useConfirm, getTc, Card, Btn, Modal, Inp, Sel, Ic, Badge, Actions, HelpTip`
2. **Editar App.jsx** — 2 deletions de mayor a menor número de línea:
   - Quitar `Investments` (líneas 4164-5477, incluyendo section comment)
   - Quitar `PortafolioChart` (líneas 508-634, incluyendo section comment `// Dona portafolio inversiones`)
   - Pointer comment `// Investments (con PortafolioChart) → movido a ./modules/Investments.jsx`
   - Agregar `import Investments from "./modules/Investments";` al top
3. **Editar shared.jsx**: SIN CAMBIOS

#### Líneas esperadas tras el push
- App.jsx: 11,655 → ~10,217 líneas (-1,438)
- shared.jsx: 306 (sin cambios)
- modules/Investments.jsx: ~1,455 líneas (nuevo)

#### Antes del push (mismo flujo riguroso)
1. Crear archivo, hacer las 2 deletions, actualizar imports
2. `npm run dev`, verificar HTTP 200 en todos los módulos
3. Pasar URL local a Miguel para verificar pantalla de login en navegador
4. Si OK → 3 comandos de git uno por uno (add específico + commit + push)

#### Riesgos específicos de Investments
1. Tamaño: 1,455 líneas — el archivo más grande del refactor
2. CoinGecko fetch directo desde el componente (sin proxy) — funciona pero es dependencia externa
3. 3 monedas con conversiones (MXN/USD/tokens) — más superficie de error
4. PortafolioChart usa Math.sin/cos para SVG — sensible a shadowing de imports
5. **Verificar post-deploy:** Página Inversiones, donut, las 5 categorías colapsables (RADA LA PAZ x2, ALTERNA MIAMI, AMAZON, Cripto), editar precio cripto via "Actualizar precio", crear/aportar/liquidar inversión

#### Si algo explota
```
git reset --hard v-estable-post-loans
git push --force
```

---

## Cola actualizada (módulos pendientes)

1. ~~utils.js~~ ✅ DONE (21-abr)
2. ~~shared.jsx primera oleada~~ ✅ DONE (21-abr)
3. ~~shared.jsx tuberías~~ ✅ DONE (22-abr Push 1)
4. ~~Metas~~ ✅ DONE (22-abr `1d7c2af`)
5. ~~Mortgage + HelpTip~~ ✅ DONE (22-abr `abf98ff`)
6. ~~Recurring~~ ✅ DONE (22-abr `7414dee`)
7. ~~Loans + Alert~~ ✅ DONE (22-abr `0513864`)
8. **Investments + PortafolioChart** ← SIGUIENTE (análisis listo, ver arriba)
9. **Dashboard** — riesgo ALTO. El más grande probable, tiene KPIs, alertas, gráfica 6 meses, panel de pendientes recurrentes (con su duplicado de calcNext), panel de loans, etc. Va a tocar muchas cosas. Análisis profundo recomendado antes.
10. **Transactions** — riesgo ALTO. Filtros, exportar Excel, categorías, tags. Probable que tenga sub-componentes propios.
11. (Deuda técnica para limpieza) Consolidar `calcLoanBal` (5 copias) y `calcNext` (4 copias) a utils.js
12. (Deuda técnica) Quitar `ProyeccionFlujo` (código muerto)
13. (Deuda técnica) Arreglar warnings `Duplicate key whiteSpace/transform` en HelpTip (shared.jsx)

---

## Red de seguridad vigente (todos pusheados a GitHub)

| Tag | Commit | Cuándo revertir |
|---|---|---|
| `v-estable-post-loans` | `0513864` | Si algo se rompe DESPUÉS de extraer Investments |
| `v-estable-post-recurring` | `7414dee` | Si Loans causara issues retrasados |
| `v-estable-post-mortgage` | `abf98ff` | Si Recurring causara issues retrasados |
| `v-estable-post-metas` | `1d7c2af` | Si Mortgage causara issues retrasados |
| `v-estable-post-shared` | `a470a1a` | Punto pre-22-abr |
| `v-estable-post-utils` | `7bd3a55` | Punto post-utils.js, pre-shared.jsx |
| `v-estable-pre-refactor-abr21` | `91404a1` (pre) | Estado ORIGINAL antes de cualquier refactor |

Para revertir al último estado bueno antes de Investments:
```
git reset --hard v-estable-post-loans
git push --force
```

---

## Qué tiene que hacer Claude al arrancar la próxima sesión

1. Leer HANDOFF.md (este archivo), ARCHITECTURE.md, DECISIONS.md, ROADMAP.md, WORKFLOW.md, PROGRESS.md
2. Confirmar en 3 líneas: dónde estamos, qué haremos hoy, algo que deba saber
3. Proponer crear tag `v-estable-post-investments` apuntando al commit que resulte del Push (cuando se haya hecho), antes del siguiente módulo
4. Para Investments: **NO RE-ANALIZAR** — el análisis completo está en este HANDOFF arriba. Confirmar con Miguel si los line numbers siguen vigentes (corren `grep -n "^const Investments" src/App.jsx` y `grep -n "^const PortafolioChart" src/App.jsx`) y proceder al ejecutar el plan ya armado.
5. Después de Investments, agendar Dashboard o Transactions con análisis exhaustivo nuevo (esos sí son territorio nuevo).

## Cómo arrancar la próxima sesión en Claude Code

```bash
cd ~/Desktop/finanzapp2
```

```bash
claude
```

Luego pegar el contenido de `claude-init.md` como primer mensaje.
