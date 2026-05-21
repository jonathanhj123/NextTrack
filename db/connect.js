import pg from "pg";
import dotenv from "dotenv";


// Loads the .env file
dotenv.config();
const env = {
  // Address of the Database server
  host: process.env.pg_host,
  // The port and converts it from a string to integer
  port: parseInt(process.env.pg_port),
  // Name of the Database
  database: process.env.pg_database,
  // Username
  user: process.env.pg_user,
  // Password
  password: process.env.pg_password,
  
  ssl: { rejectUnauthorized: false },
};


// Connects to the Database for a single client
export async function connect() {
  // Creates a database client
  const client = new pg.Client(env);
  // Connects asynchronosly to the Database
  await client.connect();
  // Returns the Client, that is connected to the Database
  return client;
}


// Creates a connection pool, in order to manage multiple connections
export function pool() {
  // Returns the pool
  return new pg.Pool(env);
}
