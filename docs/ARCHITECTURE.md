# Finanzapp — Architecture

## Stack
- **Frontend:** React + Vite (sin TypeScript)
- **Backend/DB:** Supabase (PostgreSQL + Auth)
- **Deploy:** Vercel (auto-deploy desde GitHub push)
- **Repo:** github.com/mickyarambula/finanzapp
- **Local:** ~/Desktop/finanzapp2/
- **URL producción:** finanzapp-iota.vercel.app

## Estructura de archivos (estado al 22-abr-2026, post Push 1+2)
```
src/
├── App.jsx          # Shell, Auth, Sidebar, Router + el resto de páginas pendientes de extraer (~14,485 líneas)
├── utils.js         # Funciones puras (14 líneas): fmt, fmtDate, today, genId
├── shared.jsx       # Tuberías compartidas (274 líneas) — ÚNICO archivo que habla con Supabase
│                    #   UI: Card, Btn, Modal, Inp, Sel, Badge, Actions, ConfirmModal
│                    #   Tema/contexto/íconos: Ctx, useCtx, themeTokens, useTheme, ICONS, Ic
│                    #   Datos/infra: supa, store, uKey, useData, useConfirm, getTc
└── modules/         # Módulos extraídos (refactor en curso, uno a la vez)
    └── Metas.jsx    # ✅ ACTIVO en producción (22-abr) — 561 líneas, cero props
```

> ✅ Estado actual: refactor en marcha, módulo por módulo, validando en producción entre cada uno.
> Patrón confirmado: módulos importan solo de `react`, `../utils`, `../shared`. Cero props desde App.jsx.
> Flecha de dependencias: App.jsx → modules/*.jsx → shared.jsx → librerías externas.

## Reglas de los módulos en src/modules/
1. **NO importar de App.jsx** — solo de `react`, `../utils`, `../shared`.
2. **NO importar de otros módulos** — evita ciclos.
3. **Cero props desde App.jsx** — todo lo que necesiten viene vía `useCtx()` (user, toast, navigate, theme) o vía `useData()` (datos de Supabase).
4. Si un módulo necesita una función nueva compartida, **se agrega a `shared.jsx`** (no a App.jsx).
5. **Default export** del componente (ej. `export default Metas;`).

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
