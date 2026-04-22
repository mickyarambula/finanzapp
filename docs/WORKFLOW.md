# Finanzapp — Workflow

## Cómo trabajamos

### Dinámica general
- Miguel no es programador — explicar sin términos técnicos
- Si hay términos técnicos, explicar qué significan
- Tomar decisiones directamente, no dar listas para que Miguel elija
- Preguntar una sola cosa a la vez si se necesita información
- Si algo puede salir mal, decirlo ANTES de hacerlo
- Antes de modificar datos en Supabase, decir qué se va a cambiar y esperar confirmación

### Formato de respuesta estructurado (REGLA OBLIGATORIA)
Para CUALQUIER cambio de código o acción que tenga efecto, Claude responde con esta estructura:

1. **Diagnóstico** — qué está pasando y por qué, en palabras simples
2. **Plan** — qué va a hacer, qué archivo/línea va a tocar, qué puede salir mal
3. **Ejecutando** — aviso cuando está trabajando (para que Miguel sepa que no es su turno)
4. **Hecho** — qué quedó cambiado exactamente, con verificaciones (llaves, backticks, etc.)
5. **Cómo probar** — pasos numerados, uno por línea. Comandos de terminal en bloques separados, listos para copiar con un clic

Ejemplo mínimo:
```
## Diagnóstico
El botón X no funciona porque...

## Plan
Voy a modificar la línea Y de App.jsx para que...
Riesgo: nulo / bajo / medio / alto. Si falla: cómo revertir.

## Hecho
Cambio aplicado en línea 10677. Archivo verificado: llaves balanceadas, backticks PAR.

## Cómo probar
1. Descarga el archivo
2. Ejecuta:
```bash
comando1
```
3. Verifica que X ocurra en https://finanzapp-iota.vercel.app
```

### Comandos en bash — SIEMPRE separados
Cada comando en su propio bloque de código, listo para copiar con un clic. NO juntar varios con `&&` si el usuario los va a ejecutar manualmente.

### Flujo de desarrollo con App.jsx (sesión en claude.ai web)
1. Miguel sube el App.jsx actual al chat
2. Claude hace los cambios en el archivo
3. Claude verifica: balance de llaves (diff=0), backticks (PAR), sin hooks en IIFEs
4. Miguel descarga el App.jsx nuevo
5. Miguel hace el deployment (comandos separados)

### Flujo de desarrollo con Claude Code (terminal) — PREFERIDO para refactors
- Para refactors, múltiples archivos, o verificación en navegador antes de push
- Comando para iniciar: `cd ~/Desktop/finanzapp2 && claude`
- Claude puede crear archivos, correr `npm run dev`, abrir navegador
- Miguel solo hace `git push` cuando Claude ya verificó que funciona local

### Regla de oro con Claude Code
- Siempre correr `npm run dev` y abrir el navegador para verificar ANTES de hacer push
- Si algo falla 2 veces con el mismo enfoque, cambiar estrategia
- Si falla 3 veces total, parada técnica: documentar y retomar al día siguiente
- Si la pantalla queda en blanco después de push, revisar consola del navegador (F12)

### Regla de oro para refactors
- **UNO A LA VEZ.** Nunca extraer múltiples módulos sin probar entre cada uno.
- **Usar tag de seguridad en Git ANTES de empezar:**
```bash
git tag -a v-estable-<descripcion> -m "mensaje"
git push origin v-estable-<descripcion>
```
- Para revertir si algo explota:
```bash
git reset --hard v-estable-<descripcion>
git push --force
```
- Después de cada extracción, Miguel debe usar la app en producción al menos 10–15 minutos haciendo uso normal antes de seguir con el siguiente módulo

### Cuándo cerrar un chat y abrir uno nuevo (señales de Claude)
Claude avisa con una de estas frases:

- 🟢 **"Buen punto de cierre"** — se completó un bloque lógico, conviene cortar aunque el chat siga fresco
- 🟡 **"El chat ya cargó bastante contexto, vale la pena traspasar"** — llevamos varias horas o muchos temas mezclados
- 🔴 **"Traspaso obligatorio"** — Claude detecta que está empezando a perder consistencia o cometer errores

Cuando Claude avisa, entrega:
1. `HANDOFF.md` actualizado con lo que se hizo, lo que sigue, y trampas descubiertas
2. El contenido listo para pegar en el chat nuevo
3. Las primeras 2–3 acciones que debe hacer el próximo Claude al arrancar

### Para forzar redeploy en Vercel (plan Hobby sin Purge Cache)
```bash
cd ~/Desktop/finanzapp2
git commit --allow-empty -m "chore: trigger redeploy"
git push
```

### Supabase — acceso directo
- Claude puede leer y escribir en Supabase directamente sin deployment
- Usar para: correcciones de datos, normalización, fixes urgentes
- SIEMPRE verificar con SELECT antes de hacer UPDATE/DELETE
- Advertir si el cambio es irreversible

### Cuándo NO necesitamos deployment
- Correcciones de datos en Supabase (directo)
- Normalización de campos (esVariable null → false, etc.)
- Arreglar ultimoRegistro de recurrentes

## Tags de seguridad (histórico)
| Tag | Descripción | Fecha |
|-----|-------------|-------|
| v-estable-pre-refactor-abr21 | Fix iCloud + setRecurrents Dashboard + Git reconectado | 21-abr-2026 |
| v-estable-post-utils | Estado bueno tras extraer utils.js (commit base 91404a1). Creado antes de tocar shared.jsx | 21-abr-2026 |

## Commits de referencia importantes
| Commit | Descripción | Estado |
|--------|-------------|--------|
| b9674c6 | refactor: extract Card, Btn, Modal, Inp, Sel + Ctx/theme/Ic to shared.jsx | ✅ PRODUCCIÓN (21-abr noche, 2da tanda) |
| 91404a1 | refactor: extract fmt, fmtDate, today, genId to utils.js | ✅ PRODUCCIÓN (21-abr noche, 1ra tanda) |
| 17a0862 | fix: setRecurrents accesible en Dashboard para confirmar recurrentes | ✅ incluido |
| faada31 | chore: trigger redeploy en finanzapp | ✅ producción (antes de fix Dashboard) |
| d7bd168 | fix: no validar saldo en tarjetas de crédito al confirmar recurrente | ✅ incluido |
| 3de9f08 | fix: botones editar/eliminar en presupuesto global | referencia histórica |
| 59c7b1b | refactor: módulos (revertido) | ❌ revertido — circular deps |

## Al inicio de cada sesión
1. Miguel sube App.jsx actual (o en Claude Code, Claude lo lee directo)
2. Miguel pega los docs (HANDOFF, ARCHITECTURE, DECISIONS, ROADMAP, WORKFLOW, PROGRESS)
3. Claude lee HANDOFF.md primero para saber dónde quedamos
4. Claude confirma en 3 líneas: dónde estamos, qué haremos hoy, algo que deba saber
5. Arrancar

## Al final de cada sesión
- Actualizar HANDOFF.md con qué se hizo y qué sigue
- Anotar commits y tags relevantes en WORKFLOW.md
- Si hubo cambios en Supabase, documentarlos en PROGRESS.md
- Si se crearon tags de seguridad, registrarlos en la tabla de tags
