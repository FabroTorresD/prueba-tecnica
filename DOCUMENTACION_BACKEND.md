# 📌 Documentación Técnica Backend

Este documento describe en detalle la arquitectura y decisiones técnicas del backend.

---

# 🏗 Arquitectura

## Framework

- NestJS
- Arquitectura modular
- Separación por dominios (Auth / Users)

---

# 🔐 Autenticación

Se implementa autenticación basada en JWT utilizando:

- `@nestjs/jwt`
- `passport-jwt`
- Guards personalizados

## Flujo

1. Login
2. Generación de `access_token`
3. Validación del token mediante `JwtAuthGuard`

## Manejo de errores

- `401` → No autenticado / token inválido
- `403` → Rol insuficiente

---

# 🛡️ RBAC (Role-Based Access Control)

Se implementa control de acceso basado en roles.

Roles definidos:

- `USER`
- `ADMIN`

Se utilizan:

- Decorador `@Roles()`
- `RolesGuard`
- `JwtAuthGuard`


# 🧩 Modelo de Datos

## Embedding

Se modeló `Profile` como subdocumento embebido dentro de `User`.

Ventajas:

- Relación 1 a 1
- Perfil siempre consultado junto al usuario
- No requiere joins
- Mejor performance
- Modelo más simple

---

# 🗃 Soft Delete

Se implementa soft delete mediante el campo:

```
deletedAt: Date | null
```

Esto permite:

- Mantener historial
- Evitar eliminación física
- Permitir restauración futura

---

# 🐳 Docker
El proyecto incluye:

- MongoDB
- Mongo Express
- Backend NestJS

Configurado para ejecutarse mediante:

```bash
docker compose up -d --build
```

No requiere configuración adicional.
