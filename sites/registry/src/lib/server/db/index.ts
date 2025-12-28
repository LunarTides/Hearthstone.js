import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "../../db/schema";
import { env } from "$env/dynamic/private";

if (!env.DATABASE_URL) throw new Error("DATABASE_URL is not set");

const url =
	env.NODE_ENV === "production" ? env.DATABASE_URL.replace("localhost", "registry-db") : env.DATABASE_URL;
const client = postgres(url);

export const db = drizzle(client, { schema });
