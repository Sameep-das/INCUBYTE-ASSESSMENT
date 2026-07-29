import "dotenv/config";

import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "../db/schema/index.js";

const connectionString = process.env.DATABASE_URL!;

const client = postgres(connectionString, {
    prepare: false,
});

const db = drizzle(client, {schema});

export default db;