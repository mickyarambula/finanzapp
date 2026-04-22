# Decisiones — AgroSistema Charay v2

> Historial de decisiones importantes con su razonamiento. Leer antes de cuestionar algo: probablemente ya se pensó. Si la decisión cambia, se agrega una nueva entrada con el cambio y su razón (no se borran las anteriores).

---

## D-000 — Reconstruir v2 desde cero en vez de arreglar v1

**Fecha:** 2026-04-16
**Contexto:** v1 (agro-charay) se corrompió por imports circulares entre módulos y App.jsx. El daño estructural no se podía arreglar quirúrgicamente sin arrastrar deuda técnica.
**Decisión:** iniciar v2 en repo separado (`agro-charay-v2`) con arquitectura limpia y reglas de oro explícitas que prevengan el problema raíz.
**Trade-off:** perdemos tiempo inicial de reconstrucción, ganamos sostenibilidad a largo plazo.

---

## D-001 — Stack: React 19 + Vite + JS + Tailwind v4 + shadcn + Zustand + React Query + RR v7 + RHF + Zod + Supabase + pnpm

**Fecha:** 2026-04-16
**Contexto:** elección de tecnologías para v2.
**Decisión:**
- Frontend: React 19, Vite, JavaScript (no TypeScript — el proyecto es manejable sin la complejidad adicional de tipos).
- UI: Tailwind v4 + shadcn/ui preset Nova.
- Estado: Zustand para auth, React Query para datos de servidor.
- Routing: React Router v7.
- Forms: React Hook Form + Zod para validación.
- Backend: Supabase (Postgres + Auth + RLS + Storage).
- Package manager: pnpm.
**Razón:** stack moderno, probado, con buena documentación. Compatible con el flujo Claude Code + MCP. Supabase evita montar backend propio.

---

## D-002 — Tailwind v4 en lugar de v3

**Fecha:** 2026-04-16
**Contexto:** spec original pedía Tailwind v3. Al instalar shadcn@latest, generó CSS Tailwind v4.
**Decisión:** migrar a Tailwind v4 con `@tailwindcss/vite`. Sin `postcss.config.js` ni `tailwind.config.js`. Config vive en `src/index.css`.
**Razón:** shadcn@latest ya asume v4, forzar v3 generaba errores de build. Adoptar v4 es la dirección natural.

---

## D-003 — `utils.js` vive en `src/lib/` (no en `src/shared/lib/`)

**Fecha:** 2026-04-16
**Contexto:** shadcn fija alias `@/lib/utils` en `components.json`.
**Decisión:** respetar la convención de shadcn. `src/shared/lib/` se reserva para helpers propios (como `supabase.js`).
**Razón:** pelear con la convención de una librería madura genera fricción innecesaria.

---

## D-004 — `components/ui/` vive en `src/` (no dentro de `shared/`)

**Fecha:** 2026-04-16
**Contexto:** shadcn fija alias `@/components/ui` y la instrucción original marca "esta la crea shadcn — NO tocar".
**Decisión:** respetar estructura fija de shadcn.
**Razón:** misma lógica que D-003.

---

## D-005 — Supabase Auth oficial, no auth casera

**Fecha:** 2026-04-17
**Contexto:** v1 validaba passwords en texto plano contra tabla `usuarios`. Inseguro y limitante.
**Decisión:** usar Supabase Auth oficial (`auth.users` + `signInWithPassword`). Tabla `usuarios` conservada para rol, nombre, y metadata adicional, conectada a `auth.users` vía columna `auth_id`.
**Razón:**
1. Seguridad: passwords hasheados y gestionados por Supabase, no por nosotros.
2. Tokens JWT y refresh automático gratis.
3. Row Level Security futura aplicable sobre `auth.uid()`.
4. Cumplimiento con LFPDPPP (México) al no almacenar passwords en plano.
**Costo:** migrar 7 usuarios de `usuarios` a `auth.users` + agregar columna `auth_id`.

---

