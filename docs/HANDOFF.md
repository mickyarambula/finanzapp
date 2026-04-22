# Finanzapp — Handoff

## Última sesión: 10-abr-2026

### Qué se hizo
1. ✅ Inversiones — vista agrupada por tipo (fondos/acciones/cripto/liquidadas)
2. ✅ Tabla cripto con monedas mixtas MXN/USD separadas correctamente
3. ✅ Recurrentes — fix esPendiente visible todo el día (comparar vs fin del día)
4. ✅ confirmarRecurrente Dashboard persiste en Supabase (no localStorage)
5. ✅ Presupuesto duplicado eliminado en Supabase ($50k → conservado $75k)
6. ✅ Alertas colapsadas por defecto, botón "Ocultar avisos hoy"
7. ✅ Presupuestos — botones editar/eliminar más visibles
8. ✅ Logo Finanzapp creado (verde esmeralda con gráfica ascendente)
9. ✅ Ícono PWA instalado (apple-touch-icon, favicon, manifest.json)
10. ✅ Limpieza Casa confirmada en Supabase (ultimoRegistro: 2026-04-09)
11. ✅ Préstamo "Empresa — Reembolso MacBook Air M4" creado ($25,640 @ 0%)
12. ⚠️ Refactor módulos — REVERTIDO (dependencias circulares en producción)

### Estado de Supabase al cierre
- Recurrentes: 11 activos, todos con fechaInicio válida, esVariable normalizado
- Presupuestos: 1 activo ($75,000 global mensual)
- Loans: 6 préstamos (5 otorgados + 1 recibido)
- Limpieza Casa ultimoRegistro: 2026-04-09

### Commit actual en producción
`3de9f08` — fix: botones editar/eliminar en presupuesto global

## Próxima sesión — por dónde empezar

### Prioridad 1: Verificar que todo funciona
- Abrir finanzapp-iota.vercel.app
- Verificar módulos: Dashboard, Inversiones, Préstamos, Recurrentes, Hipoteca

### Prioridad 2: Revisar Vercel Production Overrides
- Hay un warning de configuración diferente entre producción y proyecto
- Entrar a vercel.com → finanzapp-app → Settings → Build and Deployment
- Expandir "Production Overrides" y documentar qué dice

### Prioridad 3: Decidir si reintentamos el refactor
- Si sí: hacerlo módulo por módulo con verificación en navegador
- Si no: trabajar en features nuevas con el archivo monolítico

### Features pendientes más solicitadas
1. Reporte mensual PDF (reimplementar sin crash)
2. Tracker de tipo de cambio (fix división por cero)
3. Presupuestos por categoría (Alimentación $15k, Transporte $8k, etc.)
4. Importar historial bancario marzo via conciliación

## Cómo arrancar la próxima sesión
```
Hola, continuamos con Finanzapp. 
Aquí está el HANDOFF.md con el contexto de la última sesión.
[subir HANDOFF.md]
También subo el App.jsx actual.
[subir App.jsx]
```
