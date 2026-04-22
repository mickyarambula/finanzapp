# Finanzapp — Roadmap

## Pendientes inmediatos (próxima sesión)

### 1. Refactor de módulos — Tomar 2
- Hacer módulo por módulo, NO todos de golpe
- Verificar en navegador (npm run dev + abrir browser) antes de pasar al siguiente
- Orden sugerido: utils.js → shared.jsx → Mortgage → Recurring → Loans → Dashboard → resto
- Problema a evitar: dependencias circulares (módulos importando de App que importa módulos)
- Solución: shared.jsx debe ser independiente, no importar de App ni de modules

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
