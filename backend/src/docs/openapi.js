const description = (api, frontend) => `**API:** ${api}\n\n**Frontend:** ${frontend}`;

const jsonBody = (schema) => ({
    required: true,
    content: { "application/json": { schema } },
});

const multipartBody = (schema) => ({
    required: true,
    content: { "multipart/form-data": { schema } },
});

const idParameter = (name = "id", descriptionText = "Identificador MongoDB del recurso.") => ({
    name,
    in: "path",
    required: true,
    description: descriptionText,
    schema: { type: "string", example: "65f0c4c9c49b4b30d99f1234" },
});

const pageParameters = [
    { name: "page", in: "query", description: "Página solicitada (mínimo 1).", schema: { type: "integer", minimum: 1, default: 1 } },
    { name: "limit", in: "query", description: "Cantidad por página.", schema: { type: "integer", minimum: 1, maximum: 50, default: 4 } },
];

const messageResponse = (descriptionText = "Operación realizada correctamente.") => ({
    description: descriptionText,
    content: { "application/json": { schema: { $ref: "#/components/schemas/Message" } } },
});

const errorResponses = {
    "400": messageResponse("Datos inválidos o incompletos."),
    "401": messageResponse("No hay sesión válida para la operación."),
    "403": messageResponse("La sesión no tiene permisos para esta operación."),
    "404": messageResponse("No se encontró el recurso solicitado."),
    "409": messageResponse("La operación entra en conflicto con un recurso existente."),
    "429": messageResponse("Se superó el límite temporal de solicitudes."),
    "500": messageResponse("Error interno del servidor."),
};

const adminSecurity = [{ adminCookie: [] }];
const clientSecurity = [{ clientCookie: [] }];
const employeeSecurity = [{ employeeCookie: [] }];
const staffSecurity = [{ adminCookie: [] }, { employeeCookie: [] }];
const recoverySecurity = [{ recoveryCookie: [] }];
const registrationSecurity = [{ registrationCookie: [] }];

