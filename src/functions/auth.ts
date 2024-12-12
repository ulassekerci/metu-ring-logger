import sql from '../util/db'
import * as argon2 from 'argon2'

export interface User {
  name: string
  email: string
  password: string
}

export const authUser = async (email: string, password: string) => {
  const userData = (await sql`SELECT * FROM users WHERE email = ${email}`)[0] as User
  if (!userData) return false
  return await argon2.verify(userData.password, password)
}

export const createUser = async (user: User) => {
  const hash = await argon2.hash(user.password)
  const insertedUser = await sql`
  INSERT INTO users (name, email, password) 
  VALUES (${user.name}, ${user.email}, ${hash})
  RETURNING *
  `
  return insertedUser[0] as User
}

export const getUser = async (email: string) => {
  const user = await sql`SELECT * FROM users WHERE email = ${email}`
  return user[0] as User
}

export const updateUser = async (user: User) => {
  const updatedUser = await sql`
    UPDATE users
    SET name = ${user.name}, password = ${user.password}
    WHERE email = ${user.email}
    RETURNING *
    `
  return updatedUser[0] as User
}

export const deleteUser = async (email: string) => {
  await sql`DELETE FROM users WHERE email = ${email}`
}

export const listUsers = async () => {
  return (await sql`SELECT * FROM users`) as User[]
}
