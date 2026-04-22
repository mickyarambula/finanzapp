# Finanzapp — Architecture

## Stack
- **Frontend:** React + Vite (sin TypeScript)
- **Backend/DB:** Supabase (PostgreSQL + Auth)
- **Deploy:** Vercel (auto-deploy desde GitHub push)
- **Repo:** github.com/mickyarambula/finanzapp
- **Local:** ~/Desktop/finanzapp2/
- **URL producción:** finanzapp-iota.vercel.app

## Estructura de archivos
```
src/
├── App.jsx          # Shell, Auth, Sidebar, Router (~2,241 líneas post-refactor / revertido a ~15k)
├── utils.js         # Funciones compartidas: fmt, fmtDate, today, genId, calcLoanBal, calcNext
├── shared.jsx       # Componentes UI: Card, Btn, Modal, Inp, Sel, useData, useCtx, etc.
└── modules/         # Módulos extraídos (revertidos — ver DECISIONS)
```

> ⚠️ Estado actual: App.jsx es monolítico (~15k líneas) después del revert del 10-abr-2026.
> El refactor de módulos está en commits de Git pero no en producción.

## Base de datos — Supabase
- **Project ID:** dapzdmjfgfjnfurhmwrx
- **User ID Miguel:** 8aca301c-6b1f-45f4-99bd-e4f0f0f5c12c
- **Tabla principal:** `user_data` con columnas: `user_id`, `module`, `data` (jsonb), `updated_at`

### Módulos en Supabase
| module | descripción |
|--------|-------------|
| accounts | Cuentas bancarias y efectivo |
| transactions | Movimientos |
| loans | Préstamos otorgados y recibidos |
| investments | Inversiones activas y liquidadas |
| mortgages | Hipoteca Banorte |
| recurrents | Gastos/ingresos recurrentes |
| presupuestos | Presupuestos mensuales |
| assets | Activos físicos |
| goals | Metas de ahorro |
| transfers | Transferencias entre cuentas |
| documents | Documentos subidos |
| config | Configuración (TC, categorías) |
| patrimonio_snaps | Snapshots diarios de patrimonio neto |

## Patrones clave
- `useData(userId, module, fallback)` — hook que lee/escribe en Supabase con cache en localStorage
- `getTc(userId)` — obtiene tipo de cambio USD/MXN desde config
- `useTcAuto` — actualiza TC desde open.er-api.com máx 1 vez/hora
- `calcLoanBal(loan)` — calcula saldo pendiente de un préstamo
- `calcNext(r)` — calcula próxima fecha de un recurrente
- `genId()` — genera ID único: `Date.now().toString(36) + Math.random().toString(36).slice(2)`

## Reglas críticas de código
1. **useState NUNCA dentro de IIFE/callbacks** en JSX → siempre componentes separados
2. **Switch con único `default:`** — duplicados causan build failure
3. **Math.floor** (no Math.round) para días en cálculos de interés
4. **T12:00:00** en todas las fechas de pagos para evitar desfase UTC-6
5. **prev =>** pattern en todos los setters para evitar stale state
6. Verificar balance de llaves (diff=0) y backticks (PAR) antes de deploy

## Deployment
```bash
rm ~/Downloads/App*.jsx
# Descargar App.jsx actualizado
cp ~/Downloads/App.jsx ~/Desktop/finanzapp2/src/App.jsx
cd ~/Desktop/finanzapp2 && git add . && git commit -m "mensaje" && git push
```
