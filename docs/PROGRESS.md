# Finanzapp — Progress

## Estado actual (22-abr-2026 — post Push 1 tuberías + Push 2 Metas)
- App funcionando en producción: finanzapp-iota.vercel.app
- App.jsx: ~14,485 líneas (commits cc22290 + 1d7c2af)
- shared.jsx: 274 líneas — ahora es el único archivo que habla con Supabase
  - UI: Card, Btn, Modal, Inp, Sel, Badge, Actions, ConfirmModal
  - Contexto/tema/íconos: Ctx, useCtx, themeTokens, useTheme, ICONS, Ic
  - Datos/infra: supa, store, uKey, useData, useConfirm, getTc
- utils.js: 14 líneas, 4 funciones puras (fmt, fmtDate, today, genId)
- **src/modules/** establecida como carpeta de módulos extraídos
  - `modules/Metas.jsx` — 561 líneas, cero props, primer módulo real
- Ícono nuevo: verde con gráfica ascendente ✓
- PWA configurada (manifest.json, apple-touch-icon) ✓

## Módulos implementados ✓
- [x] Dashboard con KPIs, alertas, patrimonio neto, gráfica 6 meses
- [x] Cuentas (checking, savings, credit, cash, USD)
- [x] Transacciones con categorías, tags, filtros, exportar Excel
- [x] Transferencias entre cuentas
- [x] Préstamos otorgados con tramos de tasa, pagos, corte mensual
- [x] Préstamos recibidos (Santa Rosa $2M)
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
| Banorte Cheques | checking | MXN | $25,000 |
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
- Santa Rosa: $2,000,000 @ 13.5% anual (~210 días al vencimiento)

### Inversiones activas
- RADA LA PAZ: $1.5M MXN @ 25% anual (desde 01-abr-2024)
- RADA LA PAZ 2: $400k MXN @ 25% anual (desde 01-mar-2025)
- ALTERNA MIAMI: $75,000 USD @ 20% anual (desde 09-mar-2026)
- AMAZON: 63 títulos × $3,851 MXN
- Cripto: XRP (BITSO/BINANCE), SHIB, ADA, DOGE, SOL

### Hipoteca
- Banorte: $1,500,000 @ 10.15% anual, 20 años
- Acreditada: 27-mar-2026 | diaCorte: 3

### Recurrentes activos (11)
Pop TV $350 | Telmex $499 | Limpieza Casa $700/semanal | Luz $800 | Agua $300 | 
Sueldo nominal $7,420/quincenal | Sueldo complemento $86,000/mes | 
Spotify $139 | Amazon $99 | Google $395 | Claude AI $1,790

### Patrimonio neto
~$7.68M MXN (snapshot 08-abr-2026)
21 snapshots registrados

## TC actual
$17.66 MXN/USD (automático via open.er-api.com)
