# Finanzapp — Handoff

## Última sesión: 05-may-2026 — Loans comisiones + Mortgage fixes

Sesión de feature + bugfixes. 1 feature en Loans (comisiones recurrentes en préstamos recibidos + panel "Total a pagar"). 4 bugfixes en Mortgage (2 archivos: Mortgage.jsx + App.jsx Dashboard). 3 migraciones de datos en Supabase. Todo pusheado y validado. Cero issues en deploy.

### Lo que se hizo

#### Feature: comisiones recurrentes en préstamos recibidos (commit `9aa28f7`)
- Préstamos `type==="received"` ganaron campo `comisiones[]` con `{ tipo, porcentaje, frecuencia: "una_vez" | "anual" | "mensual" }`
- `calcComisionesEnPeriodo` nuevo: una_vez devenga 100% sobre principal en el primer período; anual/mensual proporcional al saldo
- `calcState` extendido con `pendingComisiones`; `totalOwed = capital + interés + comisiones`
- `getBreakdown` añade `accruedCom` y `toComisiones`; allocation order: comisiones → interés → capital
- `savePay` valida `pf.toComisiones`, persiste y emite tx separada "Pago comisiones — {loan}"
- Form modal: bloque legacy (3 inputs fijos: apertura/FEGA/otros) reemplazado por **repeater dinámico** (botón "+ Añadir comisión" con tipo + porcentaje + frecuencia)
- Pay modal received: muestra "Comisiones pendientes" + nuevo input "Del cual a comisiones" prellenado con devengado
- Detail KPIs: card "Comisiones acumuladas"
- LoanCard: "Interés + comisiones a pagar" con desglose interno
- **Panel nuevo "💸 Total a pagar"** full-width espejo del existente "Total cobrado histórico": pagado histórico, en comisiones/intereses/capital, pendiente al día, estimado 30d, desglose clickeable por préstamo
- KPI 30d incluye comisiones recurrentes proyectadas
- Loans.jsx: 1,213 → **1,396 líneas** (+183)

#### Fix: abono a capital en hipoteca genera tx automática (commit `5707cd5`)
- **Bug:** al registrar "Pago a capital", Mortgage descontaba saldo de cuenta pero NO creaba tx en Transacciones (la mensualidad sí lo hacía)
- **Fix en `guardarCapital`:** añadido bloque que crea tx `expense` con descripción `Abono a capital — {nombre hipoteca}`, categoría `Hipoteca / Vivienda`, vinculada via `origen:"hipoteca"`/`origenId`
- `capForm` gana `registrarComoTx` (default true) con checkbox morado en modal
- Resets en los 2 botones que abren el modal actualizados

#### Fix: proxVencimiento offset diaInicio > diaCorte (commits `5707cd5` + `72eb23d`)
- **Bug:** alerta "Pago vencido 03 may 2026" persistía aunque la mensualidad ya estaba registrada. Lógica original `inicio + (pagados+1) meses, día=diaCorte` asume offset=1 al primer corte siempre
- Caso real Casa Portal: `fechaInicio=2026-03-27`, `diaCorte=3`. Con `pagados=0` daba 03-abr (solo 7 días post-firma — imposible). Con `pagados=1` daba 03-may, hoy → "vencido"
- **Fix:** offset al primer corte = `diaInicio > diaCorte ? 2 : 1`. Casa Portal con `pagados=1` → próximo 03-jun-2026 ✅
- Aplicado en **`Mortgage.jsx` `proxVencimiento`** Y en **`App.jsx` Dashboard alertas hipoteca** (bloque "// 13. Hipoteca — alertas inteligentes"). Ambos lugares calculaban `proxPago` independientemente
- **No tocada** la rama `if (esPrimerPago && m.fechaAcreditacion)` en App.jsx — caso distinto (cuenta desde acreditación, no firma); flagged para revisar otro día si Banorte acredita un día > diaCorte

#### Fix: doble conteo seguros + cuota mensual unificada (commit `6f46a95`)
- **Bug detectado:** 3 números distintos para "lo que pagas al banco":
  - Banner "Próximo pago": $18,119.80 (sumaba seguros 2 veces — `cuotaSig.pago + segurosTotal` cuando `cuotaSig.pago` ya incluía seguros)
  - Tabla amortización mes 2: $16,370.21 (correcto: cap+int+segVida_proporcional+segDanos+admin)
  - Resumen "Cuota mensual": $14,624.71 (PMT puro, sin seguros)
