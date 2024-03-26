"use server"

// Artificial delay to simulate a heavier computation
const throttle = (x: number, ms: number) => new Promise<number>(resolve => setTimeout(() => resolve(x), ms))

let counter = 0
export const add = () => {
  counter += 1 // Increment a local state
  return throttle(counter, Math.random() * 1000)
}
