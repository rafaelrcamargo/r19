"use server"

import { db } from "../database"

// Increment the counter
export const update = () =>
  (
    db.query(`UPDATE counter SET value = value + 1 WHERE id = 1 RETURNING value as counter`).get() as {
      counter: number
    }
  ).counter

// Artificial delay to simulate a heavier computation
const throttle = (result: any, ms: number) =>
  new Promise<any>(resolve => setTimeout(() => resolve(result), ms))

export const signup = async (_: {}, form: FormData) =>
  throttle({ email: `${form.get("email")}@${form.get("password")}` }, Math.random() * 1000)