const openapiDocument = {
    openapi: "3.0.3",
    info: {
        title: "SERTENA API",
        version: "1.0.0",
        description: "API REST de SERTENA para la gestión de clientes, servicios, empleados, citas, reseñas y administración. Los endpoints que requieren sesión usan cookies HttpOnly; desde los frontends se deben consumir con `credentials: 'include'`.",
    },
    servers: [
        { url: "http://localhost:4000", description: "Desarrollo local" },
        { url: "https://tu-api.onrender.com", description: "Producción en Render" },
    ],
    tags: [
        { name: "Salud", description: "Disponibilidad del servicio." },
        { name: "Administradores", description: "Administración de cuentas y perfil administrativo." },
        { name: "Servicios", description: "Catálogo público y gestión administrativa de servicios." },
        { name: "Citas", description: "Reservas, asignación y seguimiento de citas." },
        { name: "Clientes", description: "Registro, sesión y gestión de clientes." },
        { name: "Empleados", description: "Gestión y autenticación del personal técnico." },
        { name: "Reseñas", description: "Opiniones asociadas a servicios finalizados." },
    ],
    paths: {
        "/health": {
            get: {
                tags: ["Salud"],
                operationId: "healthCheck",
                summary: "Comprobar disponibilidad de la API",
                description: description(
                    "Responde el estado del servicio sin requerir autenticación.",
                    "Puede usarse para mostrar una alerta de conexión o para que un monitor de infraestructura compruebe que la API está activa.",
                ),
                responses: { "200": { description: "Servicio disponible.", content: { "application/json": { schema: { type: "object", properties: { status: { type: "string", example: "ok" } } } } } }, "500": errorResponses["500"] },
            },
        },
        "/api/admin": {
            get: {
                tags: ["Administradores"], operationId: "getAdmins", summary: "Listar administradores", security: adminSecurity,
                description: description("Obtiene las cuentas de administrador. Requiere la cookie `authAdminCookie`.", "El panel administrador puede usarlo para gestionar cuentas administrativas autorizadas."),
                responses: { "200": { description: "Administradores obtenidos.", content: { "application/json": { schema: { type: "array", items: { $ref: "#/components/schemas/Admin" } } } } }, ...errorResponses },
            },
        },
        "/api/admin/{id}": {
            put: {
                tags: ["Administradores"], operationId: "updateAdmin", summary: "Actualizar administrador", security: adminSecurity,
                description: description("Actualiza los datos de una cuenta administrativa identificada por `id`.", "El panel administrador puede guardar cambios de nombre, correo, estado o contraseña de un administrador."),
                parameters: [idParameter()], requestBody: jsonBody({ $ref: "#/components/schemas/AdminUpdate" }),
                responses: { "200": messageResponse("Administrador actualizado."), ...errorResponses },
            },
            delete: {
                tags: ["Administradores"], operationId: "deleteAdmin", summary: "Eliminar administrador", security: adminSecurity,
                description: description("Elimina una cuenta de administrador por su identificador.", "El panel administrador puede utilizarlo al retirar el acceso de una cuenta administrativa."),
                parameters: [idParameter()], responses: { "200": messageResponse("Administrador eliminado."), ...errorResponses },
            },
        },
        "/api/adminLogin": {
            post: {
                tags: ["Administradores"], operationId: "loginAdmin", summary: "Iniciar sesión de administrador",
                description: description("Valida credenciales, crea un JWT y lo guarda en la cookie HttpOnly `authAdminCookie` durante 30 días.", "La pantalla de inicio de sesión del panel administrador lo consume con `credentials: 'include'`; no debe intentar leer la cookie desde JavaScript."),
                requestBody: jsonBody({ $ref: "#/components/schemas/Credentials" }),
                responses: { "200": messageResponse("Sesión iniciada; la respuesta establece `authAdminCookie`."), ...errorResponses },
            },
        },
        "/api/adminLogout": {
            post: {
                tags: ["Administradores"], operationId: "logoutAdmin", summary: "Cerrar sesión de administrador", security: adminSecurity,
                description: description("Elimina la cookie `authAdminCookie` de la sesión actual.", "El botón Cerrar sesión del panel administrador debe invocarlo con `credentials: 'include'` antes de limpiar el estado local."),
                responses: { "200": messageResponse("Sesión cerrada."), ...errorResponses },
            },
        },
        "/api/adminRecovery/requestCode": {
            post: {
                tags: ["Administradores"], operationId: "requestAdminRecovery", summary: "Solicitar código de recuperación de administrador",
                description: description("Genera un código temporal, establece `recoveryCookie` y envía el código por correo HTML mediante Mailjet.", "La vista Olvidé mi contraseña del panel administrador lo usa antes de llevar al usuario al formulario de verificación."),
                requestBody: jsonBody({ $ref: "#/components/schemas/EmailRequest" }), responses: { "200": messageResponse("Código enviado y cookie temporal creada."), ...errorResponses },
            },
        },
        "/api/adminRecovery/verifyCode": {
            post: {
                tags: ["Administradores"], operationId: "verifyAdminRecovery", summary: "Verificar código de recuperación de administrador", security: recoverySecurity,
                description: description("Compara el código con el JWT de `recoveryCookie` y marca la recuperación como verificada.", "El formulario OTP del panel envía el código con `credentials: 'include'` antes de permitir escribir una nueva contraseña."),
                requestBody: jsonBody({ $ref: "#/components/schemas/CodeRequest" }), responses: { "200": messageResponse("Código verificado."), ...errorResponses },
            },
        },
        "/api/adminRecovery/newPassword": {
            post: {
                tags: ["Administradores"], operationId: "resetAdminPassword", summary: "Crear nueva contraseña de administrador", security: recoverySecurity,
                description: description("Cambia la contraseña solamente cuando `recoveryCookie` indica que el código ya fue verificado; después elimina la cookie.", "La última pantalla del flujo de recuperación del panel debe enviar ambas contraseñas con `credentials: 'include'`."),
                requestBody: jsonBody({ $ref: "#/components/schemas/NewPassword" }), responses: { "200": messageResponse("Contraseña actualizada."), ...errorResponses },
            },
        },
        "/api/adminSettings/request-password-code": {
            post: {
                tags: ["Administradores"], operationId: "requestAdminPasswordChangeCode", summary: "Solicitar código para cambio de contraseña", security: adminSecurity,
                description: description("Envía al correo del administrador autenticado un código de seis dígitos, con límite de reenvío de un minuto.", "La sección Configuración del panel lo usa para comenzar un cambio de contraseña sin cerrar la sesión."),
                responses: { "200": messageResponse("Código enviado."), ...errorResponses },
            },
        },
        "/api/adminSettings/verify-password-code": {
            post: {
                tags: ["Administradores"], operationId: "verifyAdminPasswordChangeCode", summary: "Verificar código de cambio de contraseña", security: adminSecurity,
                description: description("Valida el código enviado al administrador y habilita el cambio de contraseña durante 15 minutos.", "El formulario de configuración debe llamarlo antes de habilitar el formulario de nueva contraseña."),
                requestBody: jsonBody({ $ref: "#/components/schemas/CodeRequest" }), responses: { "200": messageResponse("Código verificado."), ...errorResponses },
            },
        },
        "/api/adminSettings/change-password": {
            post: {
                tags: ["Administradores"], operationId: "changeAdminPassword", summary: "Cambiar contraseña de administrador", security: adminSecurity,
                description: description("Guarda una nueva contraseña segura tras una verificación de código exitosa.", "La configuración del panel lo usa como el último paso del cambio de contraseña en sesión."),
                requestBody: jsonBody({ $ref: "#/components/schemas/NewPassword" }), responses: { "200": messageResponse("Contraseña actualizada."), ...errorResponses },
            },
        },
        "/api/adminSettings/profile": {
            get: {
                tags: ["Administradores"], operationId: "getAdminProfile", summary: "Obtener perfil administrativo", security: adminSecurity,
                description: description("Devuelve los datos de perfil del administrador autenticado sin exponer su contraseña.", "La pantalla Configuración del panel lo usa para precargar los datos personales y de acceso."),
                responses: { "200": { description: "Perfil obtenido.", content: { "application/json": { schema: { type: "object", properties: { data: { $ref: "#/components/schemas/AdminProfile" } } } } } }, ...errorResponses },
            },
            put: {
                tags: ["Administradores"], operationId: "updateAdminProfile", summary: "Actualizar perfil administrativo", security: adminSecurity,
                description: description("Actualiza nombre, apellido y correo solo después de completar la verificación del correo actual y del nuevo.", "La configuración del panel debe completar el flujo de verificación de correo antes de guardar el perfil."),
                requestBody: jsonBody({ $ref: "#/components/schemas/AdminProfileUpdate" }), responses: { "200": messageResponse("Perfil actualizado."), ...errorResponses },
            },
        },
        "/api/adminSettings/profile/request-current-email-code": {
            post: {
                tags: ["Administradores"], operationId: "requestCurrentAdminEmailCode", summary: "Solicitar código del correo actual", security: adminSecurity,
                description: description("Envía un código al correo actual del administrador para autorizar un cambio de correo.", "La configuración del panel lo usa al iniciar el asistente de cambio de correo."),
                responses: { "200": messageResponse("Código enviado al correo actual."), ...errorResponses },
            },
        },
        "/api/adminSettings/profile/verify-current-email-code": {
            post: {
                tags: ["Administradores"], operationId: "verifyCurrentAdminEmailCode", summary: "Verificar correo actual", security: adminSecurity,
                description: description("Verifica el código enviado al correo actual y habilita la confirmación del correo nuevo.", "El segundo paso del asistente de cambio de correo lo consume desde el panel."),
                requestBody: jsonBody({ $ref: "#/components/schemas/CodeRequest" }), responses: { "200": messageResponse("Correo actual verificado."), ...errorResponses },
            },
        },
        "/api/adminSettings/profile/request-new-email-code": {
            post: {
                tags: ["Administradores"], operationId: "requestNewAdminEmailCode", summary: "Solicitar código del correo nuevo", security: adminSecurity,
                description: description("Valida que el nuevo correo no esté en uso y le envía un código de confirmación.", "El asistente del panel lo llama cuando el administrador escribe y confirma un nuevo correo."),
                requestBody: jsonBody({ $ref: "#/components/schemas/NewEmailRequest" }), responses: { "200": messageResponse("Código enviado al correo nuevo."), ...errorResponses },
            },
        },
        "/api/adminSettings/profile/verify-new-email-code": {
            post: {
                tags: ["Administradores"], operationId: "verifyNewAdminEmailCode", summary: "Verificar correo nuevo", security: adminSecurity,
                description: description("Verifica el código enviado al correo nuevo y permite guardar el perfil.", "El panel lo usa como paso final de validación antes de enviar la actualización del perfil."),
                requestBody: jsonBody({ $ref: "#/components/schemas/CodeRequest" }), responses: { "200": messageResponse("Correo nuevo verificado."), ...errorResponses },
            },
        },
        "/api/services": {
            get: {
                tags: ["Servicios"], operationId: "getServices", summary: "Listar servicios",
                description: description("Obtiene el catálogo de servicios; admite el filtro opcional `active=true` para devolver solo servicios activos.", "La web de clientes lo usa para construir el catálogo, detalle de servicio y formulario de cita; el panel lo usa para cargar su gestión de servicios."),
                parameters: [{ name: "active", in: "query", description: "Cuando es `true`, filtra los servicios activos.", schema: { type: "boolean" } }],
                responses: { "200": { description: "Servicios obtenidos.", content: { "application/json": { schema: { type: "array", items: { $ref: "#/components/schemas/Service" } } } } }, ...errorResponses },
            },
            post: {
                tags: ["Servicios"], operationId: "createService", summary: "Crear servicio", security: adminSecurity,
                description: description("Crea un servicio y, si se adjunta `image`, la almacena mediante Cloudinary.", "El módulo Servicios del panel envía un `FormData` con la imagen opcional y los datos del catálogo."),
                requestBody: multipartBody({ $ref: "#/components/schemas/ServiceCreateForm" }), responses: { "201": messageResponse("Servicio creado."), ...errorResponses },
            },
        },
        "/api/services/{id}": {
            put: {
                tags: ["Servicios"], operationId: "updateService", summary: "Actualizar servicio", security: adminSecurity,
                description: description("Actualiza los datos de un servicio y reemplaza la imagen si se adjunta una nueva.", "El panel administrador lo usa al editar precio, descripción, estado o imagen del catálogo."),
                parameters: [idParameter()], requestBody: multipartBody({ $ref: "#/components/schemas/ServiceForm" }), responses: { "200": messageResponse("Servicio actualizado."), ...errorResponses },
            },
            delete: {
                tags: ["Servicios"], operationId: "deleteService", summary: "Eliminar servicio", security: adminSecurity,
                description: description("Elimina un servicio del catálogo por identificador.", "El panel administrador puede utilizarlo al retirar un servicio que ya no se ofrece."),
                parameters: [idParameter()], responses: { "200": messageResponse("Servicio eliminado."), ...errorResponses },
            },
        },
        "/api/proyects": {
            get: {
                tags: ["Citas"], operationId: "getAppointments", summary: "Listar citas", security: staffSecurity,
                description: description("Devuelve las citas para personal administrativo o empleados autenticados.", "El panel y el tablero de empleados lo usan para mostrar agenda, estado, cliente, servicio y técnico asignado."),
                responses: { "200": { description: "Citas obtenidas.", content: { "application/json": { schema: { type: "array", items: { $ref: "#/components/schemas/Appointment" } } } } }, ...errorResponses },
            },
            post: {
                tags: ["Citas"], operationId: "createAppointment", summary: "Crear y asignar una cita", security: clientSecurity,
                description: description("Crea una cita para un cliente autenticado y asigna automáticamente un empleado activo que preste el servicio.", "La web de clientes lo usa después de seleccionar un servicio, una ubicación y los datos de contacto en el checkout."),
                requestBody: jsonBody({ $ref: "#/components/schemas/AppointmentCreate" }), responses: { "201": { description: "Cita creada y empleado asignado.", content: { "application/json": { schema: { $ref: "#/components/schemas/AppointmentCreated" } } } }, "503": messageResponse("No hay personal o disponibilidad para la cita."), ...errorResponses },
            },
        },
        "/api/proyects/paginado": {
            get: {
                tags: ["Citas"], operationId: "getAppointmentsPaginated", summary: "Listar citas paginadas", security: adminSecurity,
                description: description("Obtiene citas paginadas para administración.", "La tabla de próximas citas del panel usa `page` y `limit` para no cargar toda la agenda de una vez."),
                parameters: pageParameters, responses: { "200": { description: "Página de citas obtenida.", content: { "application/json": { schema: { $ref: "#/components/schemas/PaginatedAppointments" } } } }, ...errorResponses },
            },
        },
        "/api/proyects/{id}": {
            put: {
                tags: ["Citas"], operationId: "updateAppointment", summary: "Actualizar una cita", security: staffSecurity,
                description: description("Actualiza datos, asignación, estado y observaciones de una cita; finalizarla requiere `completionNotes`.", "El panel administrador o el tablero de empleado lo usa para reprogramar, asignar técnico o registrar la finalización de una visita."),
                parameters: [idParameter()], requestBody: jsonBody({ $ref: "#/components/schemas/AppointmentUpdate" }), responses: { "200": messageResponse("Cita actualizada."), ...errorResponses },
            },
            delete: {
                tags: ["Citas"], operationId: "deleteAppointment", summary: "Eliminar una cita", security: adminSecurity,
                description: description("Elimina una cita por identificador.", "El panel administrador puede usarlo para cancelar y retirar una reserva inválida."),
                parameters: [idParameter()], responses: { "200": messageResponse("Cita eliminada."), ...errorResponses },
            },
        },
        "/api/proyects/searchByDate": {
            post: {
                tags: ["Citas"], operationId: "searchAppointmentsByDate", summary: "Buscar citas por fecha", security: adminSecurity,
                description: description("Busca citas cuyo intervalo incluya la fecha indicada.", "El filtro de calendario del panel administrador lo usa para mostrar la agenda de un día específico."),
                requestBody: jsonBody({ $ref: "#/components/schemas/DateRequest" }), responses: { "200": { description: "Citas encontradas.", content: { "application/json": { schema: { type: "array", items: { $ref: "#/components/schemas/Appointment" } } } } }, ...errorResponses },
            },
        },
        "/api/clientes/crear": {
            post: {
                tags: ["Clientes"], operationId: "createClient", summary: "Crear cliente desde administración",
                description: description("Crea directamente un cliente con los datos recibidos.", "El panel administrador puede utilizarlo para dar de alta manualmente a un cliente sin pasar por el proceso de verificación pública."),
                requestBody: jsonBody({ $ref: "#/components/schemas/ClientCreate" }), responses: { "201": messageResponse("Cliente creado."), ...errorResponses },
            },
        },
        "/api/clientes/obtener": {
            get: {
                tags: ["Clientes"], operationId: "getClients", summary: "Listar clientes", security: adminSecurity,
                description: description("Devuelve todos los clientes registrados. Requiere sesión de administrador.", "La tabla Clientes del panel administrador lo usa para consultar y gestionar la cartera completa."),
                responses: { "200": { description: "Clientes obtenidos.", content: { "application/json": { schema: { type: "array", items: { $ref: "#/components/schemas/Client" } } } } }, ...errorResponses },
            },
        },
        "/api/clientes/paginado": {
            get: {
                tags: ["Clientes"], operationId: "getClientsPaginated", summary: "Listar clientes paginados", security: adminSecurity,
                description: description("Obtiene clientes con paginación.", "El panel administrador lo usa en tablas grandes para cargar solamente la página visible."),
                parameters: pageParameters, responses: { "200": { description: "Página de clientes obtenida.", content: { "application/json": { schema: { $ref: "#/components/schemas/PaginatedClients" } } } }, ...errorResponses },
            },
        },
        "/api/clientes/actualizar/{id}": {
            put: {
                tags: ["Clientes"], operationId: "updateClient", summary: "Actualizar cliente", security: clientSecurity,
                description: description("Actualiza la cuenta del cliente cuya sesión está activa. Acepta una foto de perfil opcional.", "La página Perfil de clientes envía `FormData` con nombre, correo, contraseña opcional e imagen usando `credentials: 'include'`."),
                parameters: [idParameter("id", "Identificador del cliente a actualizar.")], requestBody: multipartBody({ $ref: "#/components/schemas/ClientUpdateForm" }), responses: { "200": messageResponse("Cliente actualizado."), ...errorResponses },
            },
        },
        "/api/clientes/eliminar/{id}": {
            delete: {
                tags: ["Clientes"], operationId: "deleteClient", summary: "Eliminar cuenta de cliente", security: clientSecurity,
                description: description("Elimina la propia cuenta del cliente autenticado.", "La opción Eliminar cuenta del perfil de cliente lo consume con `credentials: 'include'` después de una confirmación explícita."),
                parameters: [idParameter("id", "Identificador del cliente a eliminar.")], responses: { "200": messageResponse("Cliente eliminado."), ...errorResponses },
            },
        },
        "/api/registerCliente": {
            post: {
                tags: ["Clientes"], operationId: "registerClient", summary: "Solicitar registro de cliente",
                description: description("Valida que el correo no exista, crea `registrationCookie` temporal y envía un código HTML de verificación.", "La página Crear cuenta de la web de clientes lo invoca y después navega al formulario donde se ingresa el código recibido."),
                requestBody: jsonBody({ $ref: "#/components/schemas/ClientRegistration" }), responses: { "200": messageResponse("Código de verificación enviado."), ...errorResponses },
            },
        },
        "/api/registerCliente/verifyCodeEmail": {
            post: {
                tags: ["Clientes"], operationId: "verifyClientRegistration", summary: "Confirmar registro de cliente", security: registrationSecurity,
                description: description("Verifica el código de `registrationCookie`, crea la cuenta en la base de datos y elimina la cookie temporal.", "La página de verificación de registro debe enviarlo con `credentials: 'include'` para completar la creación de cuenta."),
                requestBody: jsonBody({ $ref: "#/components/schemas/RegistrationCodeRequest" }), responses: { "200": messageResponse("Cliente registrado."), ...errorResponses },
            },
        },
        "/api/loginCliente": {
            post: {
                tags: ["Clientes"], operationId: "loginClient", summary: "Iniciar sesión de cliente",
                description: description("Valida correo y `contraseña`, y establece la cookie HttpOnly `authClienteCookie`.", "El formulario de inicio de sesión de clientes lo usa con `credentials: 'include'` y guarda solo los datos públicos devueltos para pintar la interfaz."),
                requestBody: jsonBody({ $ref: "#/components/schemas/ClientCredentials" }), responses: { "200": { description: "Sesión iniciada.", content: { "application/json": { schema: { $ref: "#/components/schemas/ClientLoginResponse" } } } }, ...errorResponses },
            },
        },
        "/api/logoutCliente": {
            post: {
                tags: ["Clientes"], operationId: "logoutClient", summary: "Cerrar sesión de cliente", security: clientSecurity,
                description: description("Elimina `authClienteCookie` de la sesión actual.", "El menú de perfil de la web de clientes lo invoca antes de limpiar su estado de autenticación local."),
                responses: { "200": messageResponse("Sesión cerrada."), ...errorResponses },
            },
        },
        "/api/clienteRecovery/requestCode": {
            post: {
                tags: ["Clientes"], operationId: "requestClientRecovery", summary: "Solicitar código de recuperación de cliente",
                description: description("Envía por correo HTML un código y guarda su estado temporal en `recoveryCookie`.", "La vista de recuperación de la web de clientes lo consume tras introducir el correo de la cuenta."),
                requestBody: jsonBody({ $ref: "#/components/schemas/EmailRequest" }), responses: { "200": messageResponse("Código enviado."), ...errorResponses },
            },
        },
        "/api/clienteRecovery/verifyCode": {
            post: {
                tags: ["Clientes"], operationId: "verifyClientRecovery", summary: "Verificar código de recuperación de cliente", security: recoverySecurity,
                description: description("Valida el código de recuperación y actualiza la cookie para habilitar el cambio de contraseña.", "La pantalla OTP de clientes lo llama con `credentials: 'include'` antes de abrir el formulario de nueva contraseña."),
                requestBody: jsonBody({ $ref: "#/components/schemas/CodeRequest" }), responses: { "200": messageResponse("Código verificado."), ...errorResponses },
            },
        },
        "/api/clienteRecovery/newPassword": {
            post: {
                tags: ["Clientes"], operationId: "resetClientPassword", summary: "Crear nueva contraseña de cliente", security: recoverySecurity,
                description: description("Actualiza la contraseña del cliente si el código de recuperación fue verificado y limpia la cookie temporal.", "El formulario final de recuperación de la web de clientes lo usa con ambas contraseñas y `credentials: 'include'`."),
                requestBody: jsonBody({ $ref: "#/components/schemas/NewPassword" }), responses: { "200": messageResponse("Contraseña actualizada."), ...errorResponses },
            },
        },
        "/api/empleados/crear": {
            post: {
                tags: ["Empleados"], operationId: "createEmployee", summary: "Crear empleado", security: adminSecurity,
                description: description("Crea un empleado y vincula los servicios que puede atender.", "La sección Empleados del panel administrador lo usa para dar de alta técnicos y definir sus especialidades."),
                requestBody: jsonBody({ $ref: "#/components/schemas/EmployeeInput" }), responses: { "201": messageResponse("Empleado creado."), ...errorResponses },
            },
        },
        "/api/empleados/obtener": {
            get: {
                tags: ["Empleados"], operationId: "getEmployees", summary: "Listar empleados", security: staffSecurity,
                description: description("Devuelve los empleados para una sesión administrativa o de empleado.", "El panel lo usa para asignar citas y el tablero de empleados puede usarlo para mostrar datos del equipo."),
                responses: { "200": { description: "Empleados obtenidos.", content: { "application/json": { schema: { type: "array", items: { $ref: "#/components/schemas/Employee" } } } } }, ...errorResponses },
            },
        },
        "/api/empleados/paginado": {
            get: {
                tags: ["Empleados"], operationId: "getEmployeesPaginated", summary: "Listar empleados paginados", security: adminSecurity,
                description: description("Obtiene empleados usando paginación.", "La tabla de personal del panel administrador lo usa para paginar el directorio de técnicos."),
                parameters: pageParameters, responses: { "200": { description: "Página de empleados obtenida.", content: { "application/json": { schema: { $ref: "#/components/schemas/PaginatedEmployees" } } } }, ...errorResponses },
            },
        },
        "/api/empleados/actualizar/{id}": {
            put: {
                tags: ["Empleados"], operationId: "updateEmployee", summary: "Actualizar empleado", security: adminSecurity,
                description: description("Actualiza información, disponibilidad y servicios asignados de un empleado.", "El formulario de edición de empleados del panel lo usa para mantener sus datos y especialidades actualizados."),
                parameters: [idParameter("id", "Identificador del empleado a actualizar.")], requestBody: jsonBody({ $ref: "#/components/schemas/EmployeeUpdateInput" }), responses: { "200": messageResponse("Empleado actualizado."), ...errorResponses },
            },
        },
        "/api/empleados/eliminar/{id}": {
            delete: {
                tags: ["Empleados"], operationId: "deleteEmployee", summary: "Eliminar empleado", security: adminSecurity,
                description: description("Elimina un empleado por identificador.", "El panel administrador lo usa al retirar definitivamente a un técnico del sistema."),
                parameters: [idParameter("id", "Identificador del empleado a eliminar.")], responses: { "200": messageResponse("Empleado eliminado."), ...errorResponses },
            },
        },
        "/api/loginEmpleado": {
            post: {
                tags: ["Empleados"], operationId: "loginEmployee", summary: "Iniciar sesión de empleado",
                description: description("Valida las credenciales de un empleado y establece `authEmpleadoCookie`.", "La misma pantalla de acceso del panel puede usarlo cuando el correo no corresponde a un administrador, conservando `credentials: 'include'`."),
                requestBody: jsonBody({ $ref: "#/components/schemas/Credentials" }), responses: { "200": messageResponse("Sesión de empleado iniciada."), ...errorResponses },
            },
        },
        "/api/logoutEmpleado": {
            post: {
                tags: ["Empleados"], operationId: "logoutEmployee", summary: "Cerrar sesión de empleado", security: employeeSecurity,
                description: description("Elimina la cookie `authEmpleadoCookie` de la sesión actual.", "El botón Cerrar sesión del tablero de técnicos lo usa para terminar el acceso."),
                responses: { "200": messageResponse("Sesión cerrada."), ...errorResponses },
            },
        },
        "/api/empleadoRecovery/requestCode": {
            post: {
                tags: ["Empleados"], operationId: "requestEmployeeRecovery", summary: "Solicitar código de recuperación de empleado",
                description: description("Envía un código HTML de recuperación al empleado y crea `recoveryCookie` temporal.", "El flujo de contraseña olvidada del tablero de empleados lo llama después de capturar el correo."),
                requestBody: jsonBody({ $ref: "#/components/schemas/EmailRequest" }), responses: { "200": messageResponse("Código enviado."), ...errorResponses },
            },
        },
        "/api/empleadoRecovery/verifyCode": {
            post: {
                tags: ["Empleados"], operationId: "verifyEmployeeRecovery", summary: "Verificar código de recuperación de empleado", security: recoverySecurity,
                description: description("Valida el código guardado en `recoveryCookie` y habilita la actualización de contraseña.", "El formulario OTP de recuperación de empleados lo consume con `credentials: 'include'`."),
                requestBody: jsonBody({ $ref: "#/components/schemas/CodeRequest" }), responses: { "200": messageResponse("Código verificado."), ...errorResponses },
            },
        },
        "/api/empleadoRecovery/newPassword": {
            post: {
                tags: ["Empleados"], operationId: "resetEmployeePassword", summary: "Crear nueva contraseña de empleado", security: recoverySecurity,
                description: description("Guarda una contraseña nueva únicamente cuando el código de recuperación fue validado.", "La pantalla final de recuperación del tablero de empleados lo usa para completar el flujo."),
                requestBody: jsonBody({ $ref: "#/components/schemas/NewPassword" }), responses: { "200": messageResponse("Contraseña actualizada."), ...errorResponses },
            },
        },
        "/api/reviews": {
            get: {
                tags: ["Reseñas"], operationId: "getReviews", summary: "Listar reseñas públicas",
                description: description("Obtiene las reseñas junto con el cliente y servicio asociados.", "La web de clientes lo usa para mostrar experiencias y calificaciones en la sección pública de reseñas."),
                responses: { "200": { description: "Reseñas obtenidas.", content: { "application/json": { schema: { type: "array", items: { $ref: "#/components/schemas/Review" } } } } }, ...errorResponses },
            },
            post: {
                tags: ["Reseñas"], operationId: "createReview", summary: "Crear reseña", security: clientSecurity,
                description: description("Crea una reseña solo si el cliente autenticado recibió y finalizó el servicio, y todavía no lo ha reseñado.", "La web de clientes lo usa desde el formulario de reseña después de iniciar sesión y seleccionar un servicio finalizado."),
                requestBody: jsonBody({ $ref: "#/components/schemas/ReviewInput" }), responses: { "201": messageResponse("Reseña creada."), ...errorResponses },
            },
        },
        "/api/reviews/paginado": {
            get: {
                tags: ["Reseñas"], operationId: "getReviewsPaginated", summary: "Listar reseñas paginadas",
                description: description("Obtiene reseñas en páginas de hasta 50 elementos.", "El panel administrador lo usa para cargar y moderar la tabla de reseñas sin descargar todo el historial."),
                parameters: pageParameters, responses: { "200": { description: "Página de reseñas obtenida.", content: { "application/json": { schema: { $ref: "#/components/schemas/PaginatedReviews" } } } }, ...errorResponses },
            },
        },
        "/api/reviews/customer/{idCustomer}": {
            get: {
                tags: ["Reseñas"], operationId: "getCustomerReviews", summary: "Listar reseñas de un cliente", security: clientSecurity,
                description: description("Obtiene las reseñas asociadas al identificador de cliente indicado.", "El perfil de cliente puede usarlo para listar sus opiniones y servicios reseñados."),
                parameters: [idParameter("idCustomer", "Identificador del cliente cuyas reseñas se consultan.")], responses: { "200": { description: "Reseñas del cliente obtenidas.", content: { "application/json": { schema: { type: "array", items: { $ref: "#/components/schemas/Review" } } } } }, ...errorResponses },
            },
        },
        "/api/reviews/{id}": {
            put: {
                tags: ["Reseñas"], operationId: "updateReview", summary: "Actualizar reseña", security: adminSecurity,
                description: description("Actualiza una reseña y valida que la calificación se mantenga entre 1 y 5.", "El panel administrador lo puede usar para moderar o corregir una reseña autorizada."),
                parameters: [idParameter("id", "Identificador de la reseña a actualizar.")], requestBody: jsonBody({ $ref: "#/components/schemas/ReviewInput" }), responses: { "200": messageResponse("Reseña actualizada."), ...errorResponses },
            },
            delete: {
                tags: ["Reseñas"], operationId: "deleteReview", summary: "Eliminar reseña", security: adminSecurity,
                description: description("Elimina una reseña por identificador.", "El panel administrador lo utiliza para retirar contenido que no deba permanecer publicado."),
                parameters: [idParameter("id", "Identificador de la reseña a eliminar.")], responses: { "200": messageResponse("Reseña eliminada."), ...errorResponses },
            },
        },
    },
    components: {
        securitySchemes: {
            adminCookie: { type: "apiKey", in: "cookie", name: "authAdminCookie", description: "Cookie HttpOnly creada por `/api/adminLogin`." },
            clientCookie: { type: "apiKey", in: "cookie", name: "authClienteCookie", description: "Cookie HttpOnly creada por `/api/loginCliente`." },
            employeeCookie: { type: "apiKey", in: "cookie", name: "authEmpleadoCookie", description: "Cookie HttpOnly creada por `/api/loginEmpleado`." },
            recoveryCookie: { type: "apiKey", in: "cookie", name: "recoveryCookie", description: "Cookie temporal del flujo de recuperación." },
            registrationCookie: { type: "apiKey", in: "cookie", name: "registrationCookie", description: "Cookie temporal del flujo de registro de clientes." },
        },
        schemas: {
            Message: { type: "object", properties: { message: { type: "string", example: "Operación realizada correctamente" } } },
            Credentials: { type: "object", required: ["email", "password"], properties: { email: { type: "string", format: "email", example: "admin@sertena.com" }, password: { type: "string", format: "password", example: "ClaveSegura123" } } },
            ClientCredentials: { type: "object", required: ["email", "contraseña"], properties: { email: { type: "string", format: "email", example: "cliente@correo.com" }, contraseña: { type: "string", format: "password", example: "ClaveSegura123" } } },
            EmailRequest: { type: "object", required: ["email"], properties: { email: { type: "string", format: "email", example: "usuario@correo.com" } } },
            CodeRequest: { type: "object", required: ["code"], properties: { code: { type: "string", example: "123456", description: "Código de seis dígitos para configuración o hexadecimal de seis caracteres en recuperaciones heredadas." } } },
            RegistrationCodeRequest: { type: "object", required: ["verificationCodeRequest"], properties: { verificationCodeRequest: { type: "string", example: "a1b2c3" } } },
            NewPassword: { type: "object", required: ["newPassword", "confirmNewPassword"], properties: { newPassword: { type: "string", format: "password", example: "NuevaClave123" }, confirmNewPassword: { type: "string", format: "password", example: "NuevaClave123" } } },
            NewEmailRequest: { type: "object", required: ["newEmail"], properties: { newEmail: { type: "string", format: "email", example: "nuevo@sertena.com" } } },
            DateRequest: { type: "object", required: ["date"], properties: { date: { type: "string", format: "date", example: "2026-09-15" } } },
            Admin: { type: "object", properties: { _id: { type: "string" }, name: { type: "string" }, lastName: { type: "string" }, email: { type: "string", format: "email" }, status: { type: "boolean" }, createdAt: { type: "string", format: "date-time" } } },
            AdminUpdate: { type: "object", required: ["name", "email", "password"], properties: { name: { type: "string", minLength: 3, maxLength: 15 }, lastName: { type: "string" }, email: { type: "string", format: "email" }, password: { type: "string", format: "password" }, status: { type: "boolean" } } },
            AdminProfile: { type: "object", properties: { name: { type: "string" }, lastName: { type: "string" }, email: { type: "string", format: "email" }, status: { type: "boolean" }, timeOut: { type: "string", format: "date-time", nullable: true }, createdAt: { type: "string", format: "date-time" } } },
            AdminProfileUpdate: { type: "object", required: ["name", "lastName", "email"], properties: { name: { type: "string", example: "Ana" }, lastName: { type: "string", example: "Gómez" }, email: { type: "string", format: "email", example: "ana.gomez@sertena.com" } } },
            Service: { type: "object", properties: { _id: { type: "string" }, nameService: { type: "string", example: "Mantenimiento de aire acondicionado" }, imgUrl: { type: "string", format: "uri" }, description: { type: "string" }, price: { type: "number", example: 75 }, status: { type: "boolean", example: true } } },
            ServiceForm: { type: "object", required: ["nameService", "description", "price"], properties: { nameService: { type: "string" }, description: { type: "string" }, price: { type: "number" }, status: { type: "boolean", default: true }, image: { type: "string", format: "binary", description: "Imagen opcional al actualizar el servicio." } } },
            ServiceCreateForm: { allOf: [{ $ref: "#/components/schemas/ServiceForm" }, { type: "object", required: ["image"], properties: { image: { type: "string", format: "binary", description: "Imagen obligatoria al crear el servicio." } } }] },
            Client: { type: "object", properties: { _id: { type: "string" }, nombre: { type: "string" }, email: { type: "string", format: "email" }, tipo: { type: "string", example: "persona" }, isVerified: { type: "boolean" }, fotoPerfil: { type: "string", format: "uri" } } },
            ClientCreate: { type: "object", required: ["nombre", "email", "contraseña"], properties: { nombre: { type: "string", example: "María López" }, email: { type: "string", format: "email" }, contraseña: { type: "string", format: "password" }, tipo: { type: "string", example: "persona" }, isVerified: { type: "boolean", default: true } } },
            ClientRegistration: { type: "object", required: ["nombre", "email", "contraseña"], properties: { nombre: { type: "string", example: "María López" }, email: { type: "string", format: "email" }, contraseña: { type: "string", format: "password" }, tipo: { type: "string", example: "persona" }, isVerified: { type: "boolean", default: false } } },
            ClientUpdateForm: { type: "object", required: ["nombre", "email"], properties: { nombre: { type: "string" }, email: { type: "string", format: "email" }, contraseña: { type: "string", format: "password" }, password: { type: "string", format: "password", description: "Alias aceptado para contraseña." }, tipo: { type: "string" }, isVerified: { type: "boolean" }, image: { type: "string", format: "binary" } } },
            ClientLoginResponse: { type: "object", properties: { message: { type: "string", example: "Login successfully" }, data: { type: "object", properties: { id: { type: "string" }, nombre: { type: "string" }, email: { type: "string", format: "email" } } } } },
            Employee: { type: "object", properties: { _id: { type: "string" }, nombre: { type: "string" }, apellido: { type: "string" }, email: { type: "string", format: "email" }, salario: { type: "number" }, status: { type: "boolean" }, services: { type: "array", items: { type: "string" } } } },
            EmployeeInput: { type: "object", required: ["nombre", "apellido", "email", "contraseña", "salario"], properties: { nombre: { type: "string", example: "Carlos" }, apellido: { type: "string", example: "Pérez" }, email: { type: "string", format: "email" }, contraseña: { type: "string", format: "password" }, salario: { type: "number", example: 500 }, status: { type: "boolean", default: true }, services: { type: "array", items: { type: "string", example: "65f0c4c9c49b4b30d99f1234" } } } },
            EmployeeUpdateInput: { type: "object", required: ["nombre", "apellido", "email", "salario"], properties: { nombre: { type: "string", example: "Carlos" }, apellido: { type: "string", example: "Pérez" }, email: { type: "string", format: "email" }, contraseña: { type: "string", format: "password", description: "Opcional: solo cambia la contraseña si se proporciona." }, salario: { type: "number", example: 500 }, status: { type: "boolean" }, services: { type: "array", items: { type: "string" } } } },
            Coordinates: { type: "object", required: ["latitude", "longitude"], properties: { latitude: { type: "number", example: 13.6929 }, longitude: { type: "number", example: -89.2182 } } },
            Appointment: { type: "object", properties: { _id: { type: "string" }, idService: { oneOf: [{ type: "string" }, { $ref: "#/components/schemas/Service" }] }, idCustomer: { oneOf: [{ type: "string" }, { $ref: "#/components/schemas/Client" }] }, idEmpleado: { oneOf: [{ type: "string" }, { $ref: "#/components/schemas/Employee" }] }, dateStart: { type: "string", format: "date-time" }, dateEnd: { type: "string", format: "date-time" }, clientPhone: { type: "string" }, clientDirection: { type: "string" }, clientLocation: { type: "string" }, clientCoordinates: { $ref: "#/components/schemas/Coordinates" }, clientMapUrl: { type: "string", format: "uri" }, finalPrice: { type: "number" }, status: { type: "string", enum: ["Programado", "Finalizado", "Atrasado"] }, isCompleted: { type: "boolean" }, completionNotes: { type: "string" } } },
            AppointmentCreate: { type: "object", required: ["idService", "idCustomer", "clientPhone", "clientDirection", "clientLocation", "finalPrice"], properties: { idService: { type: "string" }, idCustomer: { type: "string", description: "Identificador del cliente para el que se crea la cita." }, clientPhone: { type: "string", example: "+503 2222-2222" }, clientDirection: { type: "string" }, clientLocation: { type: "string" }, clientCoordinates: { $ref: "#/components/schemas/Coordinates" }, clientMapUrl: { type: "string", format: "uri", example: "https://www.google.com/maps?q=13.6929,-89.2182" }, finalPrice: { oneOf: [{ type: "number", example: 75 }, { type: "string", example: "75" }] }, description: { type: "string" } } },
            AppointmentUpdate: { allOf: [{ $ref: "#/components/schemas/AppointmentCreate" }, { type: "object", properties: { idEmpleado: { type: "string" }, dateStart: { type: "string", format: "date-time" }, dateEnd: { type: "string", format: "date-time" }, status: { type: "string", enum: ["Programado", "Finalizado", "Atrasado"] }, isCompleted: { type: "boolean" }, completionNotes: { type: "string", description: "Obligatorio al finalizar una cita." } } }] },
            AppointmentCreated: { type: "object", properties: { message: { type: "string" }, assignedDate: { type: "string", format: "date-time" }, employeeName: { type: "string" }, data: { $ref: "#/components/schemas/Appointment" } } },
            Review: { type: "object", properties: { _id: { type: "string" }, idCustomer: { oneOf: [{ type: "string" }, { $ref: "#/components/schemas/Client" }] }, idService: { oneOf: [{ type: "string" }, { $ref: "#/components/schemas/Service" }] }, rating: { type: "integer", minimum: 1, maximum: 5 }, comment: { type: "string" }, createdAt: { type: "string", format: "date-time" } } },
            ReviewInput: { type: "object", required: ["idCustomer", "idService", "rating"], properties: { idCustomer: { type: "string" }, idService: { type: "string" }, rating: { type: "integer", minimum: 1, maximum: 5, example: 5 }, comment: { type: "string", example: "Servicio puntual y profesional." } } },
            PaginatedClients: { type: "object", properties: { data: { type: "array", items: { $ref: "#/components/schemas/Client" } }, total: { type: "integer" }, page: { type: "integer" }, totalPages: { type: "integer" } } },
            PaginatedEmployees: { type: "object", properties: { data: { type: "array", items: { $ref: "#/components/schemas/Employee" } }, total: { type: "integer" }, page: { type: "integer" }, totalPages: { type: "integer" } } },
            PaginatedAppointments: { type: "object", properties: { data: { type: "array", items: { $ref: "#/components/schemas/Appointment" } }, total: { type: "integer" }, page: { type: "integer" }, totalPages: { type: "integer" } } },
            PaginatedReviews: { type: "object", properties: { data: { type: "array", items: { $ref: "#/components/schemas/Review" } }, total: { type: "integer" }, page: { type: "integer" }, totalPages: { type: "integer" } } },
        },
    },
};

export default openapiDocument;
