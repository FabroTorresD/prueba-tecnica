const dbName = "prueba_tecnica";
const db = db.getSiblingDB(dbName);

const usersValidator = {
  $jsonSchema: {
    bsonType: "object",
    required: ["email", "passwordHash", "profile", "createdAt"],
    additionalProperties: false,
    properties: {
      _id: { bsonType: "objectId" },
        __v: { bsonType: "int" },
      email: {
        bsonType: "string",
        description: "Email obligatorio y único",
        minLength: 5,
      },
      passwordHash: {
        bsonType: "string",
        description: "Password hasheado",
        minLength: 20,
      },
      profile: {
        bsonType: "object",
        required: ["firstName", "lastName"],
        additionalProperties: false,
        properties: {
          firstName: { bsonType: "string", minLength: 1 },
          lastName: { bsonType: "string", minLength: 1 },
          birthDate: { bsonType: "date" },
          phone: { bsonType: "string" },
        },
      },
      role: {
        enum: ["USER", "ADMIN"],
      },
      createdAt: { bsonType: "date" },
      updatedAt: { bsonType: "date" },
      deletedAt: {
        bsonType: ["date", "null"],
        description: "Fecha de baja lógica",
      },
    },
  },
};

// --- Crear colección si no existe; si existe, aplicar validator ---
const collections = db.getCollectionNames();
if (!collections.includes("users")) {
  db.createCollection("users", {
    validator: usersValidator,
    validationAction: "error",
    validationLevel: "strict",
  });
} else {
  db.runCommand({
    collMod: "users",
    validator: usersValidator,
    validationAction: "error",
    validationLevel: "strict",
  });
}

// --- Índices ---
// Único por email SOLO para usuarios no borrados (soft delete friendly)
db.users.createIndex(
  { email: 1 },
  {
    unique: true,
    name: "uniq_email_not_deleted",
    partialFilterExpression: { deletedAt: null },
  },
);

// Text search
db.users.createIndex(
  {
    email: "text",
    "profile.firstName": "text",
    "profile.lastName": "text",
  },
  { name: "text_search_user" },
);

// Orden/paginado por fecha
db.users.createIndex({ createdAt: -1 }, { name: "createdAt_desc" });

// Filtrado por rol
db.users.createIndex({ role: 1 }, { name: "role_idx" });

// Filtrado por soft delete
db.users.createIndex({ deletedAt: 1 }, { name: "deletedAt_idx" });

print(`✅ Mongo init listo. DB=${dbName}, colección=users, índices creados.`);