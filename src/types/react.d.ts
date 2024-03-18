import "react"

declare module "react" {
  function use<T>(data: T): T
}