- **Fix banner:** `cuotaMostrar = cuotaTotal > 0 ? cuotaTotal : cuotaDisplay` (eliminado `+segurosTotal`)
- **Fix Resumen:** usar `cuotaTotal` (de calcAmort, ya con seguros) en vez de `cuota` (PMT puro). Ahora ~$16,374 que refleja lo que realmente sale de la cuenta
- Real Banorte: $16,509.59. Gap restante (~$139) por diferencias en cómo Banorte calibra segVida sobre saldo del mes; cerrar gap llenando `m.cuotaReal` con el dato canónico

### Migraciones Supabase ejecutadas

1. **Loan Santa Rosa** (`mn9i23jzfw15ismwvbe`): añadido `comisiones[]` con 3 entradas:
   - `{ tipo:"Apertura", porcentaje:0.5, frecuencia:"una_vez" }`
   - `{ tipo:"Administración", porcentaje:0.5, frecuencia:"una_vez" }`
   - `{ tipo:"FEGA", porcentaje:1.77, frecuencia:"anual" }`
   - Limpiados `comisionApertura` y `comisionFega` legacy
2. **2 tx erróneas borradas** (apertura $10k + FEGA $10k del 17-mar-2026 que se habían asentado como "ya pagadas" cuando en realidad estaban pendientes)
3. **Tx faltante insertada**: abono a capital de Casa Portal de Hierro, $4,888.87, 04-may-2026, Banorte Cheques (el handler buggy nunca la había creado)

### Lo que NO se aplicó (autorización explícita denegada)
- **Saldo de Banorte Cheques NO ajustado** (+$20k que correspondería a la reversión de las 2 tx erróneas). Miguel confirmó dejarlo como está. El saldo actual ≈ $0 ya está correcto desde su lado.

### ⚠️ Pendiente para próxima sesión: corregir tasa Santa Rosa
- **Tasa real negociada: 12.5% anual** (NO 13%, NO 13.5% — así se negoció)
- Actualmente registrado en Supabase como `rate: "13.5"`
- Próxima sesión: corregir el campo `rate` del loan `mn9i23jzfw15ismwvbe` a `"12.5"` antes de cualquier otro trabajo

### Estado de producción al cierre
- App funcionando en finanzapp-iota.vercel.app sin issues
- **App.jsx: 11,659 líneas** (+4 por fix Dashboard hipoteca offset)
- **shared.jsx: 306 líneas** (sin cambios)
- **utils.js: 14 líneas** (sin cambios)
- **Módulos en `src/modules/`:**
  - Metas.jsx — 561 líneas
  - Mortgage.jsx — **1,278 líneas** (+27 por 4 fixes del día)
  - Recurring.jsx — 391 líneas
  - Loans.jsx — **1,396 líneas** (+183 por feature de comisiones)
  - (Investments.jsx pendiente — análisis ya hecho del 22-abr, ver más abajo)

### Tags creados hoy (todos pusheados)
| Tag | Apunta a | Cuándo se creó |
|---|---|---|
| `v-estable-pre-comisiones-recurrentes` | `b5e1562` | Antes de empezar Loans feature |
| `v-estable-post-comisiones-recurrentes` | `9aa28f7` | Tras pushear Loans feature |
| `v-estable-pre-mortgage-fixes` | `9aa28f7` | Antes de Mortgage tx + offset |
| `v-estable-post-mortgage-fixes` | `5707cd5` | Tras pushear Mortgage tx + offset |
| `v-estable-pre-cuota-display-fix` | `5707cd5` | Antes del fix de doble conteo |
| `v-estable-post-cuota-display-fix` | `6f46a95` | Tras pushear fix doble conteo |
| `v-estable-pre-dashboard-mortgage-alert-fix` | `6f46a95` | Antes del fix Dashboard hipoteca |
| `v-estable-post-dashboard-mortgage-alert-fix` | `72eb23d` | Tras pushear fix Dashboard hipoteca |

---

## Sesión anterior: 22-abr-2026 — Sprint de 4 módulos (resumen)

Extracción consecutiva de Metas, Mortgage, Recurring, Loans con tag de seguridad por módulo. Patrón "cero props, módulo solo importa de react/utils/shared" validado 4 veces sin excepción. App.jsx pasó de 14,485 → 11,655 líneas (-2,830 en el día). Detalle completo en commits `1d7c2af` (Metas), `abf98ff` (Mortgage), `7414dee` (Recurring), `0513864` (Loans).

---

## Próxima sesión — empezar con Investments (análisis ya completo)

**No repitas el trabajo de análisis. El plan está listo.** Solo falta ejecutarlo o ajustarlo si Miguel quiere. Pero **antes de Investments, primero corregir tasa Santa Rosa a 12.5%** (1 línea de Supabase).

### Análisis Investments (hecho el 22-abr al cierre del día) — **GUARDAR este bloque, no reanalizar**

