import { zValidator } from '@hono/zod-validator'
import { Hono } from 'hono'
import { z } from 'zod'
import { authUser, createUser, signUser } from '../functions/auth'
import { PostgresError } from 'postgres'
import { jwt, verify } from 'hono/jwt'

const app = new Hono()

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
})

const registerSchema = z.object({
  name: z.string(),
  email: z.string().email(),
  password: z.string(),
})

// middleware to prevent guest registration
app.use('/register', jwt({ secret: process.env.JWT_SECRET }))

app.get('/me', async (c) => {
  const token = c.req.header('Authorization')?.split(' ')[1]
  if (!token) return c.json({ message: 'Unauthorized' }, 401)
  try {
    const payload = await verify(token, process.env.JWT_SECRET)
    return c.json(payload)
  } catch (error) {
    return c.json({ message: 'Unauthorized' }, 401)
  }
})

app.post('/login', zValidator('json', loginSchema), async (c) => {
  const { email, password } = c.req.valid('json')
  try {
    const user = await authUser(email, password)
    const userToken = await signUser(user)
    return c.json({ token: userToken })
  } catch (error) {
    if (error instanceof Error) return c.json({ message: error.message }, 400)
    else return c.json('An error occurred', 500)
  }
})

app.post('/register', zValidator('json', registerSchema), async (c) => {
  const { name, email, password } = c.req.valid('json')
  try {
    const newUser = await createUser({ name, email, password })
    return c.json(newUser)
  } catch (error) {
    if (error instanceof PostgresError && error.code === '23505') {
      return c.json({ message: 'Email already in use' }, 400)
    }
    if (error instanceof Error) {
      return c.json({ message: error.message }, 400)
    } else {
      return c.json('An error occurred', 500)
    }
  }
})

export default app
