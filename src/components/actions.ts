"use server"

let counter = 0
export async function add() {
  return new Promise<number>(resolve => {
    setTimeout(() => resolve(counter++), Math.random() * 1000)
  })
}
