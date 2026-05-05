# Finanzapp — Decisions Log

## Decisiones de arquitectura

### 2026-05-05: Comisiones recurrentes en préstamos recibidos
- **Qué:** En `Loans.jsx`, los préstamos `type==="received"` ahora soportan un array `comisiones[]` con entradas `{ tipo, porcentaje, frecuencia: "una_vez" | "anual" | "mensual" }`. El cálculo de devengado, el desglose de pagos y el modal de pago se extendieron para tratar comisiones como un tercer bucket separado de capital e interés.
- **Por qué se hizo:** El crédito Santa Rosa real cobra Apertura, Administración (ambas one-shot al inicio) y FEGA (1.77% anual recurrente sobre el saldo). El modelo previo (3 inputs fijos `comisionApertura`/`comisionFega`/`otrosGastos` que se asentaban como tx pagada al crear el préstamo) era incorrecto: una_vez no significa "ya pagada", significa "se devenga al inicio pero queda pendiente hasta el primer pago". Y FEGA recurrente no se modelaba en absoluto.
- **Decisiones de diseño clave:**
  1. **`comisiones[]` reemplaza el modelo legacy** dentro del form (repeater dinámico). Los campos legacy quedaron en el schema solo para no romper datos preexistentes; ya no se escriben.
  2. **Allocation order al pagar:** comisiones → interés → capital. El usuario puede sobrescribir cuánto va a comisiones via input "Del cual a comisiones" en el modal de pago.
  3. **`una_vez` se devenga 100% sobre el principal en el primer período** (entre `startDate` y el primer pago, o hasta hoy si no hay pagos). Si se paga parcialmente, el remanente queda en `pendingComisiones`.
  4. **`anual`/`mensual` se devengan sobre el `balance` actual** del período (no sobre el principal), análogo a cómo se devenga interés.
  5. **Solo aplica a `type==="received"`**. Los préstamos otorgados (`given`) no tienen comisiones (no las cobramos).
- **UI nueva:** panel "💸 Total a pagar (préstamos recibidos)" full-width espejo del existente "Total cobrado histórico" para préstamos otorgados. Histórico pagado, pendiente al día, estimado 30d, desglose clickeable por préstamo.
- **Migración Supabase ejecutada:** Santa Rosa ganó `comisiones[]` con [Apertura 0.5% una_vez, Administración 0.5% una_vez, FEGA 1.77% anual]. Se borraron 2 tx erróneas que se habían asentado como pagadas al crear el préstamo (apertura $10k + FEGA $10k del 17-mar) cuando en realidad estaban pendientes.

### 2026-05-05: Offset al primer corte de hipoteca según día_inicio vs día_corte
- **Qué:** `proxVencimiento` (Mortgage.jsx) y la lógica equivalente del Dashboard (App.jsx bloque "// 13. Hipoteca") ahora calculan el offset al primer corte según `diaInicio > diaCorte ? 2 : 1` meses.
- **Por qué:** El modelo previo asumía offset=1 mes siempre desde `fechaInicio` al primer corte. Para Casa Portal de Hierro (firmado 27-mar, día de corte 3), esto daba primer corte 03-abr — solo 7 días después de la firma, irrealizable contra el calendario hipotecario real. Resultado: alertas "vencido" prematuras y avance roto del próximo vencimiento.
- **Regla:** si firmaste un día > el día de corte, el primer corte cae dos meses después (en el día de corte). Si firmaste antes o en el día de corte, cae un mes después. Cada pago realizado avanza un mes adicional.
- **Doble fix necesario:** Dashboard tiene su propia copia de la lógica (más sofisticada con `fechaAcreditacion`), por lo que el fix se aplicó en ambos archivos. La rama `if (esPrimerPago && m.fechaAcreditacion)` quedó intacta — caso especial flagged como deuda técnica para revisar otro día.

### 2026-05-05: Cuota mensual hipoteca = capital + interés + seguros (no solo PMT puro)
- **Qué:** El banner "Próximo pago" y la card "Cuota mensual" del tab Resumen ahora muestran `cuotaTotal` (cap + int + segVida_proporcional + segDanos + admin) en vez de `cuotaBase` (PMT puro sin seguros).
- **Por qué:** El número que el usuario quiere ver es **lo que sale de su cuenta cada mes**, no la fórmula matemática del préstamo. La PMT pura ($14,624.71 para Casa Portal) era engañosa porque omitía $1,749.59 en seguros y admin. Y el banner tenía un bug peor: sumaba seguros DOS VECES (el `cuotaSig.pago` ya los incluye, y le sumaba `segurosTotal` otra vez encima → $18,119.80 vs el real $16,374).
- **Para cerrar gap con el dato canónico del banco:** llenar el campo `cuotaReal` del crédito con el monto exacto que cobra Banorte ($16,509.59 para Casa Portal). Cuando `cuotaReal > 0`, los 3 lugares (banner, tabla, resumen) ya tienen lógica para usarlo y mostrar el dato del banco en vez del calculado.

