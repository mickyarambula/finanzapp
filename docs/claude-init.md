# Prompt de arranque para Claude Code — Finanzapp

Copia y pega este bloque completo como PRIMER MENSAJE al abrir Claude Code:

---

```
Hola. Vas a trabajar conmigo en Finanzapp, mi app personal de finanzas.

ANTES DE HACER NADA, lee estos archivos en orden y confirma que entendiste:
1. docs/HANDOFF.md — qué se hizo en la última sesión y por dónde empezar
2. docs/ARCHITECTURE.md — estructura técnica del proyecto
3. docs/DECISIONS.md — decisiones tomadas y por qué
4. docs/ROADMAP.md — qué falta por hacer
5. docs/WORKFLOW.md — cómo trabajamos (IMPORTANTE: reglas nuevas del 21-abr)
6. docs/PROGRESS.md — estado actual de la app

Después de leer, responde en 3 líneas:
- Dónde estamos
- Qué haremos hoy
- Algo que deba saber antes de empezar

REGLAS CRÍTICAS (están en WORKFLOW.md, pero las repito porque son no-negociables):

1. FORMATO DE RESPUESTA OBLIGATORIO para cualquier cambio de código:
   - Diagnóstico (qué pasa y por qué)
   - Plan (qué vas a hacer, qué puede salir mal)
   - Ejecutando (avisa cuando estás trabajando)
   - Hecho (qué cambió, con verificaciones)
   - Cómo probar (pasos numerados, comandos en bloques separados para copiar con un clic)

2. NO SOY PROGRAMADOR. Explica sin términos técnicos o aclara qué significan.

3. TOMA DECISIONES. No me des listas para elegir salvo que sea una decisión de negocio mía.

4. SI ALGO PUEDE SALIR MAL, dímelo ANTES de hacerlo.

5. REFACTOR: UNO A LA VEZ. Hoy vamos a extraer utils.js primero. Después
   de cada extracción, espera a que yo pruebe la app 10-15 min antes de
   seguir con el siguiente módulo.

6. RED DE SEGURIDAD: existe el tag 'v-estable-pre-refactor-abr21' en Git.
   Si algo explota, revertimos a ese punto con:
      git reset --hard v-estable-pre-refactor-abr21
      git push --force

7. SI EL CHAT SE ESTÁ CARGANDO DE CONTEXTO, avísame para traspasar a un
   chat nuevo. Las señales son:
   🟢 "Buen punto de cierre"
   🟡 "El chat ya cargó bastante contexto, vale la pena traspasar"
   🔴 "Traspaso obligatorio"

8. ANTES DE CUALQUIER DEPLOY, verifica:
   - npm run dev corre sin errores
   - Abre el navegador (http://localhost:5173) y verifica que la app carga
   - Solo entonces pídeme hacer git push

Cuando termines de leer los docs, responde con tus 3 líneas de resumen y
espera mi confirmación antes de avanzar. No arranques con el refactor
hasta que yo diga "dale".
```

---

## Notas para Miguel sobre cómo usar este prompt

- Ábrelo en el terminal con: `cd ~/Desktop/finanzapp2 && claude`
- Pega el bloque completo que está entre los `---`
- Claude Code leerá los docs del proyecto automáticamente y te responderá con el resumen
- Después tú le dices "dale" o le das instrucciones específicas
