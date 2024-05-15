import { Database } from "bun:sqlite"

// Create a database instance
export const db = new Database("db.sqlite")

// Setup a mock database
db.exec(`CREATE TABLE IF NOT EXISTS counter (id INTEGER PRIMARY KEY, value INTEGER)`)
db.exec(`INSERT OR IGNORE INTO counter (id, value) VALUES (1, 0)`)
