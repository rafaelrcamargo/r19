import { Database } from "bun:sqlite";
import { resolve, join } from "path"

export const db = new Database(join(resolve("data"), "db.sqlite"));
db.exec(`CREATE TABLE IF NOT EXISTS counter (id INTEGER PRIMARY KEY, value INTEGER)`);
db.exec(`INSERT OR IGNORE INTO counter (id, value) VALUES (1, 0)`);
export const updateQuery = db.query(`UPDATE counter SET value = value + 1 WHERE id = 1`);
export const selectQuery = db.query(`SELECT value as counter FROM counter WHERE id = 1`);
