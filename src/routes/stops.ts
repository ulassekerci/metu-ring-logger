import { Hono } from 'hono'
import { stops } from '../data/stops'

const app = new Hono()

app.get('/', async (c) => {
  return c.json(stops)
})

export default app
