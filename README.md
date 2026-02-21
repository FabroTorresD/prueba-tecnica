# 🚀 Prueba Técnica Backend  
## NestJS + MongoDB

Este proyecto implementa una API REST desarrollada con **NestJS** y **MongoDB**.

La base de datos está modelada utilizando una colección principal `users`, donde el **perfil del usuario se encuentra embebido (embedding)** dentro del documento para optimizar lecturas y simplificar el modelo de datos.

---

# 📌 Tecnologías

- Node.js 20+
- NestJS
- MongoDB 7 (Docker)
- Mongoose
- Swagger (OpenAPI)
- JWT Authentication (opcional)

---

# 🏗 Arquitectura de Datos (MongoDB)

## Base de Datos

- **Nombre:** `prueba_tecnica`

---

## 📂 Colecciones

### 1️⃣ `users`

Colección principal que almacena:

- Credenciales del usuario
- Información de perfil embebida
- Rol
- Timestamps automáticos
- Soft delete mediante `deletedAt`

Se utiliza **embedding** en lugar de referencias porque:

- El perfil siempre se consulta junto con el usuario
- No se requieren joins
- Mejora performance
- Simplifica el modelo

---

## 📘 Modelo (Schema lógico)

| Campo | Tipo | Descripción |
|-------|------|------------|
| `_id` | ObjectId | Identificador único |
| `email` | string | Único |
| `passwordHash` | string | Contraseña hasheada con bcrypt |
| `role` | `"USER"` \| `"ADMIN"` | Rol del usuario |
| `profile.firstName` | string | Nombre |
| `profile.lastName` | string | Apellido |
| `profile.birthDate` | Date | Fecha de nacimiento |
| `profile.phone` | string \| null | Teléfono |
| `createdAt` | Date | Fecha de creación |
| `updatedAt` | Date | Fecha de actualización |
| `deletedAt` | Date \| null | Baja lógica |

---
