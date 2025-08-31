import { customAlphabet } from 'nanoid'

export const generateID = () => {
  const alphabet = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'
  const nanoid = customAlphabet(alphabet, 21)
  return nanoid()
}
