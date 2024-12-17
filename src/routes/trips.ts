import { Hono } from 'hono'
import sql from '../util/db'
import { PostgresError } from 'postgres'
import { jwt } from 'hono/jwt'
import { formatRingData, queryTrips } from '../functions/trips'

const app = new Hono()
app.use(jwt({ secret: process.env.JWT_SECRET }))

app.get('/', async (c) => {
  try {
    const ringData = await queryTrips()
    const ringTrips = formatRingData(ringData)
    return c.json(ringTrips)
  } catch (error) {
    return c.json({ message: 'An error occurred' }, 500)
  }
})

app.get('/:tripID', async (c) => {
  try {
    const ringData = await queryTrips(c.req.param('tripID'))
    const ringTrip = formatRingData(ringData)
    if (!ringTrip.length) return c.json({ error: 'Trip not found' }, 404)
    return c.json(ringTrip[0])
  } catch (error) {
    return c.json({ message: 'An error occurred' })
  }
})

app.delete('/:tripID', async (c) => {
  try {
    await sql`DELETE FROM ring_history WHERE trip_id = ${c.req.param('tripID')}`
    return c.json({ message: 'Trip deleted' })
  } catch (error) {
    const message = error instanceof PostgresError ? error.message : 'Unknown error'
    return c.json({ message }, 500)
  }
})

export default app
