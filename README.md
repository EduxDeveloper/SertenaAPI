# SERTENA API

API REST de SERTENA para el portal de clientes y el panel administrador. Gestiona autenticación, servicios, clientes, empleados, citas y reseñas.

## Documentación Swagger

Con la API en ejecución, abre:

- Interfaz Swagger: `http://localhost:4000/api/docs`
- Especificación OpenAPI: `http://localhost:4000/api/openapi.json`

En Render, sustituye `http://localhost:4000` por la URL pública del servicio. Por ejemplo: `https://tu-api.onrender.com/api/docs`.

Cada operación documenta dos aspectos:

- **API:** qué valida, consulta o modifica el endpoint.
- **Frontend:** en qué pantalla o flujo de la web de clientes o panel administrador se puede utilizar.

La documentación incluye cuerpos de petición, parámetros, respuestas, esquemas de datos y las cookies de sesión necesarias.

## Autenticación

La API usa cookies HttpOnly en lugar de exponer JWT al navegador:

- `authAdminCookie`: sesión administrativa.
- `authClienteCookie`: sesión de cliente.
- `authEmpleadoCookie`: sesión de empleado.
- `recoveryCookie` y `registrationCookie`: flujos temporales de recuperación y registro.

Las aplicaciones web deben realizar las peticiones autenticadas con `credentials: "include"`.

## Endpoints principales

| Grupo | Base | Uso desde las aplicaciones |
| --- | --- | --- |
| Salud | `/health` | Comprobar si la API está disponible. |
| Administración | `/api/admin`, `/api/adminSettings` | Inicio de sesión y configuración del panel. |
| Servicios | `/api/services` | Catálogo público y mantenimiento del catálogo desde el panel. |
| Citas | `/api/proyects` | Reserva desde clientes, agenda y seguimiento desde el panel. |
| Clientes | `/api/clientes`, `/api/registerCliente` | Registro, perfil, inicio y cierre de sesión de clientes. |
| Empleados | `/api/empleados`, `/api/loginEmpleado` | Gestión del personal y acceso al tablero de técnicos. |
| Reseñas | `/api/reviews` | Mostrar opiniones públicas y moderarlas desde administración. |

Consulta Swagger para el detalle de cada método, sus permisos y ejemplos de consumo.

## Ejecución local

```bash
cd backend
npm install
npm run dev
```

Configura las variables de entorno a partir de [`backend/.env.example`](./backend/.env.example). No subas el archivo `.env` al repositorio.

## Despliegue en Render

El proyecto incluye [`render.yaml`](./render.yaml) con el comando de inicio, la comprobación de salud y las variables requeridas. Añade sus valores reales en el panel de Render, incluyendo `CLIENT_ORIGINS` con las URLs de los dos sitios de Vercel.