## D-006 — Roles y permisos viven en la base de datos, no en código

**Fecha:** 2026-04-17
**Contexto:** inicialmente propuse matriz hardcodeada en `permissions.js`. El usuario expresó que necesita poder crear, editar y eliminar roles desde la UI conforme cambien las necesidades del negocio.
**Decisión:** crear tablas `roles` y `rol_permisos` en Supabase. Admin puede editar la matriz desde un módulo de Administración. El hook `usePermissions()` lee de BD (con cache de React Query de 5 min).
**Razón:**
1. Evita deploys para cambios administrativos.
2. El sistema se auto-administra.
3. Escala a nuevos roles sin tocar código.
4. Auditoría natural: la BD guarda quién cambió qué y cuándo.
**Protección contra lockout:** rol `admin` marcado con `es_sistema = true`. No se puede eliminar ni quitarle permisos.

---

## D-007 — Roles funcionales (puestos), no roles personales

**Fecha:** 2026-04-17
**Contexto:** v1 tenía roles `daniela` y `socio` (nombres de personas). Problema: si la persona cambia, el rol pierde sentido semántico.
**Decisión:** roles iniciales representan **puestos** funcionales:
- `admin` — acceso total, configuración del sistema
- `gerencia` — dirección, aprobación, read consolidado
- `operaciones` — encargado de campo, gestión diaria
- `tecnico` — ingeniero agrónomo, decisiones técnicas
- `compras` — adquisiciones y egresos
- `campo` — operador, captura básica

Las personas (Miguel, Daniela, Socio, etc.) son **usuarios** que ocupan un puesto. Un puesto puede tener N personas. Una persona tiene exactamente 1 puesto.
**Razón:** escalabilidad, claridad semántica, facilidad de rotación.
**Nota:** admin puede crear roles adicionales desde UI si el negocio lo necesita (coincide con D-006).

---

## D-008 — Usuarios iniciales: solo 2 (admin + gerencia de prueba)

**Fecha:** 2026-04-17
**Contexto:** v1 tenía 7 usuarios de prueba con passwords en documentación. Crear los 7 sin emails reales es deuda innecesaria.
**Decisión:** crear solo 2 usuarios en Fase 1:
- `admin@agro-charay.local` / password `123123` — Miguel
- `gerencia@agro-charay.local` / password `test2025` — cuenta de prueba para validar flujos no-admin

Los demás usuarios se crean cuando existan personas reales con emails reales.
**Razón:** no crear por crear. El admin puede dar de alta usuarios nuevos desde UI cuando toque.

---

## D-009 — Emails fake en desarrollo como deuda técnica documentada

**Fecha:** 2026-04-17
**Contexto:** los emails tipo `admin@agro-charay.local` no son dominio real. Esto rompe el flujo de "forgot password" de Supabase (los emails de reset no llegan).
**Decisión:** aceptar emails fake durante desarrollo. Documentar como deuda técnica de **prioridad media** en esta entrada. Resolver antes de onboardear al primer usuario no-admin real.
**Acción pendiente:** migrar a emails reales (ej. `miguel@agrofraga.com`) o configurar dominio propio con Mailgun/Resend para Supabase.
**Razón:** acelerar Fase 1 sin bloqueo por configuración de emails. El flujo de reset no es crítico hasta que haya usuarios externos.

---

## D-010 — Arquitectura multi-cultivo con entidad central `siembras`

**Fecha:** 2026-04-17
**Contexto:** v1 estaba diseñado implícitamente para un solo cultivo (trigo) en el ciclo activo. El negocio real maneja múltiples cultivos simultáneos con estados de cuenta independientes.
**Decisión:** introducir entidad central `siembras` que combina productor + lote + ciclo + cultivo. Todas las operaciones (dispersiones, aplicaciones, egresos, bitácora) cuelgan de una siembra, no de un lote o productor.
**Razón:**
1. Permite múltiples cultivos en el mismo ciclo naturalmente.
2. Estados de cuenta por cultivo salen directos (filtrar siembras por `cultivo_id`).
3. Mismo lote puede tener cultivos distintos entre ciclos → historia de rotación.
4. Mismo productor puede tener múltiples cultivos → estado de cuenta consolidado o separado.
**Impacto:** esta es la decisión arquitectónica más importante de v2. Ver `ARCHITECTURE.md` para detalle.

