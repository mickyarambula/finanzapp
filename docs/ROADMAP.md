# Finanzapp — Roadmap

## Pendientes inmediatos (próxima sesión)

### 1. Refactor de módulos — Tomar 2 (en curso ✅)
**Patrón validado:** módulo en `src/modules/*.jsx` importa solo de `react`, `../utils`, `../shared`, recibe cero props.

Hecho hasta ahora:
- ~~utils.js~~ ✅ (21-abr)
- ~~shared.jsx primera oleada (Card/Btn/Modal/Inp/Sel + Ctx/tema/íconos)~~ ✅ (21-abr)
- ~~shared.jsx tuberías (useData/useConfirm/supa/store/getTc/Badge/Actions)~~ ✅ (22-abr Push 1)
- ~~Metas~~ ✅ (22-abr `1d7c2af`)
- ~~Mortgage + HelpTip~~ ✅ (22-abr `abf98ff`)
- ~~Recurring~~ ✅ (22-abr `7414dee`)
- ~~Loans + Alert~~ ✅ (22-abr `0513864`)

**Sigue (en orden recomendado):**
- **Investments** — análisis ya completo, ver HANDOFF.md para plan ejecutivo. Riesgo medio-alto (1,313 líneas + PortafolioChart 126 líneas). Cero tuberías nuevas. Cero props.
- **Dashboard** — riesgo ALTO. Es el componente más interconectado: KPIs, alertas, gráfica 6 meses, panel de pendientes recurrentes (con su duplicado de calcNext), panel de loans. Análisis exhaustivo nuevo recomendado antes.
- **Transactions** — riesgo ALTO. Filtros, exportar Excel, categorías, tags. Probable que tenga sub-componentes propios.

### 1.b Deuda técnica de duplicación (consolidar a utils.js — futura pasada)
- `calcLoanBal` duplicada 5 veces con nombres distintos
- `calcNext` duplicada 4 veces con nombres distintos
- `ProyeccionFlujo` definido pero nunca usado — eliminar
- Warnings `Duplicate key whiteSpace/transform` en HelpTip (shared.jsx)

### 2. Configuración Vercel — Production Overrides
- Hay un warning: "Configuration Settings in the current Production deployment differ from current Project Settings"
- Revisar qué dice en Production Overrides antes de próximo refactor
- URL afectada: finanzapp-app-iqzsps537-mickyarambulas-projects.vercel.app

### 3. Reporte mensual PDF
- Revertido por crash (React.useState en contexto incorrecto)
- Reimplementar como componente simple sin cálculos complejos en el render
- Usar HTML → window.open → Ctrl+P para PDF (no librería externa)

### 4. Tracker de tipo de cambio
- Revertido por crash (división por cero en SVG cuando hist.length=1)
- Fix: guard `hist.length >= 2` antes de renderizar la gráfica
- Guardar historial en config.historialTC (array de {fecha, tc})

## Pendientes mediano plazo

### 5. Presupuestos por categoría
- Solo configuración — crear en la app:
  - Alimentación: ~$15,000/mes
  - Transporte: ~$8,000/mes  
  - Entretenimiento: ~$3,000/mes

### 6. Importar historial bancario
- Conciliación de marzo pendiente
- Subir estado de cuenta al Asistente para importar

### 7. Snapshot de patrimonio automático
- Hoy es manual
- Disparar automáticamente al abrir la app si no hay snapshot del día

### 8. Precios cripto en tiempo real
- Conectar CoinGecko API para actualizar precios automáticamente
- Similar a como funciona el TC con open.er-api.com

### 9. Fechas de vencimiento en préstamos
- Carlos Castro, Mario Castro y Rosa Sanchez no tienen fecha límite
- Agregar y que dispare alertas con anticipación

### 10. Cierre mensual automático
- Al cambiar de mes, generar resumen: ingresos, gastos, flujo, patrimonio vs mes anterior

## Deuda técnica
- App.jsx monolítico (~15k líneas) — refactor pendiente (ver #1)
- calcLoanBal duplicada múltiples veces — consolidar en utils.js
- Sin pruebas automáticas
- App.backup.jsx en el repo — eliminar

## Ideas futuras (no prioritarias)
- Conexión Open Banking (requiere registro ante CNBV)
- App móvil nativa
- Multi-usuario / modo producto
- Exportar reportes a Excel/PDF automático mensual
