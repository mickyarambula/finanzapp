# Finanzapp — Progress

## Estado actual (05-may-2026 — Loans feature comisiones + Mortgage fixes)
- App funcionando en producción: finanzapp-iota.vercel.app
- **App.jsx: 11,659 líneas** (+4 vs cierre 22-abr por fix Dashboard alerta hipoteca)
- **shared.jsx: 306 líneas** (sin cambios) — único archivo que habla con Supabase
  - UI: Card, Btn, Modal, Inp, Sel, Badge, Actions, ConfirmModal, HelpTip, Alert
  - Contexto/tema/íconos: Ctx, useCtx, themeTokens, useTheme, ICONS, Ic
  - Datos/infra: supa, store, uKey, useData, useConfirm, getTc
- utils.js: 14 líneas, 4 funciones puras (fmt, fmtDate, today, genId)
- **Módulos en `src/modules/`** (3,626 líneas extraídas en total):
  - `Metas.jsx` — 561 líneas (commit `1d7c2af`)
  - `Mortgage.jsx` — **1,278 líneas** (+27 vs 22-abr por fixes del 05-may: tx en abono a capital, offset proxVencimiento, doble conteo seguros)
  - `Recurring.jsx` — 391 líneas (commit `7414dee`)
  - `Loans.jsx` — **1,396 líneas** (+183 vs 22-abr por feature de comisiones recurrentes en préstamos recibidos)
- Patrón validado 4 veces: cada módulo importa solo de `react`, `../utils`, `../shared`, recibe cero props desde App.jsx
- Ícono nuevo: verde con gráfica ascendente ✓
- PWA configurada (manifest.json, apple-touch-icon) ✓

## Cambios del día 05-may-2026

### Loans.jsx — feature comisiones recurrentes
- Schema received: `comisiones[]` con `{ tipo, porcentaje, frecuencia: una_vez|anual|mensual }`
- Helper `calcComisionesEnPeriodo` — devenga sobre saldo+días según frecuencia
- `calcState`/`getBreakdown` extendidos con `pendingComisiones`/`accruedCom`/`toComisiones`
- `savePay`: input "Del cual a comisiones", allocation comisiones → interés → capital, tx separada "Pago comisiones — {loan}"
- Form modal: bloque legacy reemplazado por repeater dinámico
- Detail KPIs: card "Comisiones acumuladas"
- LoanCard: "Interés + comisiones a pagar" con desglose
- Panel nuevo "💸 Total a pagar (préstamos recibidos)" full-width espejo del "Total cobrado histórico"
- KPI 30d incluye comisiones recurrentes proyectadas

### Mortgage.jsx — 3 fixes
1. **`guardarCapital`** ahora crea tx (`Hipoteca / Vivienda` / `Abono a capital — {nombre}`) cuando `registrarComoTx` está marcado (default true). Antes solo descontaba saldo.
2. **`proxVencimiento`** corregido con offset condicional: `diaInicio > diaCorte ? 2 : 1`. Antes hardcoded `+1` causaba alerta "vencido" prematura cuando el día de inicio era posterior al día de corte (caso Casa Portal: 27 > 3).
3. **Banner "Próximo pago"** y **Resumen "Cuota mensual"** unificados:
   - Banner: ya no suma `segurosTotal` doble vez sobre `cuotaSig.pago` (que ya los incluye)
   - Resumen: usa `cuotaTotal` (cap+int+seguros) en vez de `cuota` (PMT puro). Ahora refleja lo que sale de la cuenta.

### App.jsx — 1 fix
- Bloque "// 13. Hipoteca — alertas inteligentes" en Dashboard tenía su propia lógica `proxPago` con el mismo bug de offset hardcoded `+1`. Aplicado el mismo fix `diaInicio > diaCorte ? 2 : 1`.
- **No tocada** la rama `if (esPrimerPago && m.fechaAcreditacion)` — caso especial flagged como deuda técnica.

## Migraciones Supabase del 05-may-2026

1. **Loan Santa Rosa** (`mn9i23jzfw15ismwvbe`): añadido `comisiones[]`:
   - `{ tipo:"Apertura", porcentaje:0.5, frecuencia:"una_vez" }`
   - `{ tipo:"Administración", porcentaje:0.5, frecuencia:"una_vez" }`
   - `{ tipo:"FEGA", porcentaje:1.77, frecuencia:"anual" }`
   - Limpiados `comisionApertura` y `comisionFega` legacy