---

## D-011 — 3 áreas del sistema: Administrativa, Operativa-Agronómica, Inteligencia

**Fecha:** 2026-04-17
**Contexto:** el sistema mezclaría mentalmente dos mundos distintos: el financiero-administrativo y el técnico-agronómico.
**Decisión:** organizar el sidebar en 3 grupos visuales distintos (pero conectados por BD compartida):
- 💰 Administrativa: productores, dispersiones, egresos, estados de cuenta
- 🌱 Operativa-Agronómica: siembras, aplicaciones, bitácora, inventario, diésel, tractores
- 📊 Inteligencia: dashboards, ficha del lote, reportes
**Razón:** la experiencia de uso se adapta al contexto mental del usuario. Un técnico no quiere ver dispersiones; un compras no quiere ver aplicaciones foliares.

---

## D-012 — Catálogos maestros siempre editables desde UI

**Fecha:** 2026-04-17
**Contexto:** v1 tenía constantes hardcodeadas (lista de cultivos, categorías de egreso, etc.). Cada cambio requería deploy.
**Decisión:** todo catálogo editable desde módulo de Administración: cultivos, variedades, tipos de aplicación, categorías de egreso, unidades de medida, roles, etc.
**Razón:** el negocio cambia. Agregar un cultivo nuevo o una categoría de egreso no debería requerir programador.

---

## D-013 — No adoptar FMIS comercial ni open source; construir v2 a medida

**Fecha:** 2026-04-17
**Contexto:** se evaluó adoptar sistemas existentes (AGRIVI, Agworld, farmOS, Tania) en lugar de construir.
**Decisión:** construir v2 a medida. Integrar APIs externas puntuales (clima, satelital) solo donde aporten valor y no se puedan replicar razonablemente.
**Razón:**
1. El modelo de negocio (financiamiento a productores en esquema de aparcería + operación multi-cultivo + administración mexicana) no encaja en FMIS genéricos — todos asumen que el usuario es el dueño-operador.
2. FMIS comerciales son caros mensualmente, en inglés, y no personalizables al flujo real.
3. farmOS (open source) está construido sobre Drupal, complejo de personalizar, y no maneja el modelo financiero requerido.
4. Construir a medida cuesta tiempo inicial pero se amortiza: el sistema sirve exactamente al negocio.
**Trade-off aceptado:** mayor tiempo de construcción inicial a cambio de control total y ajuste perfecto.

---

## D-014 — Fetching server-side con paginación para módulos con crecimiento

**Fecha:** 2026-04-17
**Contexto:** módulo Productores es plantilla de los otros 31. Algunos módulos (dispersiones, egresos) tendrán miles de filas en 2-3 años.
**Decisión:** todos los módulos usan query a Supabase con filtros, búsqueda (`.ilike`), orden, y paginación del lado del servidor. React Query cachea con `queryKey` que incluye los parámetros.
**Razón:** escalable desde el día 1. Evita el antipatrón "fetch all + filter en cliente" que colapsa con volumen.

---

## D-015 — Patrón del módulo documentado al terminar Productores

**Fecha:** 2026-04-17
**Contexto:** Productores es la plantilla de los otros 31 módulos.
**Decisión:** al terminar el CRUD de Productores, documentar en este archivo el "patrón estándar del módulo" con estructura de archivos, convenciones de nombres y orden de construcción.
**Razón:** cada módulo posterior se construye más rápido y con mayor consistencia siguiendo la plantilla.

---

## D-016 — Rol legacy "socio" omitido de seed inicial

