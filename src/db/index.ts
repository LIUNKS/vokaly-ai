import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL || "postgresql://placeholder:placeholder@localhost:5432/postgres";
const client = postgres(connectionString, { prepare: false }); // prepare:false requerido por el pooler de Supabase (transaction mode)
export const db = drizzle(client, { schema });
