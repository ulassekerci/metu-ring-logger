import { Hono } from 'hono'
import sql from '../util/db'
import { PostgresError } from 'postgres'
import { jwt } from 'hono/jwt'
import { formatRingData, queryTrip, queryTrips } from '../functions/trips'
import { DateTime } from 'luxon'

const app = new Hono()
app.use(jwt({ secret: process.env.JWT_SECRET }))

app.get('/', async (c) => {
  const startParam = c.req.query('start')
  const endParam = c.req.query('end')
  if (!startParam) return c.json({ message: 'Missing start date parameter' }, 400)
  const startDate = DateTime.fromISO(startParam)
  const endDate = endParam ? DateTime.fromISO(endParam) : DateTime.now()
  if (!startDate.isValid) return c.json({ message: 'Invalid start date' }, 400)
  if (!endDate.isValid) return c.json({ message: 'Invalid end date' }, 400)
  try {
    const ringData = await queryTrips({ start: startDate, end: endDate })
    const ringTrips = formatRingData(ringData)
    return c.json(ringTrips)
  } catch (error) {
    console.error(error)
    return c.json({ message: 'An error occurred' }, 500)
  }
})

app.get('/:tripID', async (c) => {
  try {
    const ringData = await queryTrip(c.req.param('tripID'))
    const ringTrip = formatRingData(ringData)
    if (!ringTrip.length) return c.json({ message: 'Trip not found' }, 404)
    return c.json(ringTrip[0])
  } catch (error) {
    return c.json({ message: 'An error occurred' }, 500)
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
