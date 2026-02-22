# 🚀 Prueba Técnica Backend  
## NestJS + MongoDB

Este proyecto implementa una API REST desarrollada con **NestJS** y **MongoDB**, utilizando autenticación basada en JWT y control de acceso por roles (RBAC).

La base de datos está modelada utilizando una colección principal `users`, donde el **perfil del usuario se encuentra embebido (embedding)** dentro del documento para optimizar lecturas y simplificar el modelo de datos.

---

# 📌 Tecnologías

- Node.js 20+
- NestJS
- MongoDB 7 (Docker)
- Mongoose
- Swagger (OpenAPI)
- JWT Authentication
- RBAC con Guards
- Docker

---

# 🚀 Cómo Ejecutar el Proyecto

El proyecto se encuentra completamente dockerizado.

Para levantar el entorno:

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

# 🌐 Accesos

- API:  
  ```
  http://localhost:3000
  ```

- Swagger:  
  ```
  http://localhost:3000/docs
  ```

- Mongo Express:  
  ```
  http://localhost:8081
  ```
  Usuario: `admin`  
  Password: `admin`

---

# 🔑 Usuario Administrador Inicial

Al iniciar el backend se crea automáticamente un usuario con rol `ADMIN`.

Credenciales por defecto:

- **Email:** `admin@admin.com`
- **Password:** `admin`

> ⚠️ Estas credenciales son únicamente para entorno de prueba.

---

# 🔐 Autenticación

El sistema utiliza autenticación basada en JWT.

Flujo:

1. Registro o login
2. Se genera un `access_token`
3. El token se envía en cada request protegida:

```
Authorization: Bearer <token>
```

Respuestas del sistema:

- `401 Unauthorized` → Token inválido o ausente
- `403 Forbidden` → Rol insuficiente

---

# 🛡️ Sistema de Roles (RBAC)

### 🔹 ADMIN
Puede:
- Crear usuarios
- Listar usuarios
- Ver cualquier usuario
- Actualizar cualquier usuario
- Eliminar usuarios

### 🔹 USER
Puede:
- Registrarse
- Iniciar sesión
- Ver su propio perfil
- Editar su propio perfil

---

# 🧩 Modelo de Datos

## Base de Datos

- Nombre: `prueba_tecnica`

## Colección `users`

| Campo | Tipo | Descripción |
|-------|------|------------|
| `_id` | ObjectId | Identificador único |
| `email` | string | Único |
| `passwordHash` | string | Hasheado con bcrypt |
| `role` | `"USER"` \| `"ADMIN"` | Rol |
| `profile.firstName` | string | Nombre |
| `profile.lastName` | string | Apellido |
| `profile.birthDate` | Date | Fecha de nacimiento |
| `profile.phone` | string \| null | Teléfono |
| `createdAt` | Date | Creación |
| `updatedAt` | Date | Actualización |
| `deletedAt` | Date \| null | Soft delete |

---

# 📘 Documentación Detallada

Para información técnica ampliada consultar:

```
DOCUMENTACION_BACKEND.md
```

---

# 📌 Consideraciones

- Perfil embebido para optimizar consultas.
- Soft delete implementado.
- Protección mediante Guards.
- Arquitectura preparada para escalar roles.