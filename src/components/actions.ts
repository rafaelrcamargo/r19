"use server"

import { db } from "../database"

// Increment the counter
export const update = () =>
  (
    db.query(`UPDATE counter SET value = value + 1 WHERE id = 1 RETURNING value as counter`).get() as {
      counter: number
    }
  ).counter