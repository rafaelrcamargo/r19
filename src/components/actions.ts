"use server"

let likeCount = 0
export async function addLike() {
  console.log("addLike", likeCount)

  likeCount++
  return likeCount
}
