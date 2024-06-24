import { Database } from "bun:sqlite";
import { writeFile } from "node:fs/promises";
import { drizzle } from "drizzle-orm/bun-sqlite";
import { env } from "~/env";
import * as schema from "./schema";

if (!(await Bun.file(env.DATABASE_URL).exists())) {
	console.log("Database file created");
	await writeFile(env.DATABASE_URL, "");

	await import("./migrate");
}

const sqlite = new Database(env.DATABASE_URL);

export const db = drizzle(sqlite, { schema });
