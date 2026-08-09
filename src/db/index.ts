import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL || "postgresql://placeholder:placeholder@localhost:5432/postgres";

// Reutilizar cliente a través de HMR en Next.js dev para no agotar el límite de conexiones de Supabase (EMAXCONNSESSION: 15)
const globalForDb = globalThis as unknown as { client?: postgres.Sql };
const client =
  globalForDb.client ??
  postgres(connectionString, {
    prepare: false, // requerido por el pooler de Supabase
    max: 1, // restringir a 1 conexión por proceso para evitar superar el pooler cap (15)
    idle_timeout: 15,
    connect_timeout: 10,
  });

if (process.env.NODE_ENV !== "production") globalForDb.client = client;

export const db = drizzle(client, { schema });
