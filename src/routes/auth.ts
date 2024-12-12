import { Hono } from 'hono'

const app = new Hono()

app.get('/', async (c) => {
  c.json({ error: 'Not implemented' }, 501)
})

app.post('/login', async (c) => {
  c.json({ error: 'Not implemented' }, 501)
})
