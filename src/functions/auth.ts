import { DateTime } from 'luxon'
import sql from '../util/db'
import * as argon2 from 'argon2'
import { sign } from 'hono/jwt'

export interface User {
  name: string
  email: string
  password: string
}

export const authUser = async (email: string, password: string) => {
  const userData = (await sql<User[]>`SELECT * FROM users WHERE email = ${email}`)[0]
  if (!userData) throw new Error('User not found')
  const isAuthed = await argon2.verify(userData.password, password)
  if (!isAuthed) throw new Error('Invalid password')
  return userData
}

export const signUser = async (user: User) => {
  const payload = {
    name: user.name,
    email: user.email,
    exp: DateTime.now().plus({ days: 1 }).toUnixInteger(),
  }
  return await sign(payload, process.env.JWT_SECRET)
}

export const createUser = async (user: User) => {
  const hash = await argon2.hash(user.password)
  const insertedUser = await sql<User[]>`
  INSERT INTO users (name, email, password) 
  VALUES (${user.name}, ${user.email}, ${hash})
  RETURNING *`
  return insertedUser[0]
}

export const getUser = async (email: string) => {
  const user = await sql<User[]>`SELECT * FROM users WHERE email = ${email}`
  return user[0]
}

export const updateUser = async (user: User) => {
  const updatedUser = await sql<User[]>`
    UPDATE users
    SET name = ${user.name}, password = ${user.password}
    WHERE email = ${user.email}
    RETURNING *`
  return updatedUser[0]
}

export const deleteUser = async (email: string) => {
  await sql`DELETE FROM users WHERE email = ${email}`
}

export const listUsers = async () => {
  return await sql<User[]>`SELECT * FROM users`
}
