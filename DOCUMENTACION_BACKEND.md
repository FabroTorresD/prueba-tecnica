# 📌 Información General del Proyecto

Este documento describe el funcionamiento general del backend desarrollado para la prueba técnica.

---

## 🚀 Ejecución del Proyecto

El proyecto se encuentra completamente dockerizado.

Para levantar el entorno ejecutar:

```bash
docker compose up -d --build
```

Este comando:

- Construye la imagen del backend
- Levanta MongoDB
- Inicia el servidor
- Configura la red entre servicios

Para detener los servicios:

```bash
docker compose down
```

Para eliminar también los volúmenes:

```bash
docker compose down -v
```

---

## 📘 Documentación con Swagger

Todos los endpoints están documentados con Swagger.

Una vez levantado el proyecto, la documentación se encuentra en:

```
http://localhost:3000/docs
```

Desde Swagger es posible:

- Visualizar los endpoints disponibles
- Ver los modelos y DTOs
- Probar requests
- Autenticarse mediante JWT

---

## 🔐 Autenticación

El sistema utiliza autenticación basada en JWT.

### Flujo

1. El usuario se registra o inicia sesión.
2. Se genera un `access_token`.
3. El token debe enviarse en cada request protegida:

```
Authorization: Bearer <token>
```

### Respuestas del sistema

- Sin token → `401 Unauthorized`
- Token inválido → `401 Unauthorized`
- Token expirado → `401 Unauthorized`

---

## 👤 Usuario Administrador Inicial

Al iniciar el backend se crea automáticamente un usuario con rol `ADMIN`.

### 🔑 Credenciales por defecto:

- **Email:** `admin@admin.com`
- **Password:** `admin`

Este usuario:

- Puede acceder a todos los endpoints
- Puede gestionar usuarios
- Permite probar el sistema sin configuración manual adicional

> ⚠️ Nota: Estas credenciales son únicamente para entorno de prueba/desarrollo.

---

## 🛡️ Sistema de Roles (RBAC)

Se implementó un sistema de control de acceso basado en roles.

Roles disponibles:

### 🔹 ADMIN

Puede:

- Crear usuarios
- Listar usuarios
- Ver cualquier usuario
- Actualizar cualquier usuario
- Eliminar usuarios
- Acceder a todas las funcionalidades del sistema

### 🔹 USER

Puede:

- Registrarse
- Iniciar sesión
- Ver su propio perfil
- Editar su propio perfil

No puede:

- Gestionar otros usuarios
- Acceder a endpoints administrativos

Si el usuario tiene token válido pero no posee el rol requerido → `403 Forbidden`.

---

## 🧩 Modelo de Datos

### 🧑 User

Contiene información relacionada con autenticación:

- `email`
- `passwordHash`
- `role` (USER | ADMIN)
- `deletedAt` (soft delete)
- `createdAt`
- `updatedAt`

### 👤 Profile

Se modeló como subdocumento embebido dentro de `User`.

Contiene:

- `firstName`
- `lastName`
- `birthDate`
- `phone`

### Decisión de Diseño

Se eligió modelar `Profile` como subdocumento porque:

- Es una relación 1 a 1
- Siempre se consulta junto al usuario
- Reduce complejidad
- Evita consultas adicionales
- Mantiene separación lógica entre autenticación y datos personales

---

## 🚪 Logout

El logout se implementa mediante revocación de tokens (blacklist).

Cuando un usuario hace logout:

- El identificador del token (`jti`) se guarda en base de datos
- Si el token vuelve a utilizarse, el sistema responde `401 Unauthorized`
- Los tokens revocados se eliminan automáticamente al expirar

---

## ⚠️ Manejo de Errores

El sistema responde correctamente según el escenario:

- `400` → Error de validación
- `401` → No autenticado / token inválido
- `403` → Rol insuficiente
- `409` → Conflicto (ej. email duplicado)

---

## 🏗️ Tecnologías Utilizadas

- NestJS
- MongoDB (Mongoose)
- Passport JWT
- Swagger
- Docker
- RBAC con Guards

---

## 📌 Consideraciones Finales

- Separación lógica entre autenticación y perfil.
- Implementación de soft delete.
- Protección de endpoints mediante guards.
- Arquitectura preparada para escalar a más roles o permisos en el futuro.
- Se incluye un administrador inicial para facilitar las pruebas del sistema.