2. **2 tx erróneas borradas** (apertura $10k + FEGA $10k del 17-mar) — se habían asentado como pagadas cuando estaban pendientes.
3. **Tx faltante insertada** — abono a capital Casa Portal de Hierro $4,888.87 del 04-may, Banorte Cheques.

### ⚠️ Pendiente Supabase para próxima sesión
- **Tasa Santa Rosa: corregir `rate` de `"13.5"` → `"12.5"`** (12.5% es la tasa real negociada — NO 13%, NO 13.5%)

## Módulos implementados ✓
- [x] Dashboard con KPIs, alertas, patrimonio neto, gráfica 6 meses
- [x] Cuentas (checking, savings, credit, cash, USD)
- [x] Transacciones con categorías, tags, filtros, exportar Excel
- [x] Transferencias entre cuentas
- [x] Préstamos otorgados con tramos de tasa, pagos, corte mensual
- [x] Préstamos recibidos con **comisiones recurrentes** (Santa Rosa $2M)
- [x] Inversiones: fondos privados, acciones, cripto (vista agrupada)
- [x] Hipoteca Banorte con amortización y SimuladorLiquidación
- [x] Activos físicos (Casa Portal de Hierro)
- [x] Metas de ahorro
- [x] Recurrentes con variables, confirmación, pendientes todo el día
- [x] Documentos
- [x] Calendario financiero
- [x] Patrimonio neto con snapshots diarios
- [x] Presupuestos (global, por categoría) con editar/eliminar visible
- [x] Conciliación bancaria via Asistente IA
- [x] Importar CSV
- [x] Asistente IA con visión de documentos y multi-acción JSON
- [x] Asistente Flotante
- [x] Búsqueda global
- [x] Modo oscuro/claro
- [x] Score de salud financiera

## Datos reales de Miguel en Supabase

### Cuentas
| Cuenta | Tipo | Moneda | Saldo aprox |
|--------|------|--------|-------------|
| Santander Cheques | checking | MXN | $118,638 |
| Efectivo MXN | cash | MXN | $71,370 |
| Banorte Cheques | checking | MXN | ~$0 (tras pago hipoteca + abono capital del 04-may) |
| Cash USD | cash | USD | $3,044 |
| Amex Aeroméxico | credit | MXN | -$21,144 |
| Santander LikeU | credit | MXN | -$8,783 |

### Préstamos otorgados (~$3M)
- Carlos Castro (1): $666,666 @ 2%/mes (desde 06-abr-2026)
- Carlos Castro (2): $1,000,000 @ 3%/mes
- Mario Castro: $666,666 @ 2.5%/mes
- Rosa Sanchez: $666,666 @ 2.5%/mes
- Empresa (MacBook): $25,640 @ 0% — $2,000/mes reembolso

### Préstamos recibidos
- **Santa Rosa: $2,000,000 @ 12.5% anual real (registrado 13.5%, corregir próx. sesión)**
  - Vence 31-ago-2026
  - **Comisiones:** Apertura 0.5% una_vez + Administración 0.5% una_vez + FEGA 1.77% anual
  - Sin pagos aún

### Inversiones activas
- RADA LA PAZ: $1.5M MXN @ 25% anual (desde 01-abr-2024)
- RADA LA PAZ 2: $400k MXN @ 25% anual (desde 01-mar-2025)
- ALTERNA MIAMI: $75,000 USD @ 20% anual (desde 09-mar-2026)
- AMAZON: 63 títulos × $3,851 MXN
- Cripto: XRP (BITSO/BINANCE), SHIB, ADA, DOGE, SOL

### Hipoteca
- Banorte: $1,500,000 @ 10.15% anual, 20 años
- Acreditada: 27-mar-2026 | diaCorte: 3
- 1 mensualidad pagada (mes 1, $20,112.06 el 04-may)
- 1 abono a capital ($4,888.87 el 04-may)
- Próximo vencimiento: 03-jun-2026

### Recurrentes activos (11)
Pop TV $350 | Telmex $499 | Limpieza Casa $700/semanal | Luz $800 | Agua $300 | 
Sueldo nominal $7,420/quincenal | Sueldo complemento $86,000/mes | 
Spotify $139 | Amazon $99 | Google $395 | Claude AI $1,790

### Patrimonio neto
~$7.68M MXN (snapshot 08-abr-2026)
21 snapshots registrados

## TC actual
$17.66 MXN/USD (automático via open.er-api.com)