#### Boundaries en App.jsx (al cierre del 22-abr — verificar con grep antes de extraer)
- `Investments`: línea **4165-5477** (1,313 líneas — el componente más grande del refactor)
- Section comment: línea 4164 `// ─── INVERSIONES ─`
- Render: línea 11573 `case "investments": return <Investments/>`

> **Nota 05-may:** App.jsx creció +4 líneas hoy (fix Dashboard hipoteca). Confirmar números actualizados con `grep -n "^const Investments" src/App.jsx` antes de empezar.

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

#### Cross-module data
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
- App.jsx: 11,659 → ~10,221 líneas (-1,438)
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
git reset --hard v-estable-post-dashboard-mortgage-alert-fix
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
8. **Corregir tasa Santa Rosa** (1 línea Supabase: `rate` → `"12.5"`) ← ANTES DE Investments
9. **Investments + PortafolioChart** ← SIGUIENTE refactor (análisis listo, ver arriba)
10. **Dashboard** — riesgo ALTO. KPIs, alertas, gráfica 6 meses, panel pendientes recurrentes, panel loans, etc. Análisis profundo nuevo recomendado.
11. **Transactions** — riesgo ALTO. Filtros, exportar Excel, categorías, tags. Probable que tenga sub-componentes propios.
12. (Deuda técnica para limpieza) Consolidar `calcLoanBal` (5 copias) y `calcNext` (4 copias) a utils.js
13. (Deuda técnica) Quitar `ProyeccionFlujo` (código muerto)
14. (Deuda técnica) Arreglar warnings `Duplicate key whiteSpace/transform` en HelpTip (shared.jsx)
15. (Deuda técnica) Revisar rama `if (esPrimerPago && m.fechaAcreditacion)` en App.jsx — su `+2` hardcoded podría tener mismo bug de offset si Banorte acredita un día > diaCorte

---

## Red de seguridad vigente (todos pusheados a GitHub)

| Tag | Commit | Cuándo revertir |
|---|---|---|
| `v-estable-post-dashboard-mortgage-alert-fix` | `72eb23d` | **Punto estable más reciente — usar este si algo explota tras Investments** |
| `v-estable-post-cuota-display-fix` | `6f46a95` | Si fix Dashboard alert causara issues retrasados |
| `v-estable-post-mortgage-fixes` | `5707cd5` | Si fix doble conteo seguros causara issues |
| `v-estable-post-comisiones-recurrentes` | `9aa28f7` | Si fixes Mortgage causaran issues retrasados |
| `v-estable-post-loans` | `0513864` | Estado pre-comisiones (refactor base 22-abr) |
| `v-estable-post-recurring` | `7414dee` | Pre-Loans extraction |
| `v-estable-post-mortgage` | `abf98ff` | Pre-Recurring extraction |
| `v-estable-post-metas` | `1d7c2af` | Pre-Mortgage extraction |
| `v-estable-post-shared` | `b9674c6` | Punto pre-22-abr |
| `v-estable-post-utils` | `91404a1` | Post-utils.js, pre-shared.jsx |
| `v-estable-pre-refactor-abr21` | (pre) | Estado ORIGINAL antes de cualquier refactor |

Para revertir al último estado bueno antes de Investments:
```
git reset --hard v-estable-post-dashboard-mortgage-alert-fix
git push --force
```

---

## Qué tiene que hacer Claude al arrancar la próxima sesión

1. Leer HANDOFF.md (este archivo), ARCHITECTURE.md, DECISIONS.md, ROADMAP.md, WORKFLOW.md, PROGRESS.md
2. Confirmar en 3 líneas: dónde estamos, qué haremos hoy, algo que deba saber
3. **Primero: corregir tasa Santa Rosa a 12.5%** en Supabase (1 UPDATE) — quick win, antes de cualquier refactor
4. Proponer crear tag `v-estable-post-investments` apuntando al commit que resulte del Push (cuando se haya hecho), antes del siguiente módulo
5. Para Investments: **NO RE-ANALIZAR** — el análisis completo está en este HANDOFF arriba. Confirmar con Miguel si los line numbers siguen vigentes (correr `grep -n "^const Investments" src/App.jsx` y `grep -n "^const PortafolioChart" src/App.jsx`) y proceder al ejecutar el plan ya armado.
6. Después de Investments, agendar Dashboard o Transactions con análisis exhaustivo nuevo (esos sí son territorio nuevo).

## Cómo arrancar la próxima sesión en Claude Code

```bash
cd ~/Desktop/finanzapp2
```

```bash
claude
```

Luego pegar el contenido de `claude-init.md` como primer mensaje.
