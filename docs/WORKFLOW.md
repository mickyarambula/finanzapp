# Finanzapp — Workflow

## Cómo trabajamos

### Dinámica general
- Miguel no es programador — explicar sin términos técnicos
- Si hay términos técnicos, explicar qué significan
- Tomar decisiones directamente, no dar listas para que Miguel elija
- Preguntar una sola cosa a la vez si se necesita información
- Si algo puede salir mal, decirlo ANTES de hacerlo

### Flujo de desarrollo estándar
1. Miguel sube el App.jsx actual al chat
2. Claude hace los cambios en el archivo
3. Claude verifica: balance de llaves (diff=0), backticks (PAR), sin hooks en IIFEs
4. Miguel descarga el App.jsx nuevo
5. Miguel hace el deployment:
```bash
rm ~/Downloads/App*.jsx
cp ~/Downloads/App.jsx ~/Desktop/finanzapp2/src/App.jsx
cd ~/Desktop/finanzapp2 && git add . && git commit -m "mensaje" && git push
```

### Cuándo usar Claude Code (terminal)
- Refactors grandes que tocan muchos archivos
- Extraer módulos
- Tareas que necesitan correr `npm run build` para verificar
- Comando para iniciar: `cd ~/Desktop/finanzapp2 && claude`

### Regla de oro con Claude Code
- Siempre correr `npm run dev` y abrir el navegador para verificar ANTES de hacer push
- Si algo falla 2 veces con el mismo enfoque, cambiar estrategia
- Si la pantalla queda en blanco después de push, revisar consola del navegador (F12)
- Para forzar redeploy en Vercel (plan Hobby no tiene Purge Cache):
```bash
echo "// force rebuild $(date)" >> src/App.jsx
git add . && git commit -m "chore: trigger redeploy" && git push
```
- Para revertir a versión estable:
```bash
git reset --hard COMMIT_HASH
echo "// restore $(date)" >> src/App.jsx  
git add . && git commit -m "revert: restaurar versión estable" && git push
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

## Commits de referencia importantes
| Commit | Descripción | Estado |
|--------|-------------|--------|
| 3de9f08 | fix: botones editar/eliminar en presupuesto global | ✅ PRODUCCIÓN ACTUAL |
| 2ee7b53 | fix: alertas colapsadas por defecto | ✅ incluido en 3de9f08 |
| 51fee07 | refactor: utils.js (revertido) | ❌ revertido |
| 59c7b1b | refactor: módulos (revertido) | ❌ revertido |

## Al inicio de cada sesión
1. Miguel sube el App.jsx actual
2. Claude lee HANDOFF.md para saber dónde quedamos
3. Claude verifica en Supabase el estado actual de los datos si es necesario
4. Arrancar

## Al final de cada sesión
- Actualizar HANDOFF.md con qué se hizo y qué sigue
- Anotar commits relevantes en WORKFLOW.md
- Si hubo cambios en datos de Supabase, documentarlos en PROGRESS.md
