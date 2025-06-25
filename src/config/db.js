import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import * as schema from "../db/schema.js";
import "dotenv/config.js";

const sql = neon(process.env.DB_URL);
export const db = drizzle(sql, { schema });
