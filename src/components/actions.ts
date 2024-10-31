"use server"

import { db } from "../database"

// Increment the counter
export const update = async () =>
  (
    db.query(`UPDATE counter SET value = value + 1 WHERE id = 1 RETURNING value as counter`).get() as {
      counter: number
    }
  ).counter

// Artificial delay to simulate a heavier computation
const throttle = <T>(result: T, ms: number) =>
  new Promise<T>(resolve => setTimeout(() => resolve(result), ms))

export const signup = async (_: {}, form: FormData): Promise<{ user: string }> =>
  throttle({ user: `${form.get("email")}@${form.get("password")}` }, Math.random() * 10000)