**Fecha:** 2026-04-17
**Contexto:** En la migración 0001, el rol legacy "socio" (Agrofraga) no se mapeó a ningún rol nuevo. Queda en `usuarios` con `auth_id = NULL` y `rol_id = NULL`, efectivamente dormido.
**Razón:** El socio requiere scope financiero específico (visibilidad solo a ciertos cultivos donde es socio). Este scope se resolverá cuando se implementen los estados de cuenta por cultivo (Fase 4) con el contexto completo del modelo financiero.
**Acción pendiente (Fase 4):** decidir si el socio entra con rol `gerencia` + filtro de cultivo, o si requiere enforcement real con `usuario_asignaciones`. Ver D-017.

---

## D-017 — Scope por cultivo diferido: filtros voluntarios ahora, enforcement real si aparece necesidad

**Fecha:** 2026-04-17
**Contexto:** Durante el diseño de Fase 1 se identificaron 3 señales que sugerían implementar scope por cultivo desde el inicio:
1. El socio es socio de solo ciertos cultivos.
2. Algunos empleados son especialistas (chile bajo malla vs granos) y otros polivalentes.
3. La contabilidad debe ser separable por cultivo con panel consolidado.

Se evaluaron tres opciones:
- **Opción A:** roles globales simples, sin scope.
- **Opción B:** tabla `usuario_asignaciones` con `rol_id + cultivo_id` (scope real con enforcement).
- **Opción C (elegida):** roles globales + filtros voluntarios de cultivo en el UI (topbar con selector "Todos los cultivos" o uno específico).

**Decisión:** Opción C para Fase 1. Se difiere la implementación de scope real (Opción B) hasta que exista una necesidad concreta identificable.

**Razón fundamental:**
Durante la conversación el usuario no pudo identificar casos reales de confidencialidad (persona que NO DEBE ver otro cultivo) ni externos que requieran scope hard. Tres indicios claros:
1. "No hay personas que no deban ver otros cultivos por confidencialidad" (implícito en la delegación).
2. "No tengo idea" sobre externos — si existieran, lo sabría.
3. El 90% del beneficio (ergonomía de filtrado) se logra con filtros voluntarios, sin el 80% del costo (tabla intermedia + hooks complejos + selector de contexto obligatorio).

**Arquitectura que NO se cierra:**
La entidad `siembras` (D-010) conserva `cultivo_id`. Todas las entidades operativas (dispersiones, egresos, aplicaciones, bitácora) cuelgan de siembra y heredan el cultivo. Esto significa que **los datos ya están organizados por cultivo desde el día 1**, aunque el control de acceso sea laxo.

Si en el futuro aparece una necesidad real de enforcement (nuevo socio externo, auditor que solo ve un cultivo, empleado que debe estar limitado), se agrega tabla `usuario_asignaciones` como **migración aditiva** sin refactor de datos ni queries. El salto costaría 1-2 sesiones de trabajo concentrado, no un rediseño.

**Qué se implementa en Fase 1:**
- Roles globales según migración 0001 (admin, gerencia, operaciones, técnico, compras, campo).
- Hook `usePermissions()` simple: `can(modulo, accion)` sin parámetro de cultivo.

**Qué se implementa a partir de Fase 3 (Siembras) y Fase 4 (Financiero):**
- Selector de cultivo en Topbar con opción "Todos los cultivos" por defecto.
- Todas las vistas de módulos operativos respetan el filtro del Topbar vía query params / state global.
- Filtros son **voluntarios** y **ajustables por el propio usuario** — no bloquean acceso, solo ayudan a enfocarse.

**Costo honesto aceptado:**
Un empleado técnicamente puede ver datos de un cultivo que no le corresponde si quita el filtro. Esto es aceptable porque:
- Todos los usuarios del sistema hoy son personal de confianza interno.
- No hay requisito regulatorio ni contractual de confidencialidad por cultivo.
- El beneficio de construir rápido supera el riesgo de fuga interna de datos entre cultivos propios.

