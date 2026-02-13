import { Request, Response, Router } from 'express'
import { ghostCache } from './cache'

const app = Router()

app.get('/', async (req: Request, res: Response) => {
  const tripsBuffer = await ghostCache.getTrips()
  res.setHeader('Content-Type', 'application/json')
  res.send(tripsBuffer)
})

export default app
