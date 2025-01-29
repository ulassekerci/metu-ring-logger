import { Hono } from 'hono'
import { schedule } from '../data/schedule'

const app = new Hono()

app.get('/', async (c) => {
  return c.json(schedule)
})

export default app
