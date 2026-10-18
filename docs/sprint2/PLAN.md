# Plan Sprint 2

## Dependencias entre User Stories

- **Vínculo usuario↔escudería** (`users.team_id` + asignación desde admin): bloquea US-08, US-11, US-05 y US-04 (para restringir quién lee cada comunicación).
- **US-13 → US-14**: la consulta necesita la tabla de controles.
- **US-08 → US-09**: US-09 necesita el campo titular/suplente.
- **US-10 → US-12 y US-11**: ambas consultan los puntajes.
- **US-04 → US-05**: no hay qué recibir sin el modelo de envío.

## Orden sugerido

| # | Bloque | US | Por qué en este lugar |
|---|---|---|---|
| 1 | ✅ **Escudería del usuario + pilotos** | vínculo usuario↔escudería → US-08 → US-09 | Provee el vínculo que necesitan US-11, US-04 y US-05, e introduce el chequeo de "solo lo de mi escudería" que después se reutiliza en esas US. US-09 sale casi gratis. |
| 2 | ✅ **Puntajes** | US-10 → US-12 → US-11 | El de mayor valor de negocio del sprint (US-10 BV 10, US-12 BV 8). Con el bloque 1 hecho, US-11 ya no se traba. |
| 3 | ✅ **Comunicaciones** | US-04 → US-05 | El más complejo y riesgoso (8 SP). Mejor no dejarlo para el final, así queda margen si el cifrado o el control de acceso se complican. |
| 4 | ✅ **Controles técnicos** | US-13 → US-14 | No depende de nada, es simple y calca el patrón del calendario. Si el sprint se aprieta es el más fácil de comprimir, y cualquiera que quede libre lo puede tomar en cualquier momento. |

**Puntos de conflicto al mergear:** todos los bloques tocan `backend/src/db.ts` (`initDb`), `backend/src/index.ts` (registro de routers), `PERMISSIONS` en `backend/src/permissions.ts` y la navegación en `app/app/index.tsx`. Son cambios chicos y fáciles de resolver; conviene mergear seguido o agregar esas líneas al principio en un commit común.
  
---

## Ranking de dificultad (simple → complejo)

| # | US | Por qué |
|---|----|---------|
| 1 | ✅ **US-09** Consulta pilotos por escudería (2 SP) | `GET /drivers` ya es público; solo filtrar por escudería y mostrar titular/suplente. |
| 2 | ✅ **US-14** Consulta controles técnicos (2 SP) | Listado público de solo lectura sobre la tabla de US-13. |
| 3 | ✅ **US-12** Consulta pública de puntajes (2 SP) | Solo lectura, pero con joins evento/piloto/escudería y quizá una tabla de posiciones agregada. |
| 4 | ✅ **US-13** Registro controles técnicos (5 SP) | CRUD admin aislado; calca el patrón de `backend/src/calendar.ts` + `app/app/calendar-admin.tsx`. Solo hay que decidir si el identificador del vehículo es texto libre o una tabla `cars`. |
| 5 | ✅ **US-05** Recepción comunicaciones (3 SP) | Lectura simple, pero requiere el vínculo usuario↔escudería y el modelo de US-04. |
| 6 | ✅ **US-10** Registro puntajes por carrera (5 SP) | Modelo nuevo carrera–piloto–escudería–puntos, carga de varias filas por carrera y validaciones (piloto pertenece a la escudería, sin duplicados). |
| 7 | ✅ **US-08** Pilotos titulares/suplentes (5 SP) | La columna titular/suplente es fácil; lo caro es que un `team_manager` solo edite los pilotos de su escudería. Hoy los permisos son globales por rol (`requirePermission`), no por recurso. |
| 8 | ✅ **US-11** Confirmación de puntaje recibido (5 SP) | Depende de US-10 y del vínculo usuario↔escudería; tabla de confirmaciones con fecha/hora y un aviso de puntajes pendientes de confirmar. |
| 9 | ✅ **US-04** Envío comunicaciones seguras (8 SP) | La más compleja: varios destinatarios, acceso solo para ellos, protección en tránsito y en reposo (cifrado) y registro de quién envió qué y cuándo. |
