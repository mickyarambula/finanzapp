# Finanzapp — Decisions Log

## Decisiones de arquitectura

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
