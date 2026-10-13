# Cómo correr el proyecto

Simplificamos la implementación para correrlo con docker

Si no está hecho el build, o si cambiaron las dependencias (`package.json`):
```bash
docker compose up --build -V
```
(`-V` hace que los contenedores tomen los `node_modules` nuevos; sin eso la app puede fallar con "Unable to resolve module".)

Si está hecho el build:
```bash
docker compose up
```

Para bajar el container:
```bash
docker compose down
```

Para borrar la base y volver a empezar con los datos de prueba:
```bash
docker compose down -v
docker compose up
```

# Usuarios de prueba

Una base nueva arranca con datos de ejemplo (11 escuderías de F1 2026 con sus pilotos titulares y suplentes, el calendario 2026 y resultados de las carreras ya corridas). La contraseña de cada usuario es igual al usuario.

| Usuario / contraseña | Perfil | Escudería |
|---|---|---|
| `admin@admin.com` | Administrador FIA | — |
| `ferrari@ferrari.com` | Responsable de escudería | Ferrari (con algunas carreras ya confirmadas y otras pendientes) |
| `mclaren@mclaren.com` | Responsable de escudería | McLaren (todos los resultados pendientes de confirmar) |
| `juancarlos@juancarlos.com` | Responsable de escudería | Sin asignar |
| `publico@publico.com` | Sin perfil | — |
