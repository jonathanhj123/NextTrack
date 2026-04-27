import pg from "pg";
import dotenv from "dotenv";

dotenv.config();
const env = {
  host: process.env.pg_host,
  port: parseInt(process.env.pg_port),
  database: process.env.pg_database,
  user: process.env.pg_user,
  password: process.env.pg_password,
  ssl: { rejectUnauthorized: false },
};

export async function connect() {
  const client = new pg.Client(env);
  await client.connect();
  return client;
}

export function pool() {
  return new pg.Pool(env);
}
