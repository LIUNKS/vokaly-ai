import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL || "postgresql://placeholder:placeholder@localhost:5432/postgres";

// reuse client across Next.js dev HMR reloads, else each reload leaks a connection
// until the Supabase pooler's session cap (15) is exhausted
const globalForDb = globalThis as unknown as { client?: postgres.Sql };
const client =
  globalForDb.client ?? postgres(connectionString, { prepare: false }); // prepare:false requerido por el pooler de Supabase (transaction mode)
if (process.env.NODE_ENV !== "production") globalForDb.client = client;

export const db = drizzle(client, { schema });