### 2026-04-22: Sprint de 4 módulos consecutivos — VALIDADO ✅
- **Qué:** En una sola sesión se extrajeron Metas, Mortgage, Recurring y Loans a `src/modules/*.jsx`. Cada uno con tag de seguridad propio y validación 10-15 min en producción antes del siguiente.
- **Patrón confirmado 4 veces sin excepciones:** módulo importa solo de `react`, `../utils`, `../shared`, recibe **CERO props** desde App.jsx, datos vienen vía `useData()` y `useCtx()`.
- **App.jsx** bajó de 14,485 → 11,655 líneas (−2,830 en el día).
- **Tuberías incidentales movidas a shared.jsx durante el sprint:** `HelpTip` (con Mortgage), `Alert` (con Loans). shared.jsx pasó de 274 → 306 líneas.
- **Hallazgo arquitectónico clave:** Múltiples componentes pueden leer/escribir el mismo módulo de Supabase via `useData()` independientemente sin acoplamiento por props. Cada uno tiene su `[state, setState]` local, sincronizado vía la fuente de verdad (Supabase) + cache localStorage. Esto permite que Dashboard/Recurring/AsistenteFlotante todos confirmen recurrentes sin que la extracción de uno rompa al otro.
- **Deuda técnica detectada (no consolidada en este sprint):**
  - `calcLoanBal` duplicada 5 veces en App.jsx con nombres distintos
  - `calcNext` duplicada 4 veces en App.jsx con nombres distintos
  - `ProyeccionFlujo` definido en App.jsx pero nunca usado (código muerto)
  - 2 warnings `Duplicate key whiteSpace/transform` en HelpTip (preexistentes)
- **Por qué importa:** valida que el patrón establecido el 21-abr (utils.js + shared.jsx) escala. Quedan 2 módulos grandes pendientes (Investments, Dashboard, Transactions) — el camino está claro.

### 2026-04-10: Refactor de módulos — REVERTIDO
- **Qué:** Extraer App.jsx monolítico en 18+ módulos en src/modules/
- **Por qué se revirtió:** Dependencias circulares causaron pantalla blanca en producción (Vercel). Localmente funcionaba pero en producción fallaba.
- **Estado:** Los commits existen en Git (3de9f08..59c7b1b) pero se hizo force reset a 3de9f08
- **Próxima vez:** Hacer módulo por módulo verificando en el navegador antes de continuar. No todos de golpe.
- **Problema adicional:** Vercel en plan Hobby no tiene "Purge Cache" — para forzar redeploy hay que hacer un commit dummy.

### 2026-04-10: utils.js creado
- **Qué:** Funciones duplicadas (calcLoanBal x5, calcNext x4, fmt, fmtDate, today, genId) extraídas a src/utils.js
- **Estado:** REVERTIDO junto con el refactor — pero la idea es correcta para próxima iteración

### 2026-04-09: SimuladorLiquidación como componente React
- **Qué:** Extraído de IIFE a componente propio
- **Por qué:** React.useState dentro de IIFE causa crash

### 2026-03-xx: Single file architecture
- **Decisión:** Todo en App.jsx para simplicidad inicial
- **Consecuencia:** Llegó a 15,277 líneas, crashes frecuentes al agregar features

## Decisiones de producto

### Inversiones — vista agrupada por tipo
- Fondos privados → cards grandes
- Acciones → card con títulos × precio
- Cripto → tabla compacta (no cards individuales)
- Liquidadas → colapsadas por defecto

### Recurrentes variables
- Checkbox `esVariable` en el formulario
- Al confirmar, pide el monto real del período
- `ultimoRegistro` se guarda en Supabase (no localStorage)

### MacBook Air — reembolso empresa
- Registrado como préstamo otorgado a "Empresa" al 0%
- Capital: $25,640 | Reembolso: $2,000/mes × 12 = $24,000
- Diferencial de $1,640 es costo neto de Miguel
- La transacción de compra ($25,640) se mantiene como gasto real

### Patrimonio neto — fórmula unificada
```
Patrimonio = Liquidez + Inversiones(sin liquidadas) + PorCobrar + ActivosFísicos
           - PréstamosRecibidos - Hipotecas - TarjetasCredito
```

### Alertas
- Sin errores críticos → panel colapsado por defecto
- Con errores críticos → panel abierto automáticamente
- Botón "Ocultar avisos hoy" → dismiss por día via localStorage

### Conciliación bancaria
- Via Asistente IA — sube PDF del estado de cuenta
- Genera CONCILIACION_JSON con transacciones extraídas
- Panel de revisión con checkbox por transacción
- Matching automático contra transacciones existentes

## Lo que NO hacemos
- No usar React.useState dentro de IIFE o callbacks
- No poner historialTC en config (revertido — causaba crashes)
- No hacer ReporteMensual PDF desde el cliente (causa crashes — pendiente reimplementar)
- No usar localStorage para persistir recurrentes (usar setRecurrents de useData)