**Señales de que toca revisitar esta decisión:**
- Se incorpora un socio/inversionista externo que solo debe ver SU cultivo.
- Se audita el sistema para certificación (ej. orgánico, exportación) que exige trazabilidad de acceso.
- Aparece un conflicto donde un empleado accede a datos de otro cultivo y eso genera problema real.

Si ninguna de estas señales aparece en 12 meses de operación, esta decisión se confirma como acertada definitivamente.

---

## D-016 — Rol "socio" diferido; diseño de scope pospuesto

**Fecha:** 2026-04-17
**Contexto:** v1 tenía rol "socio" (Agrofraga). El usuario indicó que el socio no es universal a todos los cultivos y su acceso es principalmente financiero. No es un rol vital para operación diaria.
**Decisión:** en Fase 1 no se crea rol específico para socio. El usuario legacy `socio` queda sin `auth_id` ni `rol_id` (dormido en BD). Cuando haya necesidad real, se decide el enfoque con el contexto acumulado de meses de uso.
**Razón:** no diseñar para hipotéticos. El socio no va a usar el sistema en Fase 1-3. Puede seguir viendo información vía reportes o Excel.
**Acción pendiente:** cuando llegue el momento (probablemente Fase 4-7), evaluar si crear rol `socio_financiero` simple o implementar scope por cultivo (ver D-017).

---

## D-017 — Scope por cultivo diferido; sistema usa roles globales con filtros ergonómicos

**Fecha:** 2026-04-17
**Contexto:** durante la sesión de arquitectura, el usuario mencionó que su operación involucra cultivos muy distintos (granos, hortalizas bajo malla, legumbres) con equipos parcialmente especializados. Surgió la pregunta: ¿debemos construir scope de permisos por cultivo desde Fase 1 (modelo `usuario_asignaciones`) o usar roles globales?
**Decisión:** **roles globales con filtros voluntarios de cultivo** a nivel de UI. No se construye `usuario_asignaciones` en Fase 1.
**Razón del diferimiento:**
1. **No hay confidencialidad real entre miembros del equipo actual.** Todos son de confianza.
2. **No hay externos (socios externos, clientes mayoristas por cultivo específico) en el horizonte visible.**
3. **La distinción crítica es entre _enforcement_ (sistema bloquea acceso) y _ergonomía_ (sistema filtra visualmente).** Hoy solo se necesita ergonomía — que cada quien vea fácilmente SU cultivo por default, con libertad de cambiar contexto.
4. **Construir scope prematuramente multiplica moving parts** (hook más complejo, UI con selector condicional, queries con JOINs, validaciones en cada módulo). Ese costo no está justificado hasta que exista necesidad concreta.
5. **Los datos ya se organizarán por cultivo de forma natural** gracias a la entidad `siembras` (D-010). Toda operación cuelga de una siembra que tiene `cultivo_id`. Esto significa que si en el futuro se necesita scope real, **agregar `usuario_asignaciones` es aditivo** — no rompe lo construido.

**Cómo se materializa en el código:**
- En Fase 3 (cuando existan siembras y cultivos) se agrega un **selector global de cultivo** en el Topbar: `[Todos | trigo | chile | frijol | ...]`.
- El selector afecta un filtro de React Query que se pasa a todas las queries relevantes (`?cultivo_id=X`).
- El default del selector puede ser "Todos" para admin/gerencia, o "el último usado" para usuarios operativos.
- El selector es **voluntario**: cualquier usuario puede cambiarlo en cualquier momento.

**Criterios para reabrir esta decisión:**
Si alguno de los siguientes sucede, se reabre el debate y se considera implementar `usuario_asignaciones`:
- Se contrata personal externo que NO debe ver ciertos cultivos.
- Se formaliza una sociedad con terceros por cultivo específico que requiera auditoría de accesos.
- Emerge requisito legal/contable de separación estricta de accesos por unidad de negocio.

**Trade-off asumido:** hoy Pedro (técnico de chile) puede técnicamente ver datos de trigo si navega ahí. La mitigación es ergonomía (filtro default en su cultivo) y confianza operativa (Pedro es tu empleado, no un atacante).

---

## D-018 — Filosofía de diseño: bueno es enemigo de perfecto

**Fecha:** 2026-04-17
**Contexto:** durante la sesión de arquitectura, el usuario expresó: "confío mucho en tu criterio, a lo mejor me estoy complicando mucho". Esta entrada documenta la filosofía que guía las decisiones de scope y complejidad en v2.
**Decisión:** priorizar siempre un sistema **funcionando pronto** sobre un sistema **perfecto en construcción**. Construir lo que la realidad actual requiere, dejar extensión posible para lo futuro, pero no codificar hipótesis.

**Heurísticas que aplican:**
1. **Si no tengo un caso concreto y actual que resuelva, no lo construyo.** Diferir no cuesta cuando el diseño de datos lo permite.
2. **Preferir aditivo sobre transformativo.** Decisiones que _se añaden_ en el futuro sin romper lo existente (como D-017) son mejores que decisiones que _transforman_ lo construido.
3. **El usuario debe estar usando el sistema en semanas, no meses.** Cada semana sin sistema funcionando es una semana que sigue dependiendo de Excel. El costo de Excel supera al costo de imperfecciones menores en v2.
4. **Refactor con datos reales > diseño con hipótesis.** En 3 meses con datos reales y uso real, cualquier decisión pendiente se toma con 10x más claridad que hoy.

**Razón:** esta filosofía es el antídoto contra scope creep y analysis paralysis. Este documento mismo (D-018) es la ancla a la que se apela cuando alguna sesión futura se siente tentada a "diseñar bien desde el principio" antes de tener uso real.

Tarea: llenar el archivo .env.local con las credenciales de Supabase para 
que el dev server local pueda conectarse al proyecto oryixvodfqojunnqbkln.

## Contexto del problema

El login falla en local con error "Failed to fetch" contra localhost:54321.
Razón: .env.local está vacío, el cliente Supabase usa placeholders.
Las credenciales ya existen en Vercel (producción funciona), pero falta 
poblarlas localmente.

## Pasos

1. Verificar que .env.local existe:
   ls -la .env.local
   
   Si no existe, crearlo vacío: touch .env.local

2. Pedir a Miguel las 2 variables por entrada de terminal interactiva 
   (NO las pongas en el commit history ni las imprimas en la terminal de 
   manera persistente).
   
   Prompt al usuario:
   "Copia el Project URL de Supabase (ej. https://oryixvodfqojunnqbkln.supabase.co):"
   [leer stdin]
   
   "Copia la clave anon (JWT que empieza con eyJ...):"
   [leer stdin]

3. Escribir el archivo .env.local con este formato EXACTO (con las 
   variables proporcionadas):
   
   VITE_SUPABASE_URL=<valor-url>
   VITE_SUPABASE_ANON_KEY=<valor-anon-key>
   
   Sin comillas, sin espacios, una por línea.

4. Verificar que .gitignore incluye .env.local (debería, fue creado en 
   Fase 0). Si no, agregarlo:
   
   grep -q "^\.env\.local$" .gitignore || echo ".env.local" >> .gitignore
   
   CRÍTICO: NUNCA hacer commit de .env.local con credenciales reales.

5. Verificar que el archivo está correctamente formateado (sin 
   mostrar los valores completos, solo el shape):
   
   awk -F= '{print $1"=<valor-presente-"length($2)"-chars>"}' .env.local

6. Reiniciar el dev server (Vite carga .env.local solo al arrancar):
   - Matar el dev server actual: pkill -f "vite" 
   - Arrancar de nuevo: pnpm dev &
   - Esperar 3 segundos
   - Hacer smoke test: curl -s -o /dev/null -w "%{http_code}" http://localhost:5173/
   
   Debe devolver 200.

7. Pedir a Miguel que pruebe el login de nuevo en el navegador.

NO hacer ningún git add ni commit en este paso. Los cambios a .env.local 
son locales por diseño.